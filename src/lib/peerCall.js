import { supabase } from "./supabase";

const FALLBACK_ICE = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];
const RESTART_AFTER_MS = 4000;
const BYE_WAIT_MS = 800;

async function getIceServers() {
  try {
    const { data } = await supabase.auth.getSession();
    const response = await fetch("/api/turn", { headers: { Authorization: `Bearer ${data.session?.access_token || ""}` } });
    if (!response.ok) throw new Error(String(response.status));
    return (await response.json()).iceServers || FALLBACK_ICE;
  } catch {
    return FALLBACK_ICE;
  }
}

export const liveCallsSupported = () => Boolean(window.RTCPeerConnection && navigator.mediaDevices?.getUserMedia);

export function createPeerCall({ callId, role, video = false, onRemoteStream, onState, onMessage }) {
  let pc = null;
  let channel = null;
  let control = null;
  let local = null;
  let helloTimer = null;
  let restartTimer = null;
  let offered = false;
  let closed = false;
  const pendingIce = [];

  const send = (event, payload = {}) => channel?.send({ type: "broadcast", event, payload });
  const stopHello = () => {
    clearInterval(helloTimer);
    helloTimer = null;
  };

  async function makeOffer(options) {
    const offer = await pc.createOffer(options);
    await pc.setLocalDescription(offer);
    send("offer", { sdp: pc.localDescription.toJSON() });
  }

  async function flushIce() {
    while (pendingIce.length) await pc.addIceCandidate(pendingIce.shift()).catch(() => {});
  }

  async function start() {
    local = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: video ? { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" } : false,
    });
    if (closed) {
      local.getTracks().forEach((track) => track.stop());
      return;
    }
    pc = new RTCPeerConnection({ iceServers: await getIceServers() });
    local.getTracks().forEach((track) => pc.addTrack(track, local));
    control = pc.createDataChannel("control", { negotiated: true, id: 0 });
    control.onmessage = (event) => {
      try {
        onMessage?.(JSON.parse(event.data));
      } catch {
      }
    };
    pc.ontrack = (event) => {
      if ("jitterBufferTarget" in event.receiver) event.receiver.jitterBufferTarget = 0;
      onRemoteStream?.(event.streams[0]);
    };
    pc.onicecandidate = (event) => event.candidate && send("ice", { candidate: event.candidate.toJSON() });
    pc.onconnectionstatechange = () => {
      onState?.(pc.connectionState);
      clearTimeout(restartTimer);
      if (pc.connectionState === "disconnected" && role === "caller") {
        restartTimer = setTimeout(() => pc?.connectionState === "disconnected" && makeOffer({ iceRestart: true }).catch(() => {}), RESTART_AFTER_MS);
      }
    };

    channel = supabase.channel(`call:${callId}`, { config: { broadcast: { self: false } } });
    channel
      .on("broadcast", { event: "hello" }, () => {
        if (role === "caller" && !offered) {
          offered = true;
          stopHello();
          makeOffer().catch(() => {
            offered = false;
          });
        }
      })
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (role !== "callee") return;
        stopHello();
        await pc.setRemoteDescription(payload.sdp);
        await flushIce();
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        send("answer", { sdp: pc.localDescription.toJSON() });
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (role !== "caller" || pc.signalingState !== "have-local-offer") return;
        await pc.setRemoteDescription(payload.sdp);
        await flushIce();
      })
      .on("broadcast", { event: "ice" }, async ({ payload }) => {
        if (pc.remoteDescription) await pc.addIceCandidate(payload.candidate).catch(() => {});
        else pendingIce.push(payload.candidate);
      })
      .on("broadcast", { event: "app" }, ({ payload }) => onMessage?.(payload))
      .on("broadcast", { event: "bye" }, () => onMessage?.({ type: "bye" }));

    await new Promise((resolve, reject) => {
      channel.subscribe((status) => {
        if (status === "SUBSCRIBED") resolve();
        else if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") reject(new Error(`Signalling ${status}`));
      });
    });
    send("hello", { role });
    helloTimer = setInterval(() => send("hello", { role }), 1000);
  }

  function close({ notify = true } = {}) {
    if (closed && !pc && !channel) return;
    closed = true;
    stopHello();
    clearTimeout(restartTimer);
    local?.getTracks().forEach((track) => track.stop());
    const lastPc = pc;
    const lastChannel = channel;
    if (lastPc) lastPc.onconnectionstatechange = null;
    let delivered = Promise.resolve();
    if (notify) {
      if (control?.readyState === "open") control.send(JSON.stringify({ type: "bye" }));
      delivered = Promise.race([Promise.resolve(send("bye")), new Promise((resolve) => setTimeout(resolve, BYE_WAIT_MS))]);
    }
    pc = null;
    channel = null;
    control = null;
    local = null;
    delivered
      .catch(() => {})
      .finally(() => {
        lastPc?.close();
        if (lastChannel) supabase.removeChannel(lastChannel);
      });
  }

  return {
    start,
    close,
    sendApp: (payload) => (control?.readyState === "open" ? control.send(JSON.stringify(payload)) : send("app", payload)),
    localStream: () => local,
    setMuted: (muted) => local?.getAudioTracks().forEach((track) => (track.enabled = !muted)),
    async quality() {
      if (!pc) return null;
      const stats = await pc.getStats();
      let pair = null;
      let inbound = null;
      stats.forEach((report) => {
        if (report.type === "transport" && report.selectedCandidatePairId) pair = stats.get(report.selectedCandidatePairId);
        if (report.type === "inbound-rtp" && report.kind === "audio") inbound = report;
      });
      if (!pair) stats.forEach((report) => report.type === "candidate-pair" && report.nominated && report.state === "succeeded" && (pair = report));
      if (!pair) return null;
      const candidate = stats.get(pair.localCandidateId);
      const emitted = inbound?.jitterBufferEmittedCount || 0;
      return {
        type: candidate?.candidateType || null,
        protocol: candidate?.relayProtocol || candidate?.protocol || null,
        roundTrip: pair.currentRoundTripTime === undefined ? null : Math.round(pair.currentRoundTripTime * 1000),
        buffer: emitted ? Math.round((inbound.jitterBufferDelay / emitted) * 1000) : null,
      };
    },
  };
}
