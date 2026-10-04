/**
 * Locale-aware formatting via Intl (no locale data to register).
 * Arabic and Persian use Western digits so numbers match the original German letter.
 */
function intlLocale(code: string): string {
  return code === 'ar' || code === 'fa' ? `${code}-u-nu-latn` : code;
}

export function formatDate(iso: string | null, language: string): string {
  if (!iso) return '';
  const date = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(date.getTime())) return iso; // keep what the model returned rather than hide it
  return new Intl.DateTimeFormat(intlLocale(language), { dateStyle: 'long' }).format(date);
}

export function formatEur(value: number, language: string): string {
  return new Intl.NumberFormat(intlLocale(language), { style: 'currency', currency: 'EUR' }).format(value);
}
