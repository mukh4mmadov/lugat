import { useState, useEffect, useRef } from "react";

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isUnsupported, setIsUnsupported] = useState(false);
  const deferredPrompt = useRef(null);

  useEffect(() => {
    const isIosDevice =
      typeof window !== "undefined" &&
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      !window.MSStream &&
      /Safari/.test(navigator.userAgent);

    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone;

    if (isIosDevice && !isStandalone) {
      setIsIOS(true);
    } else if (!isStandalone) {
      setIsUnsupported(true);
    }

    const handler = (e) => {
      e.preventDefault();
      deferredPrompt.current = e;
      setCanInstall(true);
      setIsUnsupported(false);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const triggerInstall = async () => {
    if (!deferredPrompt.current) {
      setIsUnsupported(true);
      return "unsupported";
    }
    deferredPrompt.current.prompt();
    const { outcome } = await deferredPrompt.current.userChoice;
    if (outcome === "accepted") {
      setCanInstall(false);
    }
    deferredPrompt.current = null;
    return outcome;
  };

  return { canInstall, isIOS, isUnsupported, triggerInstall };
}
