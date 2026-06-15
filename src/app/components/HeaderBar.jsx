import { Header } from "@/widgets";

export function HeaderBar({
  activeView,
  activeTitle,
  displayName,
  syncStatus,
  installAvailable,
  onMenu,
  onAddSection,
  onSync,
  onInstall,
  onNew,
}) {
  return (
    <Header
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
  );
}
