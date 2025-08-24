import { format } from 'date-fns';

export const isValidDate = (d: Date) => !isNaN(d.getTime());

export const toDate = (
  value: string | number | Date | null | undefined
): Date | null => {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(value);
  return isValidDate(d) ? d : null;
};

export const formatDate = (
  value: string | number | Date | null | undefined,
  fmt = 'yyyy-MM-dd HH:mm:ss'
): string => {
  const d = toDate(value);
  return d ? format(d, fmt) : '-';
};
