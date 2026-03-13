import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

type InstallPromptContextValue = {
  isInstallable: boolean;
  showInstallModal: boolean;
  isPromptReady: boolean;
  promptInstall: () => Promise<void>;
  dismissInstall: () => void;
};

const InstallPromptContext = createContext<InstallPromptContextValue | null>(null);

const INSTALL_DISMISSED_KEY = "debbyInstallPromptDismissed";

const isStandaloneMode = () => {
  if (typeof window === "undefined") return false;
  const standaloneMatch = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as Navigator & { standalone?: boolean }).standalone;
  return Boolean(standaloneMatch || iosStandalone);
};

export const InstallPromptProvider = ({ children }: { children: ReactNode }) => {
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [supportsInstallPrompt, setSupportsInstallPrompt] = useState(false);
  const dismissedRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    setSupportsInstallPrompt("onbeforeinstallprompt" in window);
    try {
      dismissedRef.current = sessionStorage.getItem(INSTALL_DISMISSED_KEY) === "1";
    } catch {
      dismissedRef.current = false;
    }
    setIsStandalone(isStandaloneMode());

    const media = window.matchMedia?.("(display-mode: standalone)");
    const handleMediaChange = () => setIsStandalone(isStandaloneMode());
    media?.addEventListener?.("change", handleMediaChange);

    return () => media?.removeEventListener?.("change", handleMediaChange);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      const promptEvent = event as BeforeInstallPromptEvent;
      setInstallEvent(promptEvent);
      if (!dismissedRef.current && !isStandalone) {
        setShowInstallModal(true);
      }
    };

    const handleAppInstalled = () => {
      setInstallEvent(null);
      setShowInstallModal(false);
      dismissedRef.current = true;
      try {
        sessionStorage.setItem(INSTALL_DISMISSED_KEY, "1");
      } catch {
        // ignore storage errors
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isStandalone]);

  useEffect(() => {
    if (!supportsInstallPrompt || isStandalone) return;
    if (dismissedRef.current) return;
    if (!showInstallModal) {
      setShowInstallModal(true);
    }
  }, [supportsInstallPrompt, isStandalone, showInstallModal]);

  const promptInstall = async () => {
    if (!installEvent) {
      if (!isStandalone && supportsInstallPrompt) {
        setShowInstallModal(true);
      }
      return;
    }
    try {
      await installEvent.prompt();
      await installEvent.userChoice;
    } finally {
      setInstallEvent(null);
      setShowInstallModal(false);
      dismissedRef.current = true;
      try {
        sessionStorage.setItem(INSTALL_DISMISSED_KEY, "1");
      } catch {
        // ignore storage errors
      }
    }
  };

  const dismissInstall = () => {
    setShowInstallModal(false);
    dismissedRef.current = true;
    try {
      sessionStorage.setItem(INSTALL_DISMISSED_KEY, "1");
    } catch {
      // ignore storage errors
    }
  };

  const value = useMemo(
    () => ({
      isInstallable: supportsInstallPrompt && !isStandalone,
      showInstallModal: showInstallModal && supportsInstallPrompt && !isStandalone,
      isPromptReady: !!installEvent,
      promptInstall,
      dismissInstall,
    }),
    [installEvent, isStandalone, showInstallModal, supportsInstallPrompt]
  );

  return <InstallPromptContext.Provider value={value}>{children}</InstallPromptContext.Provider>;
};

export const useInstallPrompt = () => {
  const ctx = useContext(InstallPromptContext);
  if (!ctx) {
    return {
      isInstallable: false,
      showInstallModal: false,
      isPromptReady: false,
      promptInstall: async () => {},
      dismissInstall: () => {},
    } as InstallPromptContextValue;
  }
  return ctx;
};
