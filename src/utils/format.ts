export function truncate(value: string, length: number) {
  return value.length > length ? `${value.slice(0, length).trim()}…` : value;
}

export function formatDate(value: string | null | undefined) {
  if (!value) return "unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
}
