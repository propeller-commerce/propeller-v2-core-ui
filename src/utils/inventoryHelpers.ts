export function getStockStatus(quantity: number): { label: string; className: string } {
  if (quantity <= 0) return { label: 'Out of stock', className: 'text-destructive bg-destructive/10' };
  if (quantity <= 5) return { label: 'Low stock', className: 'text-warning bg-warning/10' };
  return { label: 'In stock', className: 'text-success bg-success/10' };
}
