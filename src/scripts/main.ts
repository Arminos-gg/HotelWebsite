// Interaktionen des Redltalhofs – ohne Frameworks, ohne Tracking.

const root = document.documentElement;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = window.matchMedia('(pointer: fine)').matches;

/* ------------------------------------------------------------------ */
/* Header: Hintergrund beim Scrollen, ausblenden beim Runterscrollen   */
/* ------------------------------------------------------------------ */
let lastY = window.scrollY;
function onHeaderScroll() {
  const y = window.scrollY;
  root.classList.toggle('is-scrolled', y > 40);
  if (!root.classList.contains('menu-open')) {
    const down = y > lastY + 4;
    const up = y < lastY - 4;
    if (down && y > 500) root.classList.add('is-hidden');
    else if (up || y < 200) root.classList.remove('is-hidden');
  }
  lastY = y;
}

/* ------------------------------------------------------------------ */
/* Menü                                                                */
/* ------------------------------------------------------------------ */
const menu = document.querySelector<HTMLElement>('[data-menu]');
const toggle = document.querySelector<HTMLButtonElement>('[data-menu-toggle]');
function setMenu(open: boolean) {
  if (!menu || !toggle) return;
  toggle.setAttribute('aria-expanded', String(open));
  toggle.querySelector('.sr-only')!.textContent = open ? 'Menü schließen' : 'Menü öffnen';
  if (open) {
    menu.hidden = false;
    requestAnimationFrame(() => root.classList.add('menu-open'));
    document.body.style.overflow = 'hidden';
  } else {
    root.classList.remove('menu-open');
    document.body.style.overflow = '';
    window.setTimeout(() => {
      if (!root.classList.contains('menu-open')) menu.hidden = true;
    }, 900);
  }
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && root.classList.contains('menu-open')) {
    setMenu(false);
    toggle?.focus();
  }
});

/* ------------------------------------------------------------------ */
/* Wörter für Animationen aufteilen                                    */
/* ------------------------------------------------------------------ */
function splitWords(el: HTMLElement, cls = 'w') {
  let i = 0;
  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        const parts = (child.textContent ?? '').split(/(\s+)/);
        const frag = document.createDocumentFragment();
        for (const part of parts) {
          if (!part) continue;
          if (/^\s+$/.test(part)) {
            frag.append(document.createTextNode(' '));
            continue;
          }
          const w = document.createElement('span');
          w.className = cls;
          const wi = document.createElement('span');
          wi.className = `${cls}i`;
          wi.textContent = part;
          wi.style.setProperty('--i', String(i++));
          w.append(wi);
          frag.append(w);
        }
        child.replaceWith(frag);
      } else if (child.nodeType === Node.ELEMENT_NODE && (child as Element).tagName !== 'BR') {
        walk(child);
      }
    }
  };
  walk(el);
  el.setAttribute('aria-label', el.textContent?.replace(/\s+/g, ' ').trim() ?? '');
  return i;
}

document.querySelectorAll<HTMLElement>('[data-split]').forEach((el) => splitWords(el));

/* ------------------------------------------------------------------ */
/* Einblenden beim Scrollen                                            */
/* ------------------------------------------------------------------ */
const io = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    }
  },
  { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
);
document.querySelectorAll('[data-reveal], [data-split]').forEach((el) => io.observe(el));

/* ------------------------------------------------------------------ */
/* Zähler                                                              */
/* ------------------------------------------------------------------ */
const countIO = new IntersectionObserver(
  (entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      const el = entry.target as HTMLElement;
      countIO.unobserve(el);
      const target = Number(el.dataset.count);
      if (reduceMotion || !Number.isFinite(target)) {
        el.textContent = el.dataset.count ?? '';
        continue;
      }
      const start = performance.now();
      const dur = 1800;
      const tick = (now: number) => {
        const p = Math.min(1, (now - start) / dur);
        const eased = 1 - Math.pow(1 - p, 4);
        el.textContent = Math.round(target * eased).toLocaleString('de-AT');
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  },
  { threshold: 0.3 },
);
document.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
  el.textContent = '0';
  countIO.observe(el);
});

/* ------------------------------------------------------------------ */
/* Scroll-gebundener Text (Manifest)                                   */
/* ------------------------------------------------------------------ */
const highlights = Array.from(document.querySelectorAll<HTMLElement>('[data-highlight]')).map((el) => {
  splitWords(el, 'hw');
  return { el, words: Array.from(el.querySelectorAll<HTMLElement>('.hwi')) };
});

/* ------------------------------------------------------------------ */
/* Landschaft: Parallax & Maus                                         */
/* ------------------------------------------------------------------ */
const scenes = Array.from(document.querySelectorAll<HTMLElement>('[data-scene]'));
if (finePointer && !reduceMotion) {
  let mx = 0;
  let tx = 0;
  let raf = 0;
  const loop = () => {
    mx += (tx - mx) * 0.06;
    scenes.forEach((s) => s.style.setProperty('--mx', mx.toFixed(3)));
    raf = Math.abs(tx - mx) > 0.001 ? requestAnimationFrame(loop) : 0;
  };
  window.addEventListener('pointermove', (e) => {
    tx = (e.clientX / window.innerWidth - 0.5) * -2;
    if (!raf) raf = requestAnimationFrame(loop);
  });
}

/* ------------------------------------------------------------------ */
/* Tageszeit-Umschalter                                                */
/* ------------------------------------------------------------------ */
function syncTimeButtons() {
  document.querySelectorAll<HTMLButtonElement>('[data-set-time]').forEach((b) => {
    b.setAttribute('aria-pressed', String(b.dataset.setTime === root.dataset.time));
  });
  document.querySelectorAll<HTMLElement>('[data-time-label]').forEach((el) => {
    const labels: Record<string, string> = {
      dawn: 'Morgengrauen',
      day: 'Mittag',
      dusk: 'Abendrot',
      night: 'Sternennacht',
    };
    el.textContent = labels[root.dataset.time ?? 'dusk'];
  });
}
document.querySelectorAll<HTMLButtonElement>('[data-set-time]').forEach((b) => {
  b.addEventListener('click', () => {
    root.dataset.time = b.dataset.setTime;
    try {
      sessionStorage.setItem('rt-time', b.dataset.setTime ?? '');
    } catch {
      /* Speicher nicht verfügbar – egal */
    }
    syncTimeButtons();
  });
});
syncTimeButtons();

/* ------------------------------------------------------------------ */
/* Horizontale Tagesreise                                              */
/* ------------------------------------------------------------------ */
const hscrolls = Array.from(document.querySelectorAll<HTMLElement>('[data-hscroll]'));
const wideScreen = window.matchMedia('(min-width: 900px)');

function sizeHScroll() {
  for (const sec of hscrolls) {
    const track = sec.querySelector<HTMLElement>('[data-hscroll-track]');
    if (!track) continue;
    if (!wideScreen.matches || reduceMotion) {
      sec.style.height = '';
      track.style.transform = '';
      continue;
    }
    const dist = track.scrollWidth - window.innerWidth;
    sec.style.height = `${window.innerHeight + Math.max(0, dist)}px`;
    sec.dataset.dist = String(Math.max(0, dist));
  }
}

/* ------------------------------------------------------------------ */
/* Scroll-Loop                                                         */
/* ------------------------------------------------------------------ */
const parallaxEls = Array.from(document.querySelectorAll<HTMLElement>('[data-parallax]'));
let ticking = false;

function frame() {
  ticking = false;
  const vh = window.innerHeight;

  onHeaderScroll();

  if (!reduceMotion) {
    for (const s of scenes) {
      const rect = s.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < vh) s.style.setProperty('--sy', `${Math.max(0, -rect.top)}px`);
    }
    for (const el of parallaxEls) {
      const rect = el.getBoundingClientRect();
      if (rect.bottom < -100 || rect.top > vh + 100) continue;
      const speed = Number(el.dataset.parallax) || 0.12;
      const max = rect.height * 0.085;
      const offset = Math.max(-max, Math.min(max, (rect.top + rect.height / 2 - vh / 2) * -speed));
      const inner = el.firstElementChild as HTMLElement | null;
      if (inner) inner.style.transform = `translate3d(0, ${offset.toFixed(1)}px, 0)`;
    }
  }

  for (const { el, words } of highlights) {
    const rect = el.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (vh * 0.85 - rect.top) / (rect.height + vh * 0.35)));
    const lit = p * words.length * 1.05;
    words.forEach((w, i) => w.classList.toggle('lit', i < lit));
  }

  for (const sec of hscrolls) {
    const track = sec.querySelector<HTMLElement>('[data-hscroll-track]');
    const dist = Number(sec.dataset.dist || 0);
    if (!track || !dist || !wideScreen.matches || reduceMotion) continue;
    const rect = sec.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, -rect.top / (rect.height - vh)));
    track.style.transform = `translate3d(${(-p * dist).toFixed(1)}px, 0, 0)`;
    sec.style.setProperty('--p', p.toFixed(4));
  }
}

function requestFrame() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(frame);
  }
}

window.addEventListener('scroll', requestFrame, { passive: true });
window.addEventListener('resize', () => {
  sizeHScroll();
  requestFrame();
});
window.addEventListener('load', () => {
  sizeHScroll();
  requestFrame();
});
sizeHScroll();
frame();

/* Mobile Tagesreise: Fortschritt aus horizontalem Scroll */
hscrolls.forEach((sec) => {
  const track = sec.querySelector<HTMLElement>('[data-hscroll-viewport]');
  track?.addEventListener(
    'scroll',
    () => {
      if (wideScreen.matches) return;
      const p = track.scrollLeft / Math.max(1, track.scrollWidth - track.clientWidth);
      sec.style.setProperty('--p', p.toFixed(4));
    },
    { passive: true },
  );
});

/* ------------------------------------------------------------------ */
/* Anfrageformular → E-Mail                                            */
/* ------------------------------------------------------------------ */
document.querySelectorAll<HTMLFormElement>('[data-inquiry]').forEach((form) => {
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const arrival = form.querySelector<HTMLInputElement>('[name="anreise"]');
  const departure = form.querySelector<HTMLInputElement>('[name="abreise"]');
  const today = new Date().toISOString().slice(0, 10);
  arrival?.setAttribute('min', today);
  departure?.setAttribute('min', today);
  arrival?.addEventListener('change', () => {
    if (departure && arrival.value) {
      departure.min = arrival.value;
      if (departure.value && departure.value < arrival.value) departure.value = arrival.value;
    }
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const get = (k: string) => String(data.get(k) ?? '').trim();
    const fmt = (d: string) => (d ? new Date(d).toLocaleDateString('de-AT') : '–');
    const anliegen = get('anliegen');
    const lines = [
      `Anliegen: ${anliegen}`,
      `Name: ${get('name')}`,
      `E-Mail: ${get('email')}`,
      `Telefon: ${get('telefon') || '–'}`,
      `Zeitraum: ${fmt(get('anreise'))} bis ${fmt(get('abreise'))}`,
      `Personen: ${get('personen') || '–'}`,
      '',
      get('nachricht'),
    ];
    const subject = `Anfrage ${anliegen} – ${get('name')}`;
    const href = `mailto:${form.dataset.to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join('\n'))}`;
    window.location.href = href;
    if (status) {
      status.hidden = false;
      status.textContent =
        'Ihr E-Mail-Programm öffnet sich mit der fertigen Anfrage – nur noch auf „Senden“ klicken. Danke!';
    }
  });
});

/* ------------------------------------------------------------------ */
/* Seminar-Richtpreisrechner                                           */
/* ------------------------------------------------------------------ */
document.querySelectorAll<HTMLFormElement>('[data-calc]').forEach((form) => {
  const prices = JSON.parse(form.dataset.prices ?? '{}') as {
    breakfast: { double: number; single: number };
    fullBoard: { double: number; single: number };
    seminarPackage: number;
    cityTax: number;
  };
  const out = (name: string) => form.querySelector<HTMLElement>(`[data-out="${name}"]`);
  const eur = (n: number) => n.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' });

  const update = () => {
    const data = new FormData(form);
    const people = Number(data.get('people')) || 1;
    const days = Number(data.get('days')) || 1;
    const board = String(data.get('board')) as 'breakfast' | 'fullBoard' | 'none';
    const room = String(data.get('room')) as 'double' | 'single';
    const nights = board === 'none' ? 0 : Math.max(0, days - 1 + Number(data.get('arrive-before') ? 1 : 0));

    const seminar = people * days * prices.seminarPackage;
    const stay = board === 'none' ? 0 : people * nights * (prices[board][room] + prices.cityTax);
    const total = seminar + stay;

    out('people')!.textContent = String(people);
    out('days')!.textContent = String(days);
    out('nights')!.textContent = String(nights);
    out('seminar')!.textContent = eur(seminar);
    out('stay')!.textContent = eur(stay);
    out('total')!.textContent = eur(total);
    out('pp')!.textContent = eur(total / people);
  };
  form.addEventListener('input', update);
  update();
});

/* ------------------------------------------------------------------ */
/* Regionskarte                                                        */
/* ------------------------------------------------------------------ */
document.querySelectorAll<HTMLElement>('[data-map]').forEach((map) => {
  const set = (id: string | null) => {
    if (id) map.dataset.active = id;
    else delete map.dataset.active;
    map.querySelectorAll<HTMLElement>('[data-dest]').forEach((el) => el.classList.toggle('is-active', el.dataset.dest === id));
  };
  map.querySelectorAll<HTMLElement>('[data-dest]').forEach((el) => {
    const id = el.dataset.dest ?? null;
    el.addEventListener('mouseenter', () => set(id));
    el.addEventListener('focus', () => set(id));
    el.addEventListener('click', () => set(map.dataset.active === id ? null : id));
  });
  map.addEventListener('mouseleave', () => set(null));
});
