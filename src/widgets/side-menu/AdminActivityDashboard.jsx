const ACTIVE_WINDOW_MS = 5 * 60 * 1000;
const RECENT_WINDOW_MS = 24 * 60 * 60 * 1000;

function toTimestamp(value) {
  const timestamp = value ? new Date(value).getTime() : 0;
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function formatDuration(value) {
  const totalSeconds = Math.max(0, Number(value) || 0);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours) return `${hours} h ${minutes} min`;
  if (minutes) return `${minutes} min`;
  return `${seconds} s`;
}

function formatLastSeen(value) {
  const timestamp = toTimestamp(value);
  if (!timestamp) return "Sin registro";

  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));
}

function ActivityRanking({ title, description, rows, tone }) {
  return (
    <section
      className="activity-ranking-section"
      aria-labelledby={`activity-${tone}`}
    >
      <div className="activity-ranking-heading">
        <div>
          <h3 id={`activity-${tone}`}>{title}</h3>
          <p>{description}</p>
        </div>
        <span className={`activity-ranking-count is-${tone}`}>
          {rows.length}
        </span>
      </div>

      {rows.length ? (
        <ol className="activity-ranking-list">
          {rows.map((row) => (
            <li className="activity-ranking-item" key={row.user_id}>
              <div className="activity-ranking-user">
                <span className="activity-ranking-name">
                  {row.display_name || row.email || "Sin nombre"}
                </span>
                <span className="activity-ranking-email">
                  {row.email || "Sin correo"}
                </span>
              </div>
              <div className="activity-ranking-metrics">
                <span>{Number(row.activity_score || 0)} interacciones</span>
                <span>{formatDuration(row.active_seconds)}</span>
              </div>
              <time dateTime={row.last_seen_at || undefined}>
                {formatLastSeen(row.last_seen_at)}
              </time>
            </li>
          ))}
        </ol>
      ) : (
        <p className="activity-ranking-empty">No hay usuarios en este grupo.</p>
      )}
    </section>
  );
}

export function AdminActivityDashboard({
  visible,
  loading,
  error,
  rows,
  updatedAt,
  onClose,
}) {
  const now = Date.now();
  const activityRows = Array.isArray(rows) ? rows : [];
  const activeRows = activityRows
    .filter((row) => now - toTimestamp(row.last_seen_at) <= ACTIVE_WINDOW_MS)
    .sort(
      (first, second) =>
        Number(second.activity_score || 0) - Number(first.activity_score || 0),
    );
  const recentRows = activityRows
    .filter((row) => {
      const elapsed = now - toTimestamp(row.last_seen_at);
      return elapsed > ACTIVE_WINDOW_MS && elapsed <= RECENT_WINDOW_MS;
    })
    .sort(
      (first, second) =>
        toTimestamp(second.last_seen_at) - toTimestamp(first.last_seen_at),
    );
  const inactiveRows = activityRows
    .filter((row) => {
      const elapsed = now - toTimestamp(row.last_seen_at);
      return !toTimestamp(row.last_seen_at) || elapsed > RECENT_WINDOW_MS;
    })
    .sort(
      (first, second) =>
        toTimestamp(second.last_seen_at) - toTimestamp(first.last_seen_at),
    );

  if (!visible) return null;

  return (
    <div
      className="admin-activity-modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <section
        id="admin-activity-dialog"
        className="admin-activity-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-activity-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="admin-activity-dialog-header">
          <button
            className="settings-back-btn"
            type="button"
            aria-label="Cerrar ranking de usuarios"
            onClick={onClose}
          >
            <span>volver</span>
          </button>

          <div className="admin-activity-title-block">
            <span id="admin-activity-title" className="settings-layer-title">
              Ranking de usuarios
            </span>
          </div>

          <span className="admin-activity-header-spacer" aria-hidden="true" />
        </div>

        <div className="admin-activity-dialog-body">
          {error ? (
            <p className="admin-panel-empty is-error" role="alert">
              {error}
            </p>
          ) : null}

          {loading && !activityRows.length ? (
            <p className="admin-panel-empty" role="status">
              Cargando actividad...
            </p>
          ) : null}

          <div className="admin-activity-grid">
            <ActivityRanking
              title="Activos ahora"
              description="Usuarios conectados recientemente"
              rows={activeRows}
              tone="active"
            />
            <ActivityRanking
              title="Usuarios inactivos"
              description="No registran actividad desde hace mas de un dia"
              rows={inactiveRows}
              tone="inactive"
            />
            <ActivityRanking
              title="Actividad reciente"
              description="Usuarios que estuvieron hoy"
              rows={recentRows}
              tone="recent"
            />
          </div>

          {updatedAt ? (
            <span className="admin-panel-updated" role="status">
              Ultima consulta: {updatedAt}
            </span>
          ) : null}
        </div>
      </section>
    </div>
  );
}
