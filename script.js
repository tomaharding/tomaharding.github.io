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

  // ── TERMINAL TYPEWRITER ────────────────────────────────────────────────────
  const lines = [
    { type: 'prompt', text: 'checking your-business.co.uk' },
    { type: 'comment', text: '  # Is it mobile-friendly?' },
    { type: 'result',  key: '  mobile', arrow: ' → ', good: true,  val: '✓ looks great on phones' },
    { type: 'comment', text: '  # Does it load fast?' },
    { type: 'result',  key: '  speed  ', arrow: ' → ', good: false, val: '⚠ 6.2s — needs work' },
    { type: 'comment', text: '  # Is it secure?' },
    { type: 'result',  key: '  ssl    ', arrow: ' → ', good: true,  val: '✓ certificate valid' },
    { type: 'result',  key: '  contact', arrow: ' → ', good: false, val: '⚠ form exposed — no spam filter' },
  ];

  const body = document.querySelector('.terminal-body');

  function buildLine(line) {
    const div = document.createElement('div');
    div.className = 't-line';
    if (line.type === 'prompt') {
      div.innerHTML = `<span class="t-prompt">$</span><span class="t-cmd">&nbsp;${line.text}</span>`;
    } else if (line.type === 'comment') {
      div.innerHTML = `<span class="t-comment">${line.text}</span>`;
    } else if (line.type === 'result') {
      const valClass = line.good ? 't-good' : 't-warn';
      div.innerHTML = `<span class="t-key">${line.key}</span><span class="t-comment">${line.arrow}</span><span class="${valClass}">${line.val}</span>`;
    }
    return div;
  }

  async function runTerminal() {
    body.innerHTML = '';
    // Blinking cursor line shown while typing
    const cursorLine = document.createElement('div');
    cursorLine.className = 't-line';
    cursorLine.innerHTML = `<span class="t-prompt">$</span><span class="t-cmd">&nbsp;</span><span class="cursor"></span>`;
    body.appendChild(cursorLine);
    // Force blink to start cleanly
    const typingCursor = cursorLine.querySelector('.cursor');
    typingCursor.style.animation = 'none';
    typingCursor.offsetHeight;
    typingCursor.style.animation = '';

    await delay(600);

    for (const line of lines) {
      body.removeChild(cursorLine);
      body.appendChild(buildLine(line));
      body.appendChild(cursorLine);
      await delay(line.type === 'comment' ? 180 : 320);
    }

    // Final prompt with persistent cursor
    body.removeChild(cursorLine);
    const finalLine = document.createElement('div');
    finalLine.className = 't-line';
    finalLine.innerHTML = `<span class="t-prompt">$</span><span class="t-cmd">&nbsp;fixing issues&nbsp;</span><span class="cursor"></span>`;
    body.appendChild(finalLine);
    // Force blink animation to restart cleanly on the new element
    const cur = finalLine.querySelector('.cursor');
    cur.style.animation = 'none';
    cur.offsetHeight; // reflow
    cur.style.animation = '';
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // Run terminal when it scrolls into view (only once)
  const terminalEl = document.querySelector('.terminal');
  let terminalRan = false;
  const termObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !terminalRan) {
        terminalRan = true;
        runTerminal();
        termObserver.unobserve(terminalEl);
      }
    });
  }, { threshold: 0.4 });
  // Only pages with the hero terminal (the homepage) run it
  if (terminalEl) termObserver.observe(terminalEl);
