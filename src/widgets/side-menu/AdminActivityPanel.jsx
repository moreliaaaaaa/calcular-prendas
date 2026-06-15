export function AdminActivityPanel({
  visible,
  loading,
  error,
  rows,
  updatedAt,
}) {
  if (!visible) return null;

  return (
    <div 
      className="settings-card admin-panel" 
      role="region" 
      aria-label="Panel de actividad de usuarios"
      aria-live="polite"
    >
      <span className="settings-card-title">Actividad de usuarios</span>
      <p className="settings-card-copy">
        Solo tú puedes ver este ranking privado.
      </p>

      {loading ? (
        <p className="admin-panel-empty" role="status">
          Cargando ranking...
        </p>
      ) : error ? (
        <p className="admin-panel-empty is-error" role="alert">
          {error}
        </p>
      ) : rows?.length ? (
        <div className="admin-panel-list">
          {rows.map((row, index) => (
            <div className="admin-panel-item" key={row.user_id}>
              {/* Rango */}
              <div 
                className="admin-panel-rank" 
                aria-label={`Puesto número ${index + 1}`}
              >
                #{index + 1}
              </div>
              
              {/* Info del usuario */}
              <div className="admin-panel-body">
                <span className="admin-panel-name">
                  {row.display_name || row.email || "Sin nombre"}
                </span>
                
                {/* Email - solo visible en desktop, oculto en móvil si es muy largo */}
                <span className="admin-panel-email" title={row.email}>
                  {row.email}
                </span>
                
                {/* Puntuación */}
                <span className="admin-panel-meta">
                  <span className="admin-panel-score">
                    {row.activity_score} pts
                  </span>
                  <span className="admin-panel-separator" aria-hidden="true">·</span>
                  <span className="admin-panel-seconds">
                    {Number(row.active_seconds || 0)} s
                  </span>
                </span>
              </div>
              
              {/* Última vez visto */}
              <span 
                className="admin-panel-seen"
                aria-label={`Visto por última vez: ${
                  row.last_seen_at
                    ? new Date(row.last_seen_at).toLocaleString("es-ES", {
                        day: "2-digit",
                        month: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "Sin registro"
                }`}
              >
                {row.last_seen_at
                  ? new Date(row.last_seen_at).toLocaleString("es-ES", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    })
                  : ""}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="admin-panel-empty">
          Aún no hay actividad suficiente para mostrar un ranking.
        </p>
      )}

      {updatedAt ? (
        <span className="admin-panel-updated" aria-live="polite">
          Actualizado: {updatedAt}
        </span>
      ) : null}
    </div>
  );
}
