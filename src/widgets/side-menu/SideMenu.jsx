import { useRef, useState, useEffect, useCallback } from "react";
import { icon } from "@/shared/assets/icons.js";
import { EditableText } from "@/shared/ui/EditableText.jsx";
import {
  fabricPurchaseDateLabel,
  fabricPurchaseDisplayName,
} from "@/shared/lib/store.js";
import { AdminActivityPanel } from "./AdminActivityPanel.jsx";
import "@/styles/modules/menu-settings.css";

export function SideMenu({
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
  onClose,
  onSettingsOpen,
  onSettingsClose,
  onView,
  onThemeToggle,
  onDisplayName,
  onLogout,
  actions,
}) {
  console.log("USER:", user);

  const fabrics = active?.fabricPurchases || [];
  const deletedFabrics = active?.deletedFabricPurchases || [];

  const [editTarget, setEditTarget] = useState("");
  const [editSignal, setEditSignal] = useState(0);

  const menuRef = useRef(null);
  const closeBtnRef = useRef(null);
  const menuClickTimer = useRef(null);
  const [deletedLayerOpen, setDeletedLayerOpen] = useState(false);

  // ✅ Bloquear scroll del body cuando el menú está abierto
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      setTimeout(() => closeBtnRef.current?.focus(), 100);
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // ✅ Cerrar menú con tecla Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        if (settingsOpen) {
          onSettingsClose();
        } else {
          onClose();
        }
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, settingsOpen, onClose, onSettingsClose]);

  const triggerEdit = useCallback((target) => {
    clearTimeout(menuClickTimer.current);
    setEditTarget(target);
    setEditSignal((value) => value + 1);
  }, []);

  const scheduleSelect = useCallback((selectFn) => {
    clearTimeout(menuClickTimer.current);
    menuClickTimer.current = setTimeout(selectFn, 180);
  }, []);

  const handleItemKeyDown = useCallback(
    (event, selectFn, editTargetKey) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        scheduleSelect(selectFn);
      }
      if (event.key === "F2") {
        event.preventDefault();
        triggerEdit(editTargetKey);
      }
    },
    [scheduleSelect, triggerEdit],
  );

  const handleLogout = useCallback(() => {
    if (window.confirm("¿Estás seguro de que deseas salir?")) {
      onLogout();
    }
  }, [onLogout]);

  const handleSaveDisplayName = useCallback(() => {
    const input = document.getElementById("display-name-input");
    if (input) {
      onDisplayName(input.value || "");
    }
  }, [onDisplayName]);

  return (
    <>
      {/* Overlay */}
      <div
        id="menu-overlay"
        className={`menu-overlay ${open ? "open" : ""}`}
        onClick={onClose}
        aria-hidden={!open}
      />

      {/* Side Menu */}
      <aside
        id="side-menu"
        ref={menuRef}
        className={`side-menu ${open ? "open" : ""}`}
        aria-hidden={!open}
        aria-label="Menú lateral"
      >
        {/* Header */}
        <div className="menu-header">
          <div
            className="menu-brand"
            aria-label="Morelia"
          >
            <img
              className="menu-logo"
              src="/marca/logo-morelia.svg"
              width="44"
              height="40"
              alt=""
              aria-hidden="true"
            />
            <span
              className="menu-brand-name"
              aria-hidden="true"
            >
              ORELIA
            </span>
          </div>

          <div className="menu-header-actions">
            <button
              id="settings-toggle-btn"
              className="settings-toggle-btn"
              type="button"
              aria-label="Abrir configuración"
              aria-expanded={settingsOpen}
              aria-controls="settings-layer"
              onClick={onSettingsOpen}
            >
              <img
                className="settings-inline-icon"
                src={icon("settings")}
                alt=""
                aria-hidden="true"
              />
            </button>

            <button
              id="close-menu"
              ref={closeBtnRef}
              className="close-btn"
              type="button"
              aria-label="Cerrar menú"
              onClick={onClose}
            >
              <img
                className="close-menu-icon"
                src={icon("x_circle")}
                alt=""
                aria-hidden="true"
              />
            </button>
          </div>
        </div>

        {/* Panel de Prendas */}
        <div
          id="menu-garments-panel"
          className={activeView === "fabric" ? "hidden" : ""}
          aria-hidden={activeView === "fabric"}
        >
          {/* Operaciones activas */}
          <div
            id="operations-container"
            className="operations-container"
          >
            {state.operations.map((operation) => (
              <div
                className="operation-row"
                key={operation.id}
              >
                <div
                  className={`operation-item ${operation.id === state.activeId ? "active" : ""}`}
                  role="button"
                  tabIndex="0"
                  aria-label={`Operación: ${operation.name}${operation.id === state.activeId ? " (activa)" : ""}`}
                  aria-current={
                    operation.id === state.activeId ? "true" : undefined
                  }
                  onClick={() =>
                    scheduleSelect(() => actions.selectOperation(operation.id))
                  }
                  onDoubleClick={() => triggerEdit(`operation:${operation.id}`)}
                  onKeyDown={(e) =>
                    handleItemKeyDown(
                      e,
                      () => actions.selectOperation(operation.id),
                      `operation:${operation.id}`,
                    )
                  }
                >
                  <EditableText
                    value={operation.name}
                    label="Renombrar operación"
                    editSignal={
                      editTarget === `operation:${operation.id}`
                        ? editSignal
                        : 0
                    }
                    onSave={(value) =>
                      actions.renameOperation(operation.id, value)
                    }
                  />
                </div>

                <button
                  className="op-action rename"
                  type="button"
                  aria-label={`Renombrar operación "${operation.name}"`}
                  onClick={() => triggerEdit(`operation:${operation.id}`)}
                >
                  <img
                    src={icon("pencil")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>

                <button
                  className="op-action delete"
                  type="button"
                  aria-label={`Eliminar operación "${operation.name}"`}
                  onClick={() => actions.deleteOperation(operation.id)}
                >
                  <img
                    src={icon("contenedor-de-basura")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Botones de vista (siempre visibles) */}
        <div className="menu-view-actions">
          <button
            id="open-garments-view"
            className={`menu-view-btn ${activeView === "garments" ? "active" : ""}`}
            type="button"
            aria-pressed={activeView === "garments"}
            onClick={() => onView("garments")}
          >
            Calculadora de prendas
          </button>
          <button
            id="open-fabric-view"
            className={`menu-view-btn ${activeView === "fabric" ? "active" : ""}`}
            type="button"
            aria-pressed={activeView === "fabric"}
            onClick={() => onView("fabric")}
          >
            Compra de telas
          </button>
          {/* boton eliminados */}
          <button
            id="open-deleted-view"
            className="menu-view-btn"
            type="button"
            aria-pressed={deletedLayerOpen}
            onClick={() => setDeletedLayerOpen(true)}
          >
            Eliminados
          </button>
        </div>

        {/* Panel de Telas */}
        <div
          id="menu-fabric-panel"
          className={`fabric-pages-section ${activeView === "fabric" ? "" : "hidden"}`}
          aria-hidden={activeView !== "fabric"}
        >
          <span className="deleted-operations-title">Compras de telas</span>
          <div
            id="fabric-pages-container"
            className="operations-container"
          >
            {fabrics.map((fabricPurchase) => (
              <div
                className="operation-row"
                key={fabricPurchase.id}
              >
                <div
                  className={`operation-item ${fabricPurchase.id === active?.activeFabricId ? "active" : ""}`}
                  role="button"
                  tabIndex="0"
                  aria-label={`Compra: ${fabricPurchaseDisplayName(fabricPurchase)}${fabricPurchase.id === active?.activeFabricId ? " (activa)" : ""}`}
                  aria-current={
                    fabricPurchase.id === active?.activeFabricId
                      ? "true"
                      : undefined
                  }
                  onClick={() =>
                    scheduleSelect(() =>
                      actions.selectFabricPage(fabricPurchase.id),
                    )
                  }
                  onDoubleClick={() =>
                    triggerEdit(`fabric:${fabricPurchase.id}`)
                  }
                  onKeyDown={(e) =>
                    handleItemKeyDown(
                      e,
                      () => actions.selectFabricPage(fabricPurchase.id),
                      `fabric:${fabricPurchase.id}`,
                    )
                  }
                >
                  <EditableText
                    value={fabricPurchaseDisplayName(fabricPurchase)}
                    label="Renombrar compra de telas"
                    editSignal={
                      editTarget === `fabric:${fabricPurchase.id}`
                        ? editSignal
                        : 0
                    }
                    onSave={(value) =>
                      actions.renameFabricPage(fabricPurchase.id, value)
                    }
                  />
                </div>

                <button
                  className="op-action rename"
                  type="button"
                  aria-label={`Renombrar compra "${fabricPurchaseDisplayName(fabricPurchase)}"`}
                  onClick={() => triggerEdit(`fabric:${fabricPurchase.id}`)}
                >
                  <img
                    src={icon("pencil")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>

                <button
                  className="op-action delete"
                  type="button"
                  aria-label={`Eliminar compra "${fabricPurchaseDisplayName(fabricPurchase)}"`}
                  onClick={() => actions.deleteFabricPage(fabricPurchase.id)}
                >
                  <img
                    src={icon("contenedor-de-basura")}
                    alt=""
                    aria-hidden="true"
                  />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Capa de Configuración */}
        <div
          id="settings-layer"
          className={`settings-layer ${settingsOpen ? "open" : ""}`}
          aria-hidden={!settingsOpen}
        >
          <div className="settings-layer-header">
            <button
              id="settings-close-btn"
              className="settings-back-btn"
              type="button"
              aria-label="Volver al menú principal"
              onClick={onSettingsClose}
            >
              <img
                className="settings-back-icon"
                src={icon("return")}
                alt=""
                aria-hidden="true"
              />
              <span>volver</span>
            </button>
            <span className="settings-layer-title">
              <img
                className="settings-inline-icon"
                src={icon("settings")}
                alt=""
                aria-hidden="true"
              />
              <span>Configuración</span>
            </span>
          </div>

          <div className="settings-layer-content">
            {/* Nombre del encabezado */}
            <div className="settings-card">
              <span className="settings-card-title">Nombre del encabezado</span>
              <label className="settings-name-field">
                <span className="sr-only">Nombre para mostrar</span>
                <input
                  id="display-name-input"
                  type="text"
                  autoComplete="name"
                  defaultValue={displayName === "Modo local" ? "" : displayName}
                  placeholder="Ingresa un nombre"
                  onBlur={(event) => onDisplayName(event.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleSaveDisplayName();
                    }
                  }}
                />
              </label>
              <button
                id="save-display-name-btn"
                className="settings-action-btn"
                type="button"
                onClick={handleSaveDisplayName}
              >
                Guardar nombre
              </button>
            </div>

            {/* Tema visual */}
            <div className="settings-card">
              <span className="settings-card-title">Tema visual</span>
              <p className="settings-card-copy"> modo claro y oscuro</p>
              <button
                id="theme-toggle-btn"
                className="settings-action-btn settings-theme-toggle"
                type="button"
                aria-pressed={theme === "dark"}
                onClick={onThemeToggle}
              >
                <span className="settings-toggle-main">
                  <img
                    className="settings-inline-icon"
                    src={icon("mode_dark")}
                    alt=""
                    aria-hidden="true"
                  />
                  <span>Modo oscuro</span>
                </span>
                <span id="theme-toggle-state">
                  {theme === "dark" ? "Activado" : "Desactivado"}
                </span>
              </button>
            </div>

            {/* Panel de administración */}
            <AdminActivityPanel
              visible={isAdmin}
              loading={adminActivityLoading}
              error={adminActivityError}
              rows={adminActivity}
              updatedAt={adminActivityUpdatedAt}
            />

            {/* Cuenta */}
            <div
              id="account-panel"
              className={`account-panel ${user?.email ? "" : "hidden"}`}
              aria-live="polite"
            >
              <span className="account-panel-title">Cuenta activa</span>
              <span
                id="user-email-text"
                className="account-email-text"
              >
                {user?.email || ""}
              </span>
              <button
                id="logout-btn"
                className="logout-btn"
                type="button"
                onClick={handleLogout}
              >
                Salir
              </button>
            </div>
          </div>
        </div>
        {/* Capa de Eliminados */}
        <div
          id="deleted-layer"
          className={`settings-layer ${deletedLayerOpen ? "open" : ""}`}
          aria-hidden={!deletedLayerOpen}
        >
          <div className="settings-layer-header">
            <button
              className="settings-back-btn"
              type="button"
              aria-label="Cerrar eliminados"
              onClick={() => setDeletedLayerOpen(false)}
            >
              <img
                className="settings-back-icon"
                src={icon("return")}
                alt=""
                aria-hidden="true"
              />
              <span>volver</span>
            </button>
            <span className="settings-layer-title">
              <img
                className="settings-inline-icon"
                src={icon("contenedor-de-basura")}
                alt=""
                aria-hidden="true"
              />
              <span>Eliminados</span>
            </span>
          </div>

          <div className="settings-layer-content">
            {/* Operaciones eliminadas */}
            <div className="deleted-operations-section">
              <span className="deleted-operations-title">
                Operaciones eliminadas
              </span>
              <div className="deleted-operations-container">
                {state.deletedOperations.length ? (
                  state.deletedOperations.map((operation) => (
                    <div
                      className="deleted-operation-row"
                      key={operation.id}
                    >
                      <span className="deleted-operation-name">
                        {operation.name}
                      </span>
                      <div className="deleted-operation-actions">
                        <button
                          className="op-action restore"
                          type="button"
                          aria-label={`Restaurar operación "${operation.name}"`}
                          title="Restaurar"
                          onClick={() => actions.restoreOperation(operation.id)}
                        >
                          <img
                            src={icon("restore")}
                            alt=""
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          className="op-action delete"
                          type="button"
                          aria-label={`Eliminar definitivamente "${operation.name}"`}
                          title="Eliminar definitivamente"
                          onClick={() => {
                            if (
                              window.confirm(
                                `¿Eliminar definitivamente "${operation.name}"?`,
                              )
                            ) {
                              actions.purgeOperation(operation.id);
                            }
                          }}
                        >
                          <img
                            src={icon("contenedor-de-basura")}
                            alt=""
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="deleted-empty">
                    No hay operaciones eliminadas.
                  </p>
                )}
              </div>
            </div>

            {/* Compras de tela eliminadas */}
            <div className="fabric-deleted-section">
              <span className="deleted-operations-title">
                Compras eliminadas
              </span>
              <div className="deleted-operations-container">
                {deletedFabrics.length ? (
                  deletedFabrics.map((fabricPurchase) => (
                    <div
                      className="deleted-operation-row"
                      key={fabricPurchase.id}
                    >
                      <span className="deleted-operation-name">
                        {fabricPurchaseDateLabel(fabricPurchase.createdAt)}
                      </span>
                      <div className="deleted-operation-actions">
                        <button
                          className="op-action restore"
                          type="button"
                          aria-label={`Restaurar compra del ${fabricPurchaseDateLabel(fabricPurchase.createdAt)}`}
                          title="Restaurar"
                          onClick={() =>
                            actions.restoreFabricPage(fabricPurchase.id)
                          }
                        >
                          <img
                            src={icon("restore")}
                            alt=""
                            aria-hidden="true"
                          />
                        </button>
                        <button
                          className="op-action delete"
                          type="button"
                          aria-label={`Eliminar definitivamente compra del ${fabricPurchaseDateLabel(fabricPurchase.createdAt)}`}
                          title="Eliminar definitivamente"
                          onClick={() => {
                            if (
                              window.confirm(
                                "¿Eliminar definitivamente esta compra?",
                              )
                            ) {
                              actions.purgeFabricPage(fabricPurchase.id);
                            }
                          }}
                        >
                          <img
                            src={icon("contenedor-de-basura")}
                            alt=""
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="deleted-empty">
                    No hay compras de telas eliminadas.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
