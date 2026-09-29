// Hängt den konfigurierten Basis-Pfad (z. B. "/HotelWebsite" auf GitHub Pages) an interne Links.
const base = import.meta.env.BASE_URL.replace(/\/+$/, '');

export function url(path = '/') {
  if (/^(https?:|mailto:|tel:|#)/.test(path)) return path;
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export function isActive(current: string, href: string) {
  const strip = (p: string) => p.replace(base, '').replace(/\/+$/, '') || '/';
  const c = strip(current);
  const h = strip(href);
  return h === '/' ? c === '/' : c === h || c.startsWith(`${h}/`);
}
