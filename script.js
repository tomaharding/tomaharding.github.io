const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal, .stagger').forEach(el => observer.observe(el));

  // Hero elements visible immediately on load
  document.querySelectorAll('#hero .reveal, #hero .stagger').forEach(el => {
    el.classList.add('visible');
  });

  // ── WEBSITE CHECK CARD (homepage hero) ───────────────────────────────────
  // Rows appear one by one, like a quick health check running on a site.
  const checks = [
    { label: 'Mobile-friendly', result: 'Looks great on phones', good: true },
    { label: 'Page speed',      result: '6.2s, needs work',      good: false },
    { label: 'Security (HTTPS)', result: 'Certificate valid',    good: true },
    { label: 'Contact form',    result: 'No spam protection',    good: false },
  ];

  const checkBody = document.querySelector('#hero .check-body');

  function buildRow(check) {
    const row = document.createElement('div');
    row.className = 'check-row';
    const label = document.createElement('span');
    label.className = 'check-label';
    label.textContent = check.label;
    const result = document.createElement('span');
    result.className = 'check-result ' + (check.good ? 'good' : 'warn');
    result.textContent = (check.good ? '✓ ' : '! ') + check.result;
    row.append(label, result);
    return row;
  }

  function setStatus(el, html) {
    el.innerHTML = html + ' <span class="cursor"></span>';
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  async function runCheck() {
    checkBody.innerHTML = '';
    const rows = document.createElement('div');
    const status = document.createElement('p');
    status.className = 'check-status';
    checkBody.append(rows, status);

    setStatus(status, 'Checking your site…');
    await delay(700);

    for (const check of checks) {
      rows.appendChild(buildRow(check));
      await delay(450);
    }

    const issues = checks.filter(c => !c.good).length;
    setStatus(status, `<strong>${issues} issues found.</strong> I'll fix them and explain why.`);
  }

  // Run the check when the card scrolls into view (only once)
  if (checkBody) {
    let checkRan = false;
    const checkObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !checkRan) {
          checkRan = true;
          runCheck();
          checkObserver.unobserve(checkBody);
        }
      });
    }, { threshold: 0.4 });
    checkObserver.observe(checkBody);
  }


  // ── MOBILE MENU ───────────────────────────────────────────────────────────
  const menuBtn = document.querySelector('.menu-toggle');
  const menu = document.getElementById('mobile-menu');

  if (menuBtn && menu) {
    const isOpen = () => menuBtn.getAttribute('aria-expanded') === 'true';

    const setOpen = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.hidden = !open;
      document.documentElement.classList.toggle('menu-open', open);
      if (open) {
        const first = menu.querySelector('a');
        if (first) first.focus();
      }
    };

    menuBtn.addEventListener('click', () => setOpen(!isOpen()));

    // Close after choosing a link
    menu.addEventListener('click', (e) => {
      if (e.target.closest('a')) setOpen(false);
    });

    // Close with Escape and return focus to the button
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) {
        setOpen(false);
        menuBtn.focus();
      }
    });

    // Close if the screen gets wide enough to show the normal nav
    window.matchMedia('(min-width: 761px)').addEventListener('change', (e) => {
      if (e.matches) setOpen(false);
    });
  }
