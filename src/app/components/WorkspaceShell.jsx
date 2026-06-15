import { Toast } from "@/shared";
import { HeaderBar } from "./HeaderBar.jsx";
import { SideMenuPanel } from "./SideMenuPanel.jsx";
import { WorkspaceContent } from "./WorkspaceContent.jsx";

export function WorkspaceShell({
  activeView,
  activeTitle,
  displayName,
  syncStatus,
  installAvailable,
  menuOpen,
  settingsOpen,
  state,
  active,
  theme,
  user,
  isAdmin,
  adminActivity,
  adminActivityLoading,
  adminActivityError,
  adminActivityUpdatedAt,
  toast,
  onMenu,
  onAddSection,
  onSync,
  onInstall,
  onNew,
  onCloseMenu,
  onSettingsOpen,
  onSettingsClose,
  onView,
  onThemeToggle,
  onDisplayName,
  onLogout,
  actions,
}) {
  if (!state || !active) {
    return <div className="app-container"></div>;
  }

  return (
    <>
      <div className="app-container">
        <HeaderBar
          activeView={activeView}
          activeTitle={activeTitle}
          displayName={displayName}
          syncStatus={syncStatus}
          installAvailable={installAvailable}
          onMenu={onMenu}
          onAddSection={onAddSection}
          onSync={onSync}
          onInstall={onInstall}
          onNew={onNew}
        />

        <SideMenuPanel
          open={menuOpen}
          settingsOpen={settingsOpen}
          state={state}
          active={active}
          activeView={activeView}
          theme={theme}
          user={user}
          displayName={displayName}
          isAdmin={isAdmin}
          adminActivity={adminActivity}
          adminActivityLoading={adminActivityLoading}
          adminActivityError={adminActivityError}
          adminActivityUpdatedAt={adminActivityUpdatedAt}
          onClose={onCloseMenu}
          onSettingsOpen={onSettingsOpen}
          onSettingsClose={onSettingsClose}
          onView={onView}
          onThemeToggle={onThemeToggle}
          onDisplayName={onDisplayName}
          onLogout={onLogout}
          actions={actions}
        />

        <WorkspaceContent activeView={activeView} active={active} actions={actions} />
      </div>
      <Toast toast={toast} />
    </>
  );
}
