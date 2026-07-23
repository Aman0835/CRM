import { useState, useEffect } from "react";
import { FiDownload, FiX, FiShare } from "react-icons/fi";

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);
    const [showBanner, setShowBanner] = useState(false);
    const [isIos, setIsIos] = useState(false);
    const [isStandalone, setIsStandalone] = useState(false);

    useEffect(() => {
        // Check if app is already installed in standalone mode
        const inStandaloneMode = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
        if (inStandaloneMode) {
            setIsStandalone(true);
            return;
        }

        // Check for iOS Safari
        const userAgent = window.navigator.userAgent.toLowerCase();
        const iosDevice = /iphone|ipad|ipod/.test(userAgent);
        if (iosDevice && !inStandaloneMode) {
            setIsIos(true);
            setShowBanner(true);
        }

        // Listen for Chrome/Android/Edge beforeinstallprompt event
        const handleBeforeInstallPrompt = (e) => {
            e.preventDefault();
            setDeferredPrompt(e);
            setShowBanner(true);
        };

        window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === "accepted") {
            setShowBanner(false);
        }
        setDeferredPrompt(null);
    };

    if (isStandalone || !showBanner) return null;

    return (
        <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md rounded-2xl border border-blue-500/30 bg-slate-900/95 p-4 text-white shadow-2xl backdrop-blur-md dark:bg-slate-900/95">
            <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 font-bold text-white shadow-md shadow-blue-500/20">
                        📱
                    </div>
                    <div>
                        <h4 className="text-xs font-bold tracking-wide">Install Diva Employee App</h4>
                        <p className="text-[11px] text-slate-300 mt-0.5">
                            {isIos
                                ? "Tap Share icon below → Add to Home Screen"
                                : "Install on your home screen for fast 1-tap access."}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                    {!isIos && deferredPrompt && (
                        <button
                            type="button"
                            onClick={handleInstallClick}
                            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-500 transition shadow-sm"
                        >
                            <FiDownload className="text-xs" /> Install
                        </button>
                    )}
                    {isIos && (
                        <span className="flex items-center gap-1 rounded-xl bg-blue-600/30 px-2.5 py-1 text-[10px] font-bold text-blue-300">
                            <FiShare className="text-xs" /> Share
                        </span>
                    )}
                    <button
                        type="button"
                        onClick={() => setShowBanner(false)}
                        className="rounded-lg p-1 text-slate-400 hover:text-white transition"
                        aria-label="Close install prompt"
                    >
                        <FiX className="text-base" />
                    </button>
                </div>
            </div>
        </div>
    );
}
