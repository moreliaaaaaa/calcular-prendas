import { icon } from "@/shared/assets/icons.js";
import { EditableText } from "@/shared/ui/EditableText.jsx";
import { calcFabricBlock, calcFabricPurchase, formatNumber, inputValue } from "@/shared/lib/calculations.js";
import { sanitizeFabricBlocks, sanitizeFabricLabels } from "@/shared/lib/store.js";
import "@/styles/modules/fabric.css";

function FabricBlock({ block, onRow, onAddRow, onDeleteRow, onDeleteBlock, onRename, onLabel }) {
  const labels = sanitizeFabricLabels(block.labels);
  const totals = calcFabricBlock(block);

  return (
    <section className="fabric-purchase-section" data-fabric-block={block.id} aria-label="Compra de telas">
      <div className="blue-border-box fabric-section-title">
        <button className="section-delete-btn" type="button" aria-label="Eliminar bloque de telas" title="Eliminar bloque de telas" onClick={() => onDeleteBlock(block.id)}>
          <img src={icon("contenedor-de-basura")} alt="" className="icon-trash" aria-hidden="true" />
        </button>
        <EditableText
          className="tab-button editable-title"
          value={block.title}
          label="Editar nombre del bloque"
          onSave={(value) => onRename(block.id, value)}
        />
        <button className="section-add-btn" type="button" aria-label="Agregar fila de tela" title="Agregar fila de tela" onClick={() => onAddRow(block.id)}>
          <img src={icon("addition")} alt="" className="icon-add" aria-hidden="true" />
        </button>
      </div>

      <table className="fabric-table" aria-label="Tabla de compra de telas">
        <thead>
          <tr>
            <th><EditableText value={labels.rolls} onSave={(value) => onLabel(block.id, "rolls", value)} label="Editar etiqueta" /></th>
            <th><EditableText value={labels.kgPerRoll} onSave={(value) => onLabel(block.id, "kgPerRoll", value)} label="Editar etiqueta" /></th>
            <th><EditableText value={labels.pricePerKg} onSave={(value) => onLabel(block.id, "pricePerKg", value)} label="Editar etiqueta" /></th>
            <th>ELIMINAR</th>
          </tr>
        </thead>
        <tbody>
          {block.rows.map((row) => (
            <tr data-fabric-row={row.id} data-fabric-block-row={block.id} key={row.id}>
              <td><input className="cell-input" type="number" min="0" inputMode="decimal" value={inputValue(row.rolls)} onChange={(event) => onRow(block.id, row.id, "rolls", event.target.value)} /></td>
              <td><input className="cell-input" type="number" min="0" inputMode="decimal" value={inputValue(row.kgPerRoll)} onChange={(event) => onRow(block.id, row.id, "kgPerRoll", event.target.value)} /></td>
              <td><input className="cell-input" type="number" min="0" inputMode="decimal" value={inputValue(row.pricePerKg)} onChange={(event) => onRow(block.id, row.id, "pricePerKg", event.target.value)} /></td>
              <td>
                <button className="delete-btn" type="button" aria-label="Eliminar fila de tela" onClick={() => onDeleteRow(block.id, row.id)}>
                  <img src={icon("contenedor-de-basura")} alt="" className="icon-trash" aria-hidden="true" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="totals-row fabric-total-row">
        <div className="green-box">
          <EditableText className="total-label" value={labels.totalRolls} onSave={(value) => onLabel(block.id, "totalRolls", value)} label="Editar etiqueta" />
          <span>{formatNumber(totals.totalRolls)}</span>
        </div>
        <div className="green-box">
          <EditableText className="total-label" value={labels.totalPrice} onSave={(value) => onLabel(block.id, "totalPrice", value)} label="Editar etiqueta" />
          <span>{formatNumber(totals.totalCost)}</span>
        </div>
      </div>
    </section>
  );
}

export function FabricView({ active, actions }) {
  const fabricPurchase = active.fabricPurchases.find((item) => item.id === active.activeFabricId) || active.fabricPurchases[0];
  const blocks = sanitizeFabricBlocks(fabricPurchase);
  const labels = sanitizeFabricLabels(fabricPurchase?.labels);
  const totals = calcFabricPurchase(blocks);

  return (
    <div id="fabric-view" className="workspace-view">
      <div id="fabric-blocks-container">
        {blocks.map((block) => (
          <FabricBlock
            key={block.id}
            block={block}
            onRow={actions.updateFabricRow}
            onAddRow={actions.addFabricRow}
            onDeleteRow={actions.deleteFabricRow}
            onDeleteBlock={actions.deleteFabricBlock}
            onRename={actions.renameFabricBlock}
            onLabel={actions.updateFabricBlockLabel}
          />
        ))}

        <div className="totals-row grand-total-row fabric-grand-total-row">
          <h3 className="summary-title">RESUMEN GENERAL</h3>
          <div className="green-box">
            <EditableText className="total-label" value={labels.grandTotalRolls} onSave={(value) => actions.updateFabricPurchaseLabel("grandTotalRolls", value)} label="Editar etiqueta" />
            <span>{formatNumber(totals.totalRolls)}</span>
          </div>
          <div className="green-box">
            <EditableText className="total-label" value={labels.grandTotalKg} onSave={(value) => actions.updateFabricPurchaseLabel("grandTotalKg", value)} label="Editar etiqueta" />
            <span>{formatNumber(totals.totalKg)}</span>
          </div>
          <div className="green-box">
            <EditableText className="total-label" value={labels.grandTotalCost} onSave={(value) => actions.updateFabricPurchaseLabel("grandTotalCost", value)} label="Editar etiqueta" />
            <span>{formatNumber(totals.totalCost)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
