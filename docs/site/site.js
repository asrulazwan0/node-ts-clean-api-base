document.body.classList.add('js');
const menu = document.querySelector('#menu-toggle');
menu.hidden = false;
menu.addEventListener('click', () => {
  const open = menu.getAttribute('aria-expanded') !== 'true';
  menu.setAttribute('aria-expanded', String(open));
  document.body.dataset.menu = open ? 'open' : 'closed';
});
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-expanded') === 'true') {
    menu.click();
    menu.focus();
  }
});

if (navigator.clipboard?.writeText) {
  document.querySelectorAll('pre').forEach((block) => {
    const button = document.createElement('button');
    button.className = 'copy-button';
    button.textContent = 'Copy';
    button.setAttribute('aria-label', 'Copy code example');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(block.querySelector('code').textContent);
        button.textContent = 'Copied';
        document.querySelector('#copy-status').textContent = 'Code copied to clipboard.';
        setTimeout(() => {
          button.textContent = 'Copy';
        }, 2000);
      } catch {
        document.querySelector('#copy-status').textContent =
          'Copy failed. Select and copy the code manually.';
      }
    });
    block.append(button);
  });
}

async function enableSearch() {
  const form = document.querySelector('#search-form');
  const input = document.querySelector('#search-input');
  const results = document.querySelector('#search-results');
  const status = document.querySelector('#search-status');
  const response = await fetch(`${document.body.dataset.base}assets/search.json`);
  if (!response.ok) throw new Error('Search index unavailable');
  const index = await response.json();
  form.hidden = false;
  const search = () => {
    results.replaceChildren();
    const terms = input.value.toLowerCase().trim().split(/\s+/).filter(Boolean);
    if (!terms.length) {
      status.textContent = '';
      return;
    }
    const matches = index
      .filter((entry) =>
        terms.every((term) => `${entry.title} ${entry.text}`.toLowerCase().includes(term)),
      )
      .slice(0, 8);
    status.textContent = matches.length
      ? `${matches.length} results${matches.length === 8 ? ' (first 8)' : ''}`
      : 'No matching sections. Try another term.';
    matches.forEach((entry) => {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = entry.url;
      link.textContent = entry.title;
      item.append(link);
      results.append(item);
    });
  };
  input.addEventListener('input', search);
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    search();
    results.querySelector('a')?.focus();
  });
}
enableSearch().catch(() => {
  /* Navigation and document content remain usable without search. */
});
