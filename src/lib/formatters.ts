import { format, parseISO } from 'date-fns';
import { id } from 'date-fns/locale';

export function formatRupiah(amount?: number | string | null): string {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (numericAmount === undefined || numericAmount === null || isNaN(numericAmount)) {
    return 'Rp 0';
  }
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numericAmount);
}

export function formatDateString(dateStr?: string | null, formatPattern: string = 'dd MMM yyyy'): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr), formatPattern, { locale: id });
  } catch {
    return dateStr;
  }
}
