import { SideMenu } from "@/widgets";

export function SideMenuPanel({
  open,
  settingsOpen,
  state,
  active,
  activeView,
  theme,
  user,
  syncStatus,
  displayName,
  isAdmin,
  adminActivity,
  adminActivityLoading,
  adminActivityError,
  adminActivityUpdatedAt,
  onAdminActivityRefresh,
  onClose,
  onSettingsOpen,
  onSettingsClose,
  onSync,
  onView,
  onThemeToggle,
  onDisplayName,
  onLogout,
  actions,
}) {
  return (
    <SideMenu
      open={open}
      settingsOpen={settingsOpen}
      state={state}
      active={active}
      activeView={activeView}
      theme={theme}
      user={user}
      syncStatus={syncStatus}
      displayName={displayName}
      isAdmin={isAdmin}
      adminActivity={adminActivity}
      adminActivityLoading={adminActivityLoading}
      adminActivityError={adminActivityError}
      adminActivityUpdatedAt={adminActivityUpdatedAt}
      onAdminActivityRefresh={onAdminActivityRefresh}
      onClose={onClose}
      onSettingsOpen={onSettingsOpen}
      onSettingsClose={onSettingsClose}
      onSync={onSync}
      onView={onView}
      onThemeToggle={onThemeToggle}
      onDisplayName={onDisplayName}
      onLogout={onLogout}
      actions={actions}
    />
  );
}
