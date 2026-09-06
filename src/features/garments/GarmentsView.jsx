import { useState } from "react";
import { getUiText } from "@/app/lib/auth.js";
import { icon } from "@/shared/assets/icons.js";
import { EditableText } from "@/shared/ui/EditableText.jsx";
import { calcSection, effectivePrice, formatCurrency, formatNumber, inheritedPrice, inputValue } from "@/shared/lib/calculations.js";
import { sanitizeOperationLabels, sanitizeSectionLabels } from "@/shared/lib/store.js";
import "@/styles/modules/tables.css";

function GarmentSection({ section, onAdvance, onExtra, onChange, onDelete, onAddRow, onDeleteRow, onRename, onLabel, user }) {
  const [adjustmentMode, setAdjustmentMode] = useState(null);
  const totals = calcSection(section.rows, section.advance, section.extra);
  const fallbackPrice = inheritedPrice(section.rows);
  const labels = sanitizeSectionLabels(section.labels);
  const t = (key) => getUiText(key, user);
  const showExtra = adjustmentMode === "extra" || totals.extra > 0;
  const showAdvance = adjustmentMode === "advance" || totals.advance > 0;
  const hasAdjustment = showExtra || showAdvance;

  return (
    <section className="size-section" data-section-id={section.id}>
      <div className="blue-border-box section-title">
        <EditableText
          className="tab-button editable-title"
          value={section.label}
          label={t("uiEditGarmentName")}
          onSave={(value) => onRename(section.id, value)}
        />
        <button className="section-delete-btn" type="button" aria-label={t("uiDeleteBlock")} title={t("uiDeleteBlock")} onClick={() => onDelete(section.id)}>
          <img src={icon("contenedor-de-basura")} alt="" className="icon-trash" aria-hidden="true" />
        </button>
        <button
          className={`section-money-btn section-money-btn-subtract ${adjustmentMode === "advance" ? "is-active" : ""}`}
          type="button"
          aria-label={t("uiSubtractAdvance")}
          title={t("uiSubtractAdvance")}
          aria-pressed={adjustmentMode === "advance"}
          onClick={() => setAdjustmentMode("advance")}
        >
          <img src={icon("minus")} alt="" aria-hidden="true" />
        </button>
        <button
          className={`section-money-btn section-money-btn-add ${adjustmentMode === "extra" ? "is-active" : ""}`}
          type="button"
          aria-label={t("uiAddExtraMoney")}
          title={t("uiAddExtraMoney")}
          aria-pressed={adjustmentMode === "extra"}
          onClick={() => setAdjustmentMode("extra")}
        >
          <img src={icon("plus")} alt="" aria-hidden="true" />
        </button>
        <button className="section-add-btn" type="button" aria-label={t("uiAddRow")} title={t("uiAddRow")} onClick={() => onAddRow(section.id)}>
          <img src={icon("addition")} alt="" className="icon-add" aria-hidden="true" />
        </button>
      </div>

      <table aria-label="Tabla de tallas">
        <thead>
          <tr>
            <th><EditableText value={labels.size} onSave={(value) => onLabel(section.id, "size", value)} label="Editar etiqueta" /></th>
            <th><EditableText value={labels.qty} onSave={(value) => onLabel(section.id, "qty", value)} label="Editar etiqueta" /></th>
            <th>{t("uiPrice")}</th>
            <th>{t("uiDelete")}</th>
          </tr>
        </thead>
        <tbody data-section-body={section.id}>
          {section.rows.map((row, index) => {
            const priceIsInherited = !row.priceManual;
            const currentEffectivePrice = effectivePrice(row, fallbackPrice);
            const priceStateClass = priceIsInherited ? "price-inherited" : "";
            const priceLabel = priceIsInherited
              ? `${t("uiPriceAutomatic")}: ${formatCurrency(currentEffectivePrice, user)}`
              : t("uiPriceOwn");

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
                  <button className="delete-btn" type="button" aria-label={t("uiDeleteRow")} onClick={() => onDeleteRow(section.id, index)}>
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
          <span>{formatCurrency(totals.total, user)}</span>
        </div>
        {showExtra && (
          <div className="green-box adjustment-box extra-box">
            <EditableText className="total-label" value={labels.extra} onSave={(value) => onLabel(section.id, "extra", value)} label="Editar etiqueta" />
            <input
              className="total-input"
              type="number"
              min="0"
              inputMode="decimal"
              aria-label={labels.extra}
              value={inputValue(totals.extra)}
              onChange={(event) => onExtra(section.id, event.target.value)}
            />
          </div>
        )}
        {showAdvance && (
          <div className="green-box adjustment-box advance-box">
            <EditableText className="total-label" value={labels.advance} onSave={(value) => onLabel(section.id, "advance", value)} label="Editar etiqueta" />
            <input
              className="total-input"
              type="number"
              min="0"
              inputMode="decimal"
              aria-label={labels.advance}
              value={inputValue(totals.advance)}
              onChange={(event) => onAdvance(section.id, event.target.value)}
            />
          </div>
        )}
        {hasAdjustment && (
          <div className="green-box balance-box">
            <EditableText className="total-label" value={labels.balance} onSave={(value) => onLabel(section.id, "balance", value)} label="Editar etiqueta" />
            <span>{formatCurrency(totals.balance, user)}</span>
          </div>
        )}
      </div>
    </section>
  );
}

export function GarmentsView({ active, actions, user }) {
  const labels = sanitizeOperationLabels(active.labels);
  const t = (key) => getUiText(key, user);
  const grand = active.sections.reduce(
    (acc, section) => {
      const totals = calcSection(section.rows, section.advance, section.extra);
      acc.qty += totals.qty;
      acc.total += totals.total;
      acc.extra += totals.extra;
      acc.advance += totals.advance;
      acc.balance += totals.balance;
      return acc;
    },
    { qty: 0, total: 0, extra: 0, advance: 0, balance: 0 },
  );
  const hasGrandAdjustment = grand.extra > 0 || grand.advance > 0;

  return (
    <div id="garments-view" className="workspace-view">
      <div id="sections-container">
        {active.sections.map((section) => (
          <GarmentSection
            key={section.id}
            section={section}
            onAdvance={actions.updateSectionAdvance}
            onExtra={actions.updateSectionExtra}
            onChange={actions.updateGarmentRow}
            onDelete={actions.deleteSection}
            onAddRow={actions.addGarmentRow}
            onDeleteRow={actions.deleteGarmentRow}
            onRename={actions.renameSection}
            onLabel={actions.updateSectionLabel}
            user={user}
          />
        ))}
      </div>

      <div className="totals-row grand-total-row">
        <h3 className="summary-title">{t("uiSummary")}</h3>
        <div className="green-box">
          <EditableText className="total-label" value={labels.sumTotal} onSave={(value) => actions.updateOperationLabel("sumTotal", value)} label="Editar etiqueta" />
          <span id="grand-total">{formatCurrency(grand.total, user)}</span>
        </div>
        {hasGrandAdjustment && (
          <>
            {grand.extra > 0 && (
              <div className="green-box">
                <EditableText className="total-label" value={labels.extraTotal} onSave={(value) => actions.updateOperationLabel("extraTotal", value)} label="Editar etiqueta" />
                <span>{formatCurrency(grand.extra, user)}</span>
              </div>
            )}
            {grand.advance > 0 && (
              <div className="green-box">
                <EditableText className="total-label" value={labels.advanceTotal} onSave={(value) => actions.updateOperationLabel("advanceTotal", value)} label="Editar etiqueta" />
                <span>{formatCurrency(grand.advance, user)}</span>
              </div>
            )}
            <div className="green-box balance-box">
              <EditableText className="total-label" value={labels.balanceTotal} onSave={(value) => actions.updateOperationLabel("balanceTotal", value)} label="Editar etiqueta" />
              <span>{formatCurrency(grand.balance, user)}</span>
            </div>
          </>
        )}
        <div className="green-box">
          <EditableText className="total-label" value={labels.totalGarments} onSave={(value) => actions.updateOperationLabel("totalGarments", value)} label="Editar etiqueta" />
          <span id="grand-total-garments">{formatNumber(grand.qty)}</span>
        </div>
      </div>
    </div>
  );
}
