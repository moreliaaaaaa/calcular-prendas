import { useCallback, useEffect, useState } from "react";

export function useInstallPrompt({ showToast }) {
  const [installPrompt, setInstallPrompt] = useState(null);

  useEffect(() => {
    const beforeInstall = (event) => {
      event.preventDefault();
      setInstallPrompt(event);
    };

    const installed = () => {
      setInstallPrompt(null);
      showToast("Aplicación instalada", "success");
    };

    window.addEventListener("beforeinstallprompt", beforeInstall);
    window.addEventListener("appinstalled", installed);

    if ("serviceWorker" in navigator) {
      if (import.meta.env.DEV) {
        try {
          navigator.serviceWorker.getRegistrations().then((regs) => {
            regs.forEach((registration) => registration.unregister());
          });
        } catch (error) {
          console.log("No se pudo desregistrar Service Workers:", error);
        }

        try {
          if (window.caches && caches.keys) {
            caches
              .keys()
              .then((names) => Promise.all(names.map((name) => caches.delete(name))));
          }
        } catch (error) {
          console.log("No se pudieron limpiar caches:", error);
        }
      } else {
        navigator.serviceWorker
          .register("/service-worker.js")
          .catch((error) => {
            console.log("Error:", error);
          });
      }
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", beforeInstall);
      window.removeEventListener("appinstalled", installed);
    };
  }, [showToast]);

  const installApp = useCallback(async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  }, [installPrompt]);

  return { installPrompt, installApp };
}
