export const brl = (n: number) =>
  n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export const compact = (n: number) => {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(".0", "")}mil`;
  return n.toString();
};

export const discountPct = (oldPrice: number, price: number) => {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round((1 - price / oldPrice) * 100);
};
