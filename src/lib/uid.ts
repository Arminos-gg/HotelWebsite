let n = 0;
/** Eindeutige IDs für SVG-Verläufe, auch wenn eine Grafik mehrfach auf einer Seite steht. */
export const uid = (prefix: string) => `${prefix}-${(++n).toString(36)}`;
