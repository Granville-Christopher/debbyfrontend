import { FiDownload, FiX } from "react-icons/fi";
import { useInstallPrompt } from "../hooks/useInstallPrompt";

export const InstallPromptModal = () => {
  const { showInstallModal, promptInstall, dismissInstall } = useInstallPrompt();

  if (!showInstallModal) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 px-4 py-8">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between px-5 pt-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Install App</p>
            <h3 className="mt-1 text-lg font-semibold text-slate-900">Install Debby</h3>
          </div>
          <button
            type="button"
            onClick={dismissInstall}
            className="h-9 w-9 rounded-lg border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-700"
            aria-label="Close install prompt"
          >
            <FiX className="h-4 w-4" />
          </button>
        </div>
        <p className="px-5 mt-3 text-sm text-slate-600">
          Get a fast, app-like experience on your phone. Install Debby to your home screen in one tap.
        </p>
        <div className="flex gap-2 px-5 py-4">
          <button
            type="button"
            onClick={dismissInstall}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Not now
          </button>
          <button
            type="button"
            onClick={promptInstall}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <FiDownload className="h-4 w-4" />
            Install
          </button>
        </div>
      </div>
    </div>
  );
};
