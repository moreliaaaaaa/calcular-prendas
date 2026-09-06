import { Header } from "@/widgets";

export function HeaderBar({
  activeView,
  activeTitle,
  displayName,
  installAvailable,
  onMenu,
  onAddSection,
  onInstall,
  onNew,
}) {
  return (
    <Header
      activeView={activeView}
      activeTitle={activeTitle}
      displayName={displayName}
      installAvailable={installAvailable}
      onMenu={onMenu}
      onAddSection={onAddSection}
      onInstall={onInstall}
      onNew={onNew}
    />
  );
}
