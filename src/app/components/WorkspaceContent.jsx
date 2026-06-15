import { FabricView, GarmentsView } from "@/features";

export function WorkspaceContent({ activeView, active, actions }) {
  return (
    <div className="content-scroll">
      {activeView === "garments" ? (
        <GarmentsView active={active} actions={actions} />
      ) : (
        <FabricView active={active} actions={actions} />
      )}
    </div>
  );
}
