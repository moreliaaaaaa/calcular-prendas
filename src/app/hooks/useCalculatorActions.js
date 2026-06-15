import { useMemo } from "react";
import { toNumber } from "@/shared/lib/calculations.js";
import {
  DEFAULT_FABRIC_LABELS,
  DEFAULT_OPERATION_LABELS,
  DEFAULT_SECTION_LABELS,
  createFabricBlock,
  createFabricRow,
  fabricPurchaseDisplayName,
  sanitizeFabricLabels,
  sanitizeOperationLabels,
  sanitizeSectionLabels,
} from "@/shared/lib/store.js";

export function useCalculatorActions({
  active,
  saveState,
  showToast,
  state,
  setActiveView,
  setMenuOpen,
}) {
  return useMemo(() => ({
    selectOperation(operationId) {
      saveState((draft) => {
        draft.activeId = operationId;
      });
      setMenuOpen(false);
    },
    renameOperation(operationId, nextName = "") {
      const operation = state?.operations.find((item) => item.id === operationId);
      const name = nextName || window.prompt("Editar nombre de operacion", operation?.name || "");
      if (!name?.trim()) return;
      saveState((draft) => {
        const item = draft.operations.find((entry) => entry.id === operationId);
        if (item) item.name = name.trim();
      });
      showToast("Operacion renombrada", "success");
    },
    deleteOperation(operationId) {
      saveState((draft) => {
        if (draft.operations.length <= 1) {
          showToast("No puedes eliminar la unica operacion", "error");
          return;
        }
        const operation = draft.operations.find((item) => item.id === operationId);
        if (!operation) return;
        draft.deletedOperations.unshift(operation);
        draft.operations = draft.operations.filter((item) => item.id !== operationId);
        if (draft.activeId === operationId) draft.activeId = draft.operations[0].id;
      });
      showToast("Operacion eliminada", "success");
    },
    restoreOperation(operationId) {
      saveState((draft) => {
        const index = draft.deletedOperations.findIndex((item) => item.id === operationId);
        if (index === -1) return;
        const [operation] = draft.deletedOperations.splice(index, 1);
        draft.operations.push(operation);
        draft.activeId = operation.id;
      });
      showToast("Operacion restaurada", "success");
    },
    purgeOperation(operationId) {
      if (!window.confirm("Eliminar definitivamente esta operacion?")) return;
      saveState((draft) => {
        draft.deletedOperations = draft.deletedOperations.filter((item) => item.id !== operationId);
      });
    },
    updateGarmentRow(sectionId, index, field, rawValue) {
      saveState((draft) => {
        const section = (draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0])?.sections.find((item) => item.id === sectionId);
        const row = section?.rows[index];
        if (!row) return;
        if (field === "size") {
          row.size = String(rawValue).trim();
          return;
        }
        if (field === "price" && String(rawValue).trim() === "") {
          row.price = 0;
          row.priceManual = false;
          return;
        }
        let value = toNumber(rawValue);
        if (field === "qty") value = Math.min(Math.floor(value), 9999);
        if (field === "price") {
          value = Math.min(Math.round(value * 100) / 100, 999999);
          row.priceManual = true;
        }
        row[field] = value;
      });
    },
    deleteSection(sectionId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        if (operation.sections.length <= 1) {
          showToast("No puedes eliminar el unico bloque", "error");
          return;
        }
        operation.sections = operation.sections.filter((section) => section.id !== sectionId);
      });
    },
    addGarmentRow(sectionId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const section = operation.sections.find((item) => item.id === sectionId);
        section?.rows.push({ size: "", qty: 0, price: 0, priceManual: false });
      });
    },
    deleteGarmentRow(sectionId, index) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const section = operation.sections.find((item) => item.id === sectionId);
        if (!section) return;
        section.rows.splice(index, 1);
        if (!section.rows.length) section.rows.push({ size: "", qty: 0, price: 0, priceManual: false });
      });
    },
    renameSection(sectionId, nextName = "") {
      const section = active?.sections.find((item) => item.id === sectionId);
      const next = nextName || window.prompt("Editar nombre de prenda", section?.label || "");
      if (!next?.trim()) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const target = operation.sections.find((item) => item.id === sectionId);
        if (target) target.label = next.trim();
      });
    },
    updateSectionLabel(sectionId, key, value) {
      if (!DEFAULT_SECTION_LABELS[key]) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const section = operation.sections.find((item) => item.id === sectionId);
        if (!section) return;
        section.labels = sanitizeSectionLabels(section.labels);
        section.labels[key] = value;
      });
    },
    updateOperationLabel(key, value) {
      if (!DEFAULT_OPERATION_LABELS[key]) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        operation.labels = sanitizeOperationLabels(operation.labels);
        operation.labels[key] = value;
      });
    },
    selectFabricPage(fabricId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        operation.activeFabricId = fabricId;
      });
      setActiveView("fabric");
      setMenuOpen(false);
    },
    renameFabricPage(fabricId, nextName = "") {
      const fabric = active?.fabricPurchases.find((item) => item.id === fabricId);
      const next = nextName || window.prompt("Editar nombre de compra de telas", fabricPurchaseDisplayName(fabric));
      if (!next?.trim()) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const target = operation.fabricPurchases.find((item) => item.id === fabricId);
        if (target) target.name = next.trim();
      });
    },
    deleteFabricPage(fabricId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        if (operation.fabricPurchases.length <= 1) {
          showToast("Debe quedar una compra de telas", "error");
          return;
        }
        const deleted = operation.fabricPurchases.find((item) => item.id === fabricId);
        operation.fabricPurchases = operation.fabricPurchases.filter((item) => item.id !== fabricId);
        operation.deletedFabricPurchases = operation.deletedFabricPurchases || [];
        if (deleted) operation.deletedFabricPurchases.unshift(deleted);
        if (operation.activeFabricId === fabricId) operation.activeFabricId = operation.fabricPurchases[0].id;
      });
    },
    restoreFabricPage(fabricId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const index = operation.deletedFabricPurchases.findIndex((item) => item.id === fabricId);
        if (index === -1) return;
        const [fabric] = operation.deletedFabricPurchases.splice(index, 1);
        operation.fabricPurchases.push(fabric);
        operation.activeFabricId = fabric.id;
      });
      setActiveView("fabric");
    },
    purgeFabricPage(fabricId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        operation.deletedFabricPurchases = operation.deletedFabricPurchases.filter((item) => item.id !== fabricId);
      });
    },
    updateFabricRow(blockId, rowId, field, rawValue) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const fabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        const block = fabric.blocks.find((item) => item.id === blockId);
        const row = block?.rows.find((item) => item.id === rowId);
        if (row && ["rolls", "kgPerRoll", "pricePerKg"].includes(field)) row[field] = toNumber(rawValue);
      });
    },
    addFabricRow(blockId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const fabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        const block = fabric.blocks.find((item) => item.id === blockId);
        block?.rows.push(createFabricRow(block.rows.length));
      });
    },
    deleteFabricRow(blockId, rowId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const fabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        const block = fabric.blocks.find((item) => item.id === blockId);
        if (!block) return;
        if (block.rows.length <= 1) block.rows[0] = createFabricRow(0);
        else block.rows = block.rows.filter((row) => row.id !== rowId);
      });
    },
    deleteFabricBlock(blockId) {
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const fabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        if (fabric.blocks.length <= 1) fabric.blocks[0] = createFabricBlock(0);
        else fabric.blocks = fabric.blocks.filter((block) => block.id !== blockId);
      });
    },
    renameFabricBlock(blockId, nextName = "") {
      const fabric = active?.fabricPurchases.find((item) => item.id === active.activeFabricId) || active?.fabricPurchases[0];
      const block = fabric?.blocks.find((item) => item.id === blockId);
      const next = nextName || window.prompt("Editar nombre de bloque", block?.title || "");
      if (!next?.trim()) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const currentFabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        const target = currentFabric.blocks.find((item) => item.id === blockId);
        if (target) target.title = next.trim();
      });
    },
    updateFabricBlockLabel(blockId, key, value) {
      if (!DEFAULT_FABRIC_LABELS[key]) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const fabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        const block = fabric.blocks.find((item) => item.id === blockId);
        if (!block) return;
        block.labels = sanitizeFabricLabels(block.labels || fabric.labels);
        block.labels[key] = value;
      });
    },
    updateFabricPurchaseLabel(key, value) {
      if (!DEFAULT_FABRIC_LABELS[key]) return;
      saveState((draft) => {
        const operation = draft.operations.find((item) => item.id === draft.activeId) || draft.operations[0];
        const fabric = operation.fabricPurchases.find((item) => item.id === operation.activeFabricId) || operation.fabricPurchases[0];
        fabric.labels = sanitizeFabricLabels(fabric.labels);
        fabric.labels[key] = value;
      });
    },
  }), [active, saveState, showToast, state, setActiveView, setMenuOpen]);
}
