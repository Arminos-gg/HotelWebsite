// Zentrale Stammdaten des Redltalhofs.
// Alles, was sich ändern kann (Preise, Öffnungszeiten, Kontakt), wird nur hier gepflegt.

export const site = {
  name: 'Redltalhof',
  fullName: 'Gasthof & Seminarhotel Redltalhof',
  tagline: 'Gasthof · Seminarhotel · Wellness',
  claim: 'Wo der Wald beginnt.',
  description:
    'Gasthof, Seminarhotel und Wellness mitten in der Natur des Hausruck: der Redltalhof in Redleiten, Oberösterreich. Regionale Küche, zwei moderne Seminarräume, 30 Betten und ein Wellnessbereich mit Hallenbad.',
  address: {
    street: 'Redltal 2',
    zip: '4873',
    city: 'Redleiten',
    region: 'Oberösterreich',
    country: 'Österreich',
    countryCode: 'AT',
  },
  // Näherungsweise Lage im Redltal (für Karte & strukturierte Daten)
  geo: { lat: 48.0905, lon: 13.4655 },
  phone: '+43 7682 5332',
  phoneHref: 'tel:+4376825332',
  email: 'info@redltalhof.at',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Redltalhof%2C+Redltal+2%2C+4873+Redleiten',
  routeUrl:
    'https://www.google.com/maps/dir/?api=1&destination=Redltal+2%2C+4873+Redleiten%2C+%C3%96sterreich',
  elevation: 560,
} as const;

export const openingHours = {
  gasthof: [
    { days: 'Mittwoch – Samstag', time: '15:00 – 24:00' },
    { days: 'Sonn- & Feiertag', time: '11:00 – 24:00' },
    { days: 'Montag & Dienstag', time: 'Ruhetag' },
  ],
  kitchen: [{ days: 'Mittwoch – Sonntag & Feiertag', time: '15:00 – 22:00' }],
  note: 'Seminare, Feiern und Übernachtungen nach Vereinbarung.',
  // Für strukturierte Daten (schema.org)
  schema: ['We-Sa 15:00-24:00', 'Su 11:00-24:00'],
};

// Preise pro Person und Nacht (Stand der bisherigen Website).
export const prices = {
  breakfast: { double: 65.9, single: 83.9 },
  fullBoard: { double: 94.0, single: 112.0 },
  seminarPackage: 49.9,
  cityTax: 2.4,
};

export const facts = {
  beds: 30,
  seminarRooms: 2,
  hallCapacity: 50,
  seminarLarge: 40,
  seminarSmall: '15–20',
};

export const nav = [
  { href: '/zimmer/', label: 'Zimmer', kicker: 'Schlafen im Wald' },
  { href: '/seminare/', label: 'Seminare', kicker: 'Arbeiten mit Weitblick' },
  { href: '/gasthof/', label: 'Gasthof', kicker: 'Essen, Feiern, Einkehren' },
  { href: '/wellness/', label: 'Wellness', kicker: 'Wärme, Wasser, Ruhe' },
  { href: '/region/', label: 'Region', kicker: 'Hausruck & Kobernaußerwald' },
  { href: '/kontakt/', label: 'Kontakt', kicker: 'Anfragen & Anreise' },
];

export const euro = (n: number) =>
  n.toLocaleString('de-AT', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 });
