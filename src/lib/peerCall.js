import { supabase } from "./supabase";

const FALLBACK_ICE = [{ urls: ["stun:stun.cloudflare.com:3478", "stun:stun.l.google.com:19302"] }];

// STUN, plus TURN when the server has it configured (api/turn.js).
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

// One call between two learners: WebRTC media peer to peer, with the offer,
// answer and ICE candidates passed through a Supabase Realtime broadcast
// channel named after the call. Both sides say "hello" until they hear each
// other; then the caller sends the offer. Audio only by default; pass
// video: true to send the camera as well.
//
// Callbacks: onRemoteStream(stream), onState(connectionState),
// onMessage(payload) for app messages and { type: "bye" } when the other side
// hangs up.
export function createPeerCall({ callId, role, video = false, onRemoteStream, onState, onMessage }) {
  let pc = null;
  let channel = null;
  let local = null;
  let helloTimer = null;
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
    pc.ontrack = (event) => onRemoteStream?.(event.streams[0]);
    pc.onicecandidate = (event) => event.candidate && send("ice", { candidate: event.candidate.toJSON() });
    pc.onconnectionstatechange = () => {
      onState?.(pc.connectionState);
      // A dropped network path: the caller asks for fresh candidates.
      if (pc.connectionState === "failed" && role === "caller") makeOffer({ iceRestart: true }).catch(() => {});
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
    if (notify) send("bye");
    local?.getTracks().forEach((track) => track.stop());
    pc?.close();
    if (channel) supabase.removeChannel(channel);
    pc = null;
    channel = null;
    local = null;
  }

  return {
    start,
    close,
    sendApp: (payload) => send("app", payload),
    setMuted: (muted) => local?.getAudioTracks().forEach((track) => (track.enabled = !muted)),
    // "relay" means the call goes through TURN; "host"/"srflx" are direct.
    async connectionType() {
      if (!pc) return null;
      const stats = await pc.getStats();
      let pair = null;
      stats.forEach((report) => {
        if (report.type === "transport" && report.selectedCandidatePairId) pair = stats.get(report.selectedCandidatePairId);
      });
      if (!pair) stats.forEach((report) => report.type === "candidate-pair" && report.nominated && report.state === "succeeded" && (pair = report));
      return pair ? stats.get(pair.localCandidateId)?.candidateType || null : null;
    },
  };
}
