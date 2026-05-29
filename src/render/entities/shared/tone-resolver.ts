export const resolveToneColor = <TTone extends string>(
  tone: TTone,
  palette: Record<TTone, string>,
  fallback: string,
): string => palette[tone] ?? fallback;
