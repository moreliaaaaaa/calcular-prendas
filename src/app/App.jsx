import "@/styles/modules/dark-mode.css";
import "@/styles/modules/responsive.css";
import { AuthGate } from "@/app/components/AuthGate.jsx";
import { WorkspaceShell } from "@/app/components/WorkspaceShell.jsx";
import { useAppController } from "@/app/hooks/useAppController.js";

export default function App() {
  const app = useAppController();

  if (!app.authReady && app.requiresAuth) {
    return (
      <AuthGate
        visible
        message={app.authMessage}
        messageType={app.authMessageType}
        loading={app.authLoading}
        onLogin={app.login}
        onSignup={app.signup}
        onRecover={app.recoverPassword}
        toast={app.toast}
      />
    );
  }
  

  return (
    <WorkspaceShell
      activeView={app.activeView}
      activeTitle={app.activeTitle}
      displayName={app.displayName}
      isAdmin={app.isAdmin}
      adminActivity={app.adminActivity}
      adminActivityLoading={app.adminActivityLoading}
      adminActivityError={app.adminActivityError}
      adminActivityUpdatedAt={app.adminActivityUpdatedAt}
      syncStatus={app.syncStatus}
      installAvailable={Boolean(app.installPrompt)}
      menuOpen={app.menuOpen}
      settingsOpen={app.settingsOpen}
      state={app.state}
      active={app.active}
      theme={app.theme}
      user={app.user}
      toast={app.toast}
      onMenu={() => app.setMenuOpen(true)}
      onAddSection={app.addSectionOrBlock}
      onSync={app.syncNow}
      onInstall={app.installApp}
      onNew={app.createNew}
      onCloseMenu={() => {
        app.setMenuOpen(false);
        app.setSettingsOpen(false);
      }}
      onSettingsOpen={() => app.setSettingsOpen(true)}
      onSettingsClose={() => app.setSettingsOpen(false)}
      onView={(view) => {
        app.setActiveView(view);
        app.setMenuOpen(false);
      }}
      onThemeToggle={() =>
        app.setTheme((value) => (value === "dark" ? "light" : "dark"))
      }
      onDisplayName={app.updateDisplayName}
      onLogout={app.logout}
      actions={app.actions}
    />
  );
}
