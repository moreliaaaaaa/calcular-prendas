import { SideMenu } from "@/widgets";

export function SideMenuPanel({
  open,
  settingsOpen,
  state,
  active,
  activeView,
  theme,
  user,
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
      onView={onView}
      onThemeToggle={onThemeToggle}
      onDisplayName={onDisplayName}
      onLogout={onLogout}
      actions={actions}
    />
  );
}
