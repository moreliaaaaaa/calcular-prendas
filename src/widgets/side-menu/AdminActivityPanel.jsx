export function AdminActivityPanel({
  visible,
  loading,
  error,
  rows,
  updatedAt,
  onOpen,
}) {
  if (!visible) return null;

  const totalUsers = Array.isArray(rows) ? rows.length : 0;

  return (
    <section className="settings-card admin-activity-entry">
      <span className="settings-card-title">Actividad de usuarios</span>
      <p className="settings-card-copy">
       usuarios activos, recientes
      </p>
      <button
        className="settings-action-btn admin-activity-open"
        type="button"
        onClick={onOpen}
      >
        <span>ranking de usuarios</span>
        <span className="admin-activity-open-count">
          {loading ? "Actualizando" : `${totalUsers} registrados`}
        </span>
      </button>
      {error ? (
        <p className="admin-panel-empty is-error" role="alert">
          {error}
        </p>
      ) : null}
      {updatedAt ? (
        <span className="admin-panel-updated" role="status">
          Última consulta: {updatedAt}
        </span>
      ) : null}
    </section>
  );
}
