import { useCallback, useMemo, useState } from "react";
import { useAdminActivity } from "@/app/hooks/useAdminActivity.js";
import { useAuthController } from "@/app/hooks/useAuthController.js";
import { useCalculatorActions } from "@/app/hooks/useCalculatorActions.js";
import { useInstallPrompt } from "@/app/hooks/useInstallPrompt.js";
import { useRemoteStateSync } from "@/app/hooks/useRemoteStateSync.js";
import { useToast } from "@/app/hooks/useToast.js";
import { useUserActivityHeartbeat } from "@/app/hooks/useUserActivityHeartbeat.js";
import { useTheme } from "@/shared";
import {
  DEFAULT_SECTION_TITLES,
  createFabricBlock,
  createFabricPurchase,
  createOperation,
  createSection,
  fabricPurchaseDisplayName,
} from "@/shared/lib/store.js";

export function useAppController() {
  const [theme, setTheme] = useTheme();
  const [activeView, setActiveView] = useState("garments");
  const [menuOpen, setMenuOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { toast, showToast } = useToast();

  const {
    user,
    authReady,
    authMessage,
    authMessageType,
    authLoading,
    passwordRecoveryMode,
    requiresAuth,
    displayName,
    isAdmin,
    login,
    signup,
    recoverPassword,
    updatePassword,
    updateDisplayName,
    logout,
  } = useAuthController({ showToast });

  const { state, active, syncStatus, saveState, persistRemote } =
    useRemoteStateSync({
      authReady,
      requiresAuth,
      user,
    });

  useUserActivityHeartbeat({
    authReady,
    displayName,
    user,
  });

  const {
    adminActivity,
    adminActivityLoading,
    adminActivityError,
    adminActivityUpdatedAt,
    loadAdminActivity,
  } = useAdminActivity({ authReady, isAdmin });

  const { installPrompt, installApp } = useInstallPrompt({ showToast });

  const actions = useCalculatorActions({
    active,
    saveState,
    showToast,
    state,
    setActiveView,
    setMenuOpen,
  });

  const activeTitle = useMemo(() => {
    if (!active) return "";

    if (activeView === "fabric") {
      const fabric =
        active.fabricPurchases.find(
          (item) => item.id === active.activeFabricId,
        ) || active.fabricPurchases[0];
      return fabric ? fabricPurchaseDisplayName(fabric) : "Compra de telas";
    }

    return active.name;
  }, [active, activeView]);

  const addSectionOrBlock = useCallback(() => {
    if (activeView === "fabric") {
      saveState((draft) => {
        const operation =
          draft.operations.find((item) => item.id === draft.activeId) ||
          draft.operations[0];
        const fabric =
          operation.fabricPurchases.find(
            (item) => item.id === operation.activeFabricId,
          ) || operation.fabricPurchases[0];
        fabric.blocks.push(createFabricBlock(fabric.blocks.length));
      });
      showToast("Bloque de telas agregado", "success");
      return;
    }

    saveState((draft) => {
      const operation =
        draft.operations.find((item) => item.id === draft.activeId) ||
        draft.operations[0];
      operation.sections.push(
        createSection(
          `${DEFAULT_SECTION_TITLES.generic} ${operation.sections.length + 1}`,
        ),
      );
    });
    showToast("Bloque agregado", "success");
  }, [activeView, saveState, showToast]);

  const createNew = useCallback(() => {
    if (activeView === "fabric") {
      saveState((draft) => {
        const operation =
          draft.operations.find((item) => item.id === draft.activeId) ||
          draft.operations[0];
        const fabric = createFabricPurchase(operation.fabricPurchases.length);
        operation.fabricPurchases.push(fabric);
        operation.activeFabricId = fabric.id;
      });
      showToast("Compra de telas creada", "success");
      return;
    }

    saveState((draft) => {
      const operation = createOperation(null, {
        kids: [{ size: "", qty: 0, price: 0, priceManual: false }],
        adults: [{ size: "", qty: 0, price: 0, priceManual: false }],
      });
      draft.operations.push(operation);
      draft.activeId = operation.id;
    });
    showToast("Operación creada", "success");
  }, [activeView, saveState, showToast]);

  const syncNow = useCallback(() => {
    if (!state) return;
    void persistRemote(state, true);
    showToast("Sincronización solicitada", "success");
  }, [persistRemote, showToast, state]);

  return {
    theme,
    setTheme,
    user,
    authReady,
    authMessage,
    authMessageType,
    authLoading,
    passwordRecoveryMode,
    state,
    active,
    activeView,
    activeTitle,
    requiresAuth,
    displayName,
    isAdmin,
    menuOpen,
    settingsOpen,
    toast,
    adminActivity,
    adminActivityLoading,
    adminActivityError,
    adminActivityUpdatedAt,
    loadAdminActivity,
    syncStatus,
    installPrompt,
    actions,
    persistRemote,
    showToast,
    login,
    signup,
    recoverPassword,
    updatePassword,
    addSectionOrBlock,
    createNew,
    updateDisplayName,
    logout,
    syncNow,
    installApp,
    setMenuOpen,
    setSettingsOpen,
    setActiveView,
  };
}
