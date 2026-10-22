// Ottermead: concept sites (£500 – £3,500) by Tom Harding.
// One script for every page: each feature checks its markup exists first.
// No inline handlers or inline styles, so tomharding.dev's strict CSP stays intact.
// The basket and wishlist live in this browser only (localStorage). Nothing is sent or charged.

document.addEventListener('DOMContentLoaded', () => {
  setupMobileNav();
  setupOpenStatus();
  setupCarousel();
  setupShopFilters();
  setupQty();
  setupAddButtons();
  setupWishlist();
  setupBasketPage();
  setupCheckout();
  setupVoucher();
  setupSimpleForms();
  updateBasketCount();
});

const HOURS = { 0: [10, 16], 1: [9, 17], 2: [9, 17], 3: [9, 17], 4: [9, 17], 5: [9, 17], 6: [9, 17] };
const fmtHour = (h) => (h === 12 ? '12pm' : h > 12 ? `${h - 12}pm` : `${h}am`);
const gbp = (p) => '£' + (p / 100).toFixed(2);
const FREE_DELIVERY = 4000; // pence
const TIER = document.body.dataset.tier || 'x';

/* ── STORAGE (wrapped: private windows can throw) ── */
const store = {
  get(key) { try { return JSON.parse(localStorage.getItem(`ottermead-${TIER}-${key}`)) || {}; } catch { return {}; } },
  set(key, val) { try { localStorage.setItem(`ottermead-${TIER}-${key}`, JSON.stringify(val)); } catch { /* ignore */ } },
};
const getBasket = () => store.get('basket');
const saveBasket = (b) => { store.set('basket', b); updateBasketCount(); };
const basketTotals = (b) => Object.values(b).reduce((t, it) => ({ qty: t.qty + it.qty, sub: t.sub + it.qty * it.price }), { qty: 0, sub: 0 });

function updateBasketCount() {
  const { qty } = basketTotals(getBasket());
  document.querySelectorAll('[data-basket-count]').forEach((el) => {
    el.textContent = qty;
    el.hidden = qty === 0;
  });
}

function el(tag, cls, text) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
}

/* ── MOBILE NAV ── */
function setupMobileNav() {
  const btn = document.querySelector('.menu-btn');
  const nav = document.getElementById('mobile-nav');
  if (!btn || !nav) return;
  const setOpen = (open) => {
    btn.setAttribute('aria-expanded', String(open));
    btn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    nav.hidden = !open;
  };
  btn.addEventListener('click', () => setOpen(btn.getAttribute('aria-expanded') !== 'true'));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { setOpen(false); btn.focus(); }
  });
}

/* ── OPEN STATUS + today's row ── */
function setupOpenStatus() {
  const today = new Date().getDay();
  document.querySelectorAll('.hours tr[data-day]').forEach((row) => row.classList.toggle('is-today', Number(row.dataset.day) === today));
  const pills = document.querySelectorAll('[data-open-status]');
  if (!pills.length) return;
  const update = () => {
    const now = new Date();
    const [open, close] = HOURS[now.getDay()];
    const h = now.getHours() + now.getMinutes() / 60;
    const isOpen = h >= open && h < close;
    const text = isOpen ? `Shop open · until ${fmtHour(close)}`
      : h < open ? `Shop closed · opens ${fmtHour(open)}`
      : `Shop closed · opens ${fmtHour(HOURS[(now.getDay() + 1) % 7][0])} tomorrow`;
    pills.forEach((p) => { p.classList.toggle('is-open', isOpen); p.classList.toggle('is-closed', !isOpen); p.textContent = text; });
  };
  update();
  setInterval(update, 60000);
}

/* ── CAROUSEL (£500) ── */
function setupCarousel() {
  const track = document.getElementById('carousel');
  if (!track) return;
  const prev = document.querySelector('[data-carousel="prev"]');
  const next = document.querySelector('[data-carousel="next"]');
  const step = () => track.clientWidth * 0.9;
  prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
  next.addEventListener('click', () => track.scrollBy({ left: step(), behavior: 'smooth' }));
  const update = () => {
    prev.disabled = track.scrollLeft <= 2;
    next.disabled = track.scrollLeft >= track.scrollWidth - track.clientWidth - 2;
  };
  track.addEventListener('scroll', update, { passive: true });
  window.addEventListener('resize', update);
  update();
}

/* ── SHOP FILTERS, SEARCH AND SORT (£2,000+) ── */
function setupShopFilters() {
  const grid = document.querySelector('[data-shop-grid]');
  if (!grid) return;
  const cards = [...grid.querySelectorAll('.product')];
  const chips = document.querySelectorAll('[data-cat-filter]');
  const sort = document.getElementById('sort');
  const search = document.getElementById('shop-search');
  const traits = document.querySelectorAll('input[data-trait]');
  const count = document.querySelector('[data-shop-count]');
  const empty = document.querySelector('.shop-empty');
  let cat = new URLSearchParams(location.search).get('cat') || 'all';
  const apply = () => {
    const q = (search?.value || '').trim().toLowerCase();
    const need = [...traits].filter((t) => t.checked).map((t) => t.dataset.trait);
    let shown = 0;
    cards.forEach((c) => {
      const has = (c.dataset.traits || '').split(' ');
      const ok = (cat === 'all' || c.dataset.cat === cat) && c.dataset.name.toLowerCase().includes(q) && need.every((t) => has.includes(t));
      c.hidden = !ok;
      if (ok) shown++;
    });
    const by = sort?.value || 'featured';
    const sorted = [...cards].sort((a, b) => by === 'low' ? a.dataset.price - b.dataset.price
      : by === 'high' ? b.dataset.price - a.dataset.price : a.dataset.order - b.dataset.order);
    sorted.forEach((c) => grid.appendChild(c));
    chips.forEach((ch) => ch.setAttribute('aria-pressed', String(ch.dataset.catFilter === cat)));
    if (count) count.textContent = `${shown} ${shown === 1 ? 'product' : 'products'}`;
    if (empty) empty.hidden = shown > 0;
  };
  chips.forEach((ch) => ch.addEventListener('click', () => { cat = ch.dataset.catFilter; apply(); }));
  sort?.addEventListener('change', apply);
  search?.addEventListener('input', apply);
  traits.forEach((t) => t.addEventListener('change', apply));
  apply();
}

/* ── QUANTITY STEPPER (product pages) ── */
function setupQty() {
  document.querySelectorAll('.qty-stepper').forEach((box) => {
    const input = box.querySelector('input');
    const max = Number(input.max) || 10;
    box.querySelectorAll('[data-step]').forEach((b) => b.addEventListener('click', () => {
      input.value = Math.min(max, Math.max(1, Number(input.value) + Number(b.dataset.step)));
    }));
  });
}

/* ── ADD TO BASKET ── */
function setupAddButtons() {
  const toast = document.getElementById('toast');
  let timer;
  document.querySelectorAll('.add-btn[data-id]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const qtyInput = btn.dataset.qtyFrom ? document.getElementById(btn.dataset.qtyFrom) : null;
      const n = qtyInput ? Number(qtyInput.value) || 1 : 1;
      const b = getBasket();
      const it = b[btn.dataset.id] || { name: btn.dataset.name, price: Number(btn.dataset.price), img: btn.dataset.img, qty: 0 };
      it.qty = Math.min(10, it.qty + n);
      b[btn.dataset.id] = it;
      saveBasket(b);
      const old = btn.textContent;
      btn.textContent = 'Added ✓';
      setTimeout(() => { btn.textContent = old; }, 1400);
      if (toast) {
        toast.querySelector('[data-toast-text]').textContent = `${n} × ${btn.dataset.name} added to your basket.`;
        toast.hidden = false;
        clearTimeout(timer);
        timer = setTimeout(() => { toast.hidden = true; }, 4000);
      }
    });
  });
}

/* ── WISHLIST (£3,500) ── */
function setupWishlist() {
  const list = store.get('wish');
  document.querySelectorAll('.wish-btn[data-id]').forEach((btn) => {
    const sync = () => {
      const on = !!store.get('wish')[btn.dataset.id];
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', `${on ? 'Remove' : 'Save'} ${btn.dataset.name} ${on ? 'from' : 'to'} your wishlist`);
    };
    btn.addEventListener('click', () => {
      const w = store.get('wish');
      if (w[btn.dataset.id]) delete w[btn.dataset.id];
      else w[btn.dataset.id] = { name: btn.dataset.name, price: Number(btn.dataset.price), img: btn.dataset.img, url: btn.dataset.url };
      store.set('wish', w);
      sync();
    });
    sync();
  });
  const page = document.getElementById('wishlist-page');
  if (!page) return;
  const render = () => {
    const w = store.get('wish');
    page.innerHTML = '';
    const ids = Object.keys(w);
    document.querySelector('.wish-empty').hidden = ids.length > 0;
    ids.forEach((id) => {
      const it = w[id];
      const row = el('div', 'line-item');
      const im = el('img'); im.src = it.img; im.alt = ''; im.width = 96; im.height = 96;
      const info = el('div');
      const a = el('a', 'line-name', it.name); a.href = it.url;
      info.append(a, el('p', 'muted', gbp(it.price)));
      const actions = el('div', 'line-actions');
      const add = el('button', 'btn btn-primary btn-small', 'Add to basket'); add.type = 'button';
      add.addEventListener('click', () => {
        const b = getBasket();
        const cur = b[id] || { name: it.name, price: it.price, img: it.img, qty: 0 };
        cur.qty = Math.min(10, cur.qty + 1); b[id] = cur; saveBasket(b);
        add.textContent = 'Added ✓';
      });
      const rm = el('button', 'link-btn', 'Remove'); rm.type = 'button';
      rm.addEventListener('click', () => { const x = store.get('wish'); delete x[id]; store.set('wish', x); render(); });
      actions.append(add, rm);
      row.append(im, info, actions);
      page.appendChild(row);
    });
  };
  render();
}

/* ── BASKET PAGE ── */
function setupBasketPage() {
  const page = document.getElementById('basket-page');
  if (!page) return;
  const list = page.querySelector('.basket-lines');
  const empty = page.querySelector('.basket-empty');
  const summary = page.querySelector('.basket-summary');
  const sub = page.querySelector('[data-subtotal]');
  const bar = page.querySelector('[data-free-bar]');
  const render = () => {
    const b = getBasket();
    list.innerHTML = '';
    Object.entries(b).forEach(([id, it]) => {
      const row = el('div', 'line-item');
      const im = el('img'); im.src = it.img; im.alt = ''; im.width = 96; im.height = 96;
      const info = el('div');
      info.append(el('p', 'line-name', it.name), el('p', 'muted', `${gbp(it.price)} each`));
      const q = el('div', 'qty');
      const dec = el('button', '', '−'); dec.type = 'button'; dec.setAttribute('aria-label', `One fewer ${it.name}`);
      const inc = el('button', '', '+'); inc.type = 'button'; inc.setAttribute('aria-label', `One more ${it.name}`);
      const n = el('span', '', String(it.qty));
      dec.addEventListener('click', () => { const x = getBasket(); x[id].qty -= 1; if (x[id].qty <= 0) delete x[id]; saveBasket(x); render(); });
      inc.addEventListener('click', () => { const x = getBasket(); x[id].qty = Math.min(10, x[id].qty + 1); saveBasket(x); render(); });
      q.append(dec, n, inc);
      const right = el('div', 'line-actions');
      const rm = el('button', 'link-btn', 'Remove'); rm.type = 'button';
      rm.addEventListener('click', () => { const x = getBasket(); delete x[id]; saveBasket(x); render(); });
      right.append(el('strong', '', gbp(it.price * it.qty)), rm);
      row.append(im, info, q, right);
      list.appendChild(row);
    });
    const t = basketTotals(b);
    empty.hidden = t.qty > 0;
    summary.hidden = t.qty === 0;
    sub.textContent = gbp(t.sub);
    if (bar) {
      const left = FREE_DELIVERY - t.sub;
      bar.querySelector('[data-free-text]').textContent = left > 0 ? `Spend ${gbp(left)} more for free UK delivery` : 'You get free UK delivery 🎉';
      bar.querySelector('meter').value = Math.min(t.sub, FREE_DELIVERY);
    }
  };
  render();
}

/* ── CHECKOUT (demo: no payment is taken) ── */
function setupCheckout() {
  const form = document.getElementById('checkout-form');
  if (!form) return;
  const lines = document.querySelector('.checkout-lines');
  const subEl = document.querySelector('[data-co-sub]');
  const delEl = document.querySelector('[data-co-delivery]');
  const wrapEl = document.querySelector('[data-co-wrap]');
  const totalEl = document.querySelector('[data-co-total]');
  const address = form.querySelector('[data-address]');
  const wrap = form.querySelector('#gift-wrap');
  const giftMsg = form.querySelector('[data-gift-msg]');
  const status = form.querySelector('.form-status');
  const emptyMsg = document.querySelector('.checkout-empty');
  const deliveryCost = (method, sub) => method === 'collect' ? 0 : method === 'local' ? 300 : (sub >= FREE_DELIVERY ? 0 : 495);
  const render = () => {
    const b = getBasket();
    const t = basketTotals(b);
    lines.innerHTML = '';
    Object.values(b).forEach((it) => {
      const li = el('li');
      li.append(el('span', '', `${it.qty} × ${it.name}`), el('strong', '', gbp(it.qty * it.price)));
      lines.appendChild(li);
    });
    emptyMsg.hidden = t.qty > 0;
    form.querySelector('button[type="submit"]').disabled = t.qty === 0;
    const method = form.querySelector('input[name="delivery"]:checked').value;
    address.hidden = method === 'collect';
    address.querySelectorAll('input').forEach((i) => { i.required = method !== 'collect' && !i.dataset.optional; });
    const d = deliveryCost(method, t.sub);
    const w = wrap && wrap.checked ? 350 : 0;
    if (giftMsg) giftMsg.hidden = !(wrap && wrap.checked);
    subEl.textContent = gbp(t.sub);
    delEl.textContent = d === 0 ? 'Free' : gbp(d);
    if (wrapEl) { wrapEl.textContent = gbp(w); wrapEl.closest('div').hidden = w === 0; }
    totalEl.textContent = gbp(t.sub + d + w);
  };
  form.addEventListener('change', render);
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    const name = form.querySelector('#co-name').value;
    const method = form.querySelector('input[name="delivery"]:checked').value;
    status.textContent = `Thanks ${name}! This is a concept site, so no order was placed and no payment taken. On a real site you'd pay securely here and get an email confirming your ${method === 'collect' ? 'click & collect order' : 'delivery'}.`;
    saveBasket({});
    render();
  });
  render();
}

/* ── GIFT CARDS (£3,500). Demo only. ── */
function setupVoucher() {
  const form = document.getElementById('voucher-form');
  if (!form) return;
  const amountOut = document.querySelector('.voucher-amount');
  const msgOut = document.querySelector('.voucher-msg');
  const toOut = document.querySelector('[data-voucher-to]');
  form.querySelectorAll('input[name="amount"]').forEach((r) => r.addEventListener('change', () => { amountOut.textContent = '£' + r.value; }));
  form.querySelector('#v-message').addEventListener('input', (e) => { msgOut.textContent = e.target.value ? `"${e.target.value}"` : ''; });
  form.querySelector('#v-to').addEventListener('input', (e) => { toOut.textContent = e.target.value || 'someone special'; });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!form.checkValidity()) { form.reportValidity(); return; }
    form.querySelector('.form-status').textContent = 'This is a concept site, so no gift card was bought. On a real site you would pay securely and the gift card would be emailed instantly.';
  });
}

/* ── CONTACT / WORKSHOP FORMS. Demo only. ── */
function setupSimpleForms() {
  const ask = new URLSearchParams(location.search).get('ask');
  const msg = document.querySelector('form[data-demo-form] textarea[name="message"]');
  if (ask && msg) msg.value = `Hi, do you have the ${ask} in stock? I'd like to reserve one.`;
  document.querySelectorAll('form[data-demo-form]').forEach((form) => {
    const status = form.querySelector('.form-status');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      status.textContent = 'Thanks! This is a concept site, so nothing was sent. On a real site, this message would arrive in the shop’s inbox.';
      form.reset();
    });
  });
}
