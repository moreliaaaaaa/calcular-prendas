import { SUPABASE_CONFIG } from "@/config/supabase.js";
import { toNumber } from "./calculations.js";

export const STORAGE_PREFIX = "calcular-prendas-data-v7";
export const THEME_STORAGE_KEY = `${STORAGE_PREFIX}:theme`;
export const LEGACY_STORAGE_KEYS = [
  "calcular-prendas-data-v6",
  "calcular-prendas-data-v5",
];

const DATE_FORMATTER = new Intl.DateTimeFormat("es-PE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

export const DEFAULT_SECTION_TITLES = {
  kids: "TALLAS NINOS",
  adults: "TALLAS ADULTOS",
  generic: "NUEVO BLOQUE",
};

export const DEFAULT_SECTION_LABELS = {
  size: "TALLAS",
  qty: "CANTIDAD",
  totalGarments: "TOTAL PRENDAS",
  totalPrice: "PRECIO TOTAL",
};

export const DEFAULT_OPERATION_LABELS = {
  sumTotal: "SUMA TOTAL",
  totalGarments: "PRENDAS TOTALES",
};

export const DEFAULT_FABRIC_LABELS = {
  rolls: "rollos de tela",
  kgPerRoll: "kilos",
  pricePerKg: "PRECIO",
  totalRolls: "total de rollos",
  totalPrice: "PRECIO TOTAL",
  grandTotalRolls: "TOTAL ROLLOS",
  grandTotalKg: "TOTAL KILOS",
  grandTotalCost: "TOTAL COMPRA",
};

export const DEFAULT_DATA = {
  kids: [
    { size: "6", qty: 15, price: 650 },
    { size: "8", qty: 20, price: 650 },
    { size: "10", qty: 10, price: 650 },
    { size: "12", qty: 15, price: 650 },
    { size: "14", qty: 20, price: 650 },
    { size: "16", qty: 10, price: 650 },
  ],
  adults: [
    { size: "S", qty: 10, price: 700 },
    { size: "M", qty: 20, price: 700 },
    { size: "L", qty: 15, price: 700 },
    { size: "XL", qty: 15, price: 700 },
    { size: "XXL", qty: 23, price: 750 },
  ],
};

const DEFAULT_FABRIC_PURCHASE = {
  blocks: [
    {
      id: "default-block",
      title: "PRECIO POR KILO",
      rows: [{ id: "default-row", rolls: 10, kgPerRoll: 25, pricePerKg: 2500 }],
    },
  ],
};

let legacyStorageCleaned = false;

export function clone(data) {
  return JSON.parse(JSON.stringify(data));
}

export function createId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export function defaultOperationName(date = new Date()) {
  return DATE_FORMATTER.format(date);
}

export function sanitizeTitle(value, fallback) {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

export function sanitizeSectionLabels(labels = {}) {
  return {
    size: sanitizeTitle(labels?.size, DEFAULT_SECTION_LABELS.size),
    qty: sanitizeTitle(labels?.qty, DEFAULT_SECTION_LABELS.qty),
    totalGarments: sanitizeTitle(
      labels?.totalGarments,
      DEFAULT_SECTION_LABELS.totalGarments,
    ),
    totalPrice: sanitizeTitle(labels?.totalPrice, DEFAULT_SECTION_LABELS.totalPrice),
  };
}

export function sanitizeOperationLabels(labels = {}) {
  return {
    sumTotal: sanitizeTitle(labels?.sumTotal, DEFAULT_OPERATION_LABELS.sumTotal),
    totalGarments: sanitizeTitle(
      labels?.totalGarments,
      DEFAULT_OPERATION_LABELS.totalGarments,
    ),
  };
}

export function sanitizeFabricLabels(labels = {}) {
  return {
    rolls: sanitizeTitle(labels?.rolls, DEFAULT_FABRIC_LABELS.rolls),
    kgPerRoll: sanitizeTitle(labels?.kgPerRoll, DEFAULT_FABRIC_LABELS.kgPerRoll),
    pricePerKg: sanitizeTitle(labels?.pricePerKg, DEFAULT_FABRIC_LABELS.pricePerKg),
    totalRolls: sanitizeTitle(labels?.totalRolls, DEFAULT_FABRIC_LABELS.totalRolls),
    totalPrice: sanitizeTitle(labels?.totalPrice, DEFAULT_FABRIC_LABELS.totalPrice),
    grandTotalRolls: sanitizeTitle(
      labels?.grandTotalRolls,
      DEFAULT_FABRIC_LABELS.grandTotalRolls,
    ),
    grandTotalKg: sanitizeTitle(labels?.grandTotalKg, DEFAULT_FABRIC_LABELS.grandTotalKg),
    grandTotalCost: sanitizeTitle(
      labels?.grandTotalCost,
      DEFAULT_FABRIC_LABELS.grandTotalCost,
    ),
  };
}

export function sanitizeRow(row) {
  const price = toNumber(row?.price);
  const hasManualPrice =
    typeof row?.priceManual === "boolean" ? row.priceManual : price > 0;

  return {
    size: row && row.size !== undefined ? String(row.size).trim() : "",
    qty: toNumber(row?.qty),
    price,
    priceManual: hasManualPrice,
  };
}

export function sanitizeRows(rows) {
  if (!Array.isArray(rows) || !rows.length) {
    return [{ size: "", qty: 0, price: 0, priceManual: false }];
  }

  return rows.map((row) => sanitizeRow(row));
}

export function createSection(
  label = DEFAULT_SECTION_TITLES.generic,
  rows = [{ size: "", qty: 0, price: 0, priceManual: false }],
  labels = DEFAULT_SECTION_LABELS,
) {
  return {
    id: createId("section"),
    label: sanitizeTitle(label, DEFAULT_SECTION_TITLES.generic),
    labels: sanitizeSectionLabels(labels),
    rows: sanitizeRows(rows),
  };
}

export function sanitizeFabricRow(row = {}, index = 0) {
  return {
    id:
      typeof row?.id === "string" && row.id.trim()
        ? row.id.trim()
        : createId(`fabric-row-${index + 1}`),
    rolls: toNumber(row?.rolls),
    kgPerRoll: toNumber(row?.kgPerRoll),
    pricePerKg: toNumber(row?.pricePerKg),
  };
}

export function createFabricRow(index = 0) {
  return sanitizeFabricRow(
    { id: createId("fabric-row"), rolls: 0, kgPerRoll: 0, pricePerKg: 0 },
    index,
  );
}

export function sanitizeFabricBlock(block = {}, index = 0, fallbackLabels = {}) {
  const legacyRows =
    Array.isArray(block?.rows) && block.rows.length
      ? block.rows
      : [
          {
            rolls: block?.rolls ?? 10,
            kgPerRoll: block?.kgPerRoll ?? 25,
            pricePerKg: block?.pricePerKg ?? 2500,
          },
        ];

  return {
    id:
      typeof block?.id === "string" && block.id.trim()
        ? block.id.trim()
        : createId(`fabric-block-${index + 1}`),
    title: sanitizeTitle(block?.title, "PRECIO POR KILO"),
    labels: sanitizeFabricLabels(block?.labels || fallbackLabels),
    rows: legacyRows.map((row, rowIndex) => sanitizeFabricRow(row, rowIndex)),
  };
}

export function createFabricBlock(index = 0) {
  return sanitizeFabricBlock(
    {
      id: createId("fabric-block"),
      title: "PRECIO POR KILO",
      rows: [{ id: createId("fabric-row"), rolls: 0, kgPerRoll: 0, pricePerKg: 0 }],
    },
    index,
  );
}

export function sanitizeFabricBlocks(fabricPurchase = {}) {
  const fallbackLabels = sanitizeFabricLabels(fabricPurchase?.labels);
  const source =
    Array.isArray(fabricPurchase?.blocks) && fabricPurchase.blocks.length
      ? fabricPurchase.blocks
      : [
          {
            title: "PRECIO POR KILO",
            rolls: fabricPurchase?.rolls ?? 10,
            kgPerRoll: fabricPurchase?.kgPerRoll ?? 25,
            pricePerKg: fabricPurchase?.pricePerKg ?? 2500,
          },
        ];

  return source.map((block, index) =>
    sanitizeFabricBlock(block, index, fallbackLabels),
  );
}

export function sanitizeFabricPurchase(fabricPurchase = {}, index = 0) {
  return {
    id:
      typeof fabricPurchase?.id === "string" && fabricPurchase.id.trim()
        ? fabricPurchase.id.trim()
        : createId(`fabric-${index + 1}`),
    createdAt:
      typeof fabricPurchase?.createdAt === "string" && fabricPurchase.createdAt.trim()
        ? fabricPurchase.createdAt
        : new Date().toISOString(),
    name: sanitizeTitle(fabricPurchase?.name, ""),
    labels: sanitizeFabricLabels(fabricPurchase?.labels),
    blocks: sanitizeFabricBlocks(fabricPurchase),
  };
}

export function createFabricPurchase(index = 0) {
  return sanitizeFabricPurchase(
    {
      id: createId("fabric"),
      createdAt: new Date().toISOString(),
      name: "",
      blocks: [
        {
          id: createId("fabric-block"),
          title: "PRECIO POR KILO",
          rows: [{ id: createId("fabric-row"), rolls: 10, kgPerRoll: 25, pricePerKg: 2500 }],
        },
      ],
    },
    index,
  );
}

export function sanitizeFabricPurchases(operation = {}) {
  const source =
    Array.isArray(operation?.fabricPurchases) && operation.fabricPurchases.length
      ? operation.fabricPurchases
      : [operation?.fabricPurchase || DEFAULT_FABRIC_PURCHASE];

  return source.map((fabricPurchase, index) =>
    sanitizeFabricPurchase(fabricPurchase, index),
  );
}

export function fabricPurchaseDateLabel(createdAt = new Date().toISOString()) {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return defaultOperationName();
  return DATE_FORMATTER.format(date);
}

export function fabricPurchaseDisplayName(fabricPurchase) {
  return (
    sanitizeTitle(fabricPurchase?.name, "") ||
    fabricPurchaseDateLabel(fabricPurchase?.createdAt)
  );
}

export function createDefaultSections(data = DEFAULT_DATA) {
  return [
    createSection(DEFAULT_SECTION_TITLES.kids, data.kids),
    createSection(DEFAULT_SECTION_TITLES.adults, data.adults),
  ];
}

export function sanitizeSections(sections, fallbackSections = null) {
  const source = Array.isArray(sections) && sections.length ? sections : fallbackSections;
  if (!Array.isArray(source) || !source.length) {
    return [createSection()];
  }

  return source.map((section, index) => ({
    id:
      typeof section?.id === "string" && section.id.trim()
        ? section.id.trim()
        : createId(`section-${index + 1}`),
    label: sanitizeTitle(section?.label, `${DEFAULT_SECTION_TITLES.generic} ${index + 1}`),
    labels: sanitizeSectionLabels(section?.labels),
    rows: sanitizeRows(section?.rows),
  }));
}

export function sanitizeOperation(operation, index = 0) {
  const fallbackName = defaultOperationName();
  const legacySections =
    operation?.sections ||
    [operation?.kids || DEFAULT_DATA.kids, operation?.adults || DEFAULT_DATA.adults].map(
      (rows, legacyIndex) => ({
        id: createId(`legacy-${legacyIndex + 1}`),
        label:
          legacyIndex === 0
            ? sanitizeTitle(operation?.kidsLabel, DEFAULT_SECTION_TITLES.kids)
            : sanitizeTitle(operation?.adultsLabel, DEFAULT_SECTION_TITLES.adults),
        rows,
      }),
    );

  const fabricPurchases = sanitizeFabricPurchases(operation);
  const deletedFabricPurchases = Array.isArray(operation?.deletedFabricPurchases)
    ? operation.deletedFabricPurchases.map((fabricPurchase, fabricIndex) =>
        sanitizeFabricPurchase(fabricPurchase, fabricIndex + fabricPurchases.length),
      )
    : [];
  const activeFabricId = fabricPurchases.some(
    (fabricPurchase) => fabricPurchase.id === operation?.activeFabricId,
  )
    ? operation.activeFabricId
    : fabricPurchases[0].id;

  return {
    id:
      typeof operation?.id === "string" && operation.id.trim()
        ? operation.id
        : createId(`op-${index + 1}`),
    name:
      typeof operation?.name === "string" && operation.name.trim()
        ? operation.name.trim()
        : fallbackName,
    labels: sanitizeOperationLabels(operation?.labels),
    fabricPurchases,
    deletedFabricPurchases,
    activeFabricId,
    sections: sanitizeSections(legacySections, createDefaultSections()),
  };
}

export function createOperation(name, data) {
  const fabricPurchase = createFabricPurchase(0);
  return {
    id: createId("op"),
    name: sanitizeTitle(name, defaultOperationName()),
    labels: sanitizeOperationLabels(),
    fabricPurchases: [fabricPurchase],
    deletedFabricPurchases: [],
    activeFabricId: fabricPurchase.id,
    sections: createDefaultSections(data),
  };
}

export function normalizeState(rawState) {
  const operations = Array.isArray(rawState?.operations)
    ? rawState.operations.map((operation, index) => sanitizeOperation(operation, index))
    : [];
  const deletedOperations = Array.isArray(rawState?.deletedOperations)
    ? rawState.deletedOperations.map((operation, index) =>
        sanitizeOperation(operation, index + operations.length),
      )
    : [];

  if (!operations.length) {
    const operation = createOperation(null, DEFAULT_DATA);
    return { operations: [operation], deletedOperations, activeId: operation.id };
  }

  const activeId = operations.some((operation) => operation.id === rawState?.activeId)
    ? rawState.activeId
    : operations[0].id;

  return { operations, deletedOperations, activeId };
}

export function storageScope(user) {
  return user?.id ? `user:${user.id}` : "guest";
}

export function storageKey(user) {
  return `${STORAGE_PREFIX}:${storageScope(user)}`;
}

export function loadLocalState(user) {
  const scoped = localStorage.getItem(storageKey(user));
  if (scoped) return JSON.parse(scoped);

  if (!user) {
    for (const key of LEGACY_STORAGE_KEYS) {
      const legacyValue = localStorage.getItem(key);
      if (legacyValue) return JSON.parse(legacyValue);
    }
  }

  return null;
}

export function saveLocalState(user, state) {
  localStorage.setItem(storageKey(user), JSON.stringify(state));
  if (!legacyStorageCleaned) {
    LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    legacyStorageCleaned = true;
  }
}

export function shouldRequireAuth() {
  return SUPABASE_CONFIG.useAuth !== false;
}
