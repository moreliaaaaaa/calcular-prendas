export const NUMBER_FORMATTER = new Intl.NumberFormat("es-PE", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const NUMBER_PREFIX_PATTERN = /^-?\d*\.?\d*/;

export function toNumber(value) {
  if (value === "" || value === null || value === undefined) return 0;
  const normalized = String(value).replace(/,/g, ".");
  const match = normalized.match(NUMBER_PREFIX_PATTERN);
  if (!match) return 0;
  const parsed = parseFloat(match[0]);
  return Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
}

export function formatNumber(number) {
  if (Number.isNaN(number)) return "0";
  return NUMBER_FORMATTER.format(number);
}

export function inputValue(value) {
  const numeric = toNumber(value);
  return numeric === 0 ? "" : String(value);
}

export function inheritedPrice(rows) {
  const manualRow = rows.find((row) => row.priceManual && toNumber(row.price) > 0);
  return manualRow ? toNumber(manualRow.price) : 0;
}

export function effectivePrice(row, fallbackPrice) {
  return row.priceManual ? toNumber(row.price) : fallbackPrice;
}

export function calcSection(rows) {
  const fallbackPrice = inheritedPrice(rows);

  return rows.reduce(
    (acc, row) => {
      const price = effectivePrice(row, fallbackPrice);
      acc.qty += toNumber(row.qty);
      acc.total += toNumber(row.qty) * price;
      return acc;
    },
    { qty: 0, total: 0 },
  );
}

export function calcFabricBlock(block) {
  return (block?.rows || []).reduce(
    (acc, row) => {
      const rolls = toNumber(row.rolls);
      const kgPerRoll = toNumber(row.kgPerRoll);
      const pricePerKg = toNumber(row.pricePerKg);
      const rowKg = rolls * kgPerRoll;

      acc.totalRolls += rolls;
      acc.totalKg += rowKg;
      acc.totalCost += rowKg * pricePerKg;
      return acc;
    },
    { totalRolls: 0, totalKg: 0, totalCost: 0 },
  );
}

export function calcFabricPurchase(blocks = []) {
  return blocks.reduce(
    (acc, block) => {
      const totals = calcFabricBlock(block);
      acc.totalRolls += totals.totalRolls;
      acc.totalKg += totals.totalKg;
      acc.totalCost += totals.totalCost;
      return acc;
    },
    { totalRolls: 0, totalKg: 0, totalCost: 0 },
  );
}
