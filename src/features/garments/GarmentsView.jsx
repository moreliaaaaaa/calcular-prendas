import { icon } from "@/shared/assets/icons.js";
import { EditableText } from "@/shared/ui/EditableText.jsx";
import { calcSection, effectivePrice, formatNumber, inheritedPrice, inputValue } from "@/shared/lib/calculations.js";
import { sanitizeOperationLabels, sanitizeSectionLabels } from "@/shared/lib/store.js";
import "@/styles/modules/tables.css";

function GarmentSection({ section, onChange, onDelete, onAddRow, onDeleteRow, onRename, onLabel }) {
  const totals = calcSection(section.rows);
  const fallbackPrice = inheritedPrice(section.rows);
  const labels = sanitizeSectionLabels(section.labels);

  return (
    <section className="size-section" data-section-id={section.id}>
      <div className="blue-border-box section-title">
        <EditableText
          className="tab-button editable-title"
          value={section.label}
          label="Editar nombre de la prenda"
          onSave={(value) => onRename(section.id, value)}
        />
        <button className="section-delete-btn" type="button" aria-label="Eliminar este bloque" title="Eliminar bloque" onClick={() => onDelete(section.id)}>
          <img src={icon("contenedor-de-basura")} alt="" className="icon-trash" aria-hidden="true" />
        </button>
        <button className="section-add-btn" type="button" aria-label="Agregar fila en esta seccion" title="Agregar fila" onClick={() => onAddRow(section.id)}>
          <img src={icon("addition")} alt="" className="icon-add" aria-hidden="true" />
        </button>
      </div>

      <table aria-label="Tabla de tallas">
        <thead>
          <tr>
            <th><EditableText value={labels.size} onSave={(value) => onLabel(section.id, "size", value)} label="Editar etiqueta" /></th>
            <th><EditableText value={labels.qty} onSave={(value) => onLabel(section.id, "qty", value)} label="Editar etiqueta" /></th>
            <th>PRECIO</th>
            <th>ELIMINAR</th>
          </tr>
        </thead>
        <tbody data-section-body={section.id}>
          {section.rows.map((row, index) => {
            const priceIsInherited = !row.priceManual;
            const currentEffectivePrice = effectivePrice(row, fallbackPrice);
            const priceStateClass = priceIsInherited ? "price-inherited" : "";
            const priceLabel = priceIsInherited
              ? `Precio automatico: ${formatNumber(currentEffectivePrice)}`
              : "Precio propio";

            return (
              <tr data-index={index} key={`${section.id}-${index}`}>
                <td>
                  <input className="size-input" data-type="size" value={row.size} onChange={(event) => onChange(section.id, index, "size", event.target.value)} />
                </td>
                <td>
                  <input className="cell-input" data-type="qty" type="number" min="0" value={inputValue(row.qty)} onChange={(event) => onChange(section.id, index, "qty", event.target.value)} />
                </td>
                <td className={priceStateClass}>
                  <input
                    className={`cell-input price-input ${priceStateClass}`}
                    data-type="price"
                    type="number"
                    min="0"
                    value={row.priceManual ? inputValue(row.price) : ""}
                    aria-label={priceLabel}
                    title={priceLabel}
                    onChange={(event) => onChange(section.id, index, "price", event.target.value)}
                  />
                </td>
                <td>
                  <button className="delete-btn" type="button" aria-label="Eliminar fila" onClick={() => onDeleteRow(section.id, index)}>
                    <img src={icon("contenedor-de-basura")} alt="" className="icon-trash" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="totals-row">
        <div className="green-box">
          <EditableText className="total-label" value={labels.totalGarments} onSave={(value) => onLabel(section.id, "totalGarments", value)} label="Editar etiqueta" />
          <span>{formatNumber(totals.qty)}</span>
        </div>
        <div className="green-box">
          <EditableText className="total-label" value={labels.totalPrice} onSave={(value) => onLabel(section.id, "totalPrice", value)} label="Editar etiqueta" />
          <span>{formatNumber(totals.total)}</span>
        </div>
      </div>
    </section>
  );
}

export function GarmentsView({ active, actions }) {
  const labels = sanitizeOperationLabels(active.labels);
  const grand = active.sections.reduce(
    (acc, section) => {
      const totals = calcSection(section.rows);
      acc.qty += totals.qty;
      acc.total += totals.total;
      return acc;
    },
    { qty: 0, total: 0 },
  );

  return (
    <div id="garments-view" className="workspace-view">
      <div id="sections-container">
        {active.sections.map((section) => (
          <GarmentSection
            key={section.id}
            section={section}
            onChange={actions.updateGarmentRow}
            onDelete={actions.deleteSection}
            onAddRow={actions.addGarmentRow}
            onDeleteRow={actions.deleteGarmentRow}
            onRename={actions.renameSection}
            onLabel={actions.updateSectionLabel}
          />
        ))}
      </div>

      <div className="totals-row grand-total-row">
        <h3 className="summary-title">RESUMEN GENERAL</h3>
        <div className="green-box">
          <EditableText className="total-label" value={labels.sumTotal} onSave={(value) => actions.updateOperationLabel("sumTotal", value)} label="Editar etiqueta" />
          <span id="grand-total">{formatNumber(grand.total)}</span>
        </div>
        <div className="green-box">
          <EditableText className="total-label" value={labels.totalGarments} onSave={(value) => actions.updateOperationLabel("totalGarments", value)} label="Editar etiqueta" />
          <span id="grand-total-garments">{formatNumber(grand.qty)}</span>
        </div>
      </div>
    </div>
  );
}
