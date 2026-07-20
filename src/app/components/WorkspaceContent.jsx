import { FabricView, GarmentsView } from "@/features";

export function WorkspaceContent({ activeView, active, actions, user }) {
  return (
    <div className="content-scroll">
      {activeView === "garments" ? (
        <GarmentsView active={active} actions={actions} user={user} />
      ) : (
        <FabricView active={active} actions={actions} user={user} />
      )}
    </div>
  );
}
