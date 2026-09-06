import { icon } from "@/shared/assets/icons.js";
import "@/styles/modules/header-layout.css";

export function Header({
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
    <div className="header">
      <div className="header-start">
        <button id="menu-toggle" className="menu-icon" type="button" aria-label="Menú de historial" onClick={onMenu}>
          <img className="menu-toggle-icon" src={icon("menu_hamburge")} alt="" aria-hidden="true" />
        </button>

        <button id="add-section-btn" className="action-btn add-section-btn" type="button" aria-label="Agregar un nuevo bloque de tallas" onClick={onAddSection}>
          <img className="add-section-icon" src={icon("addition")} alt="" aria-hidden="true" />
          <span>{activeView === "fabric" ? "BLOQUE" : "TABLA"}</span>
        </button>
      </div>

      <div className="header-center">
        <div id="header-user-name" className="header-user-name" aria-live="polite" title={displayName}>
          {displayName}
        </div>
        <div id="active-operation-title" className="active-operation-title" aria-live="polite" title={activeTitle}>
          {activeTitle}
        </div>
      </div>

      <div className="header-actions">
        <button id="install-app-btn" className={`install-icon-btn ${installAvailable ? "" : "hidden"}`} type="button" aria-label="Instalar aplicación" title="Instalar aplicación" onClick={onInstall}>
          <img className="install-icon" src={icon("install")} alt="" aria-hidden="true" />
        </button>

        <button id="new-operation-btn" className="plus-icon" type="button" aria-label="Nueva operación" onClick={onNew}>
          <img className="header-plus-icon" src={icon("plus")} alt="agregar tabla" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
