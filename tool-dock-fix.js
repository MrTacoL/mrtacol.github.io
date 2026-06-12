(() => {
  function buildDropdown() {
    const dock = document.querySelector('.mt-tool-dock');
    if (!dock || dock.classList.contains('mt-dropdown-ready')) return !!dock;

    dock.classList.add('mt-dropdown-ready');

    const main = document.createElement('button');
    main.type = 'button';
    main.className = 'mt-tools-main';
    main.textContent = 'Tools';
    main.setAttribute('aria-label', 'Open tools menu');
    main.setAttribute('aria-expanded', 'false');

    const menu = document.createElement('div');
    menu.className = 'mt-tool-menu';
    menu.setAttribute('role', 'menu');

    [...dock.children].forEach((child) => {
      if (child.tagName === 'BUTTON') menu.appendChild(child);
    });

    dock.appendChild(menu);
    dock.insertBefore(main, menu);

    function setOpen(open) {
      dock.classList.toggle('open', open);
      main.setAttribute('aria-expanded', open ? 'true' : 'false');
      main.textContent = open ? 'Close' : 'Tools';
    }

    main.addEventListener('click', (event) => {
      event.stopPropagation();
      setOpen(!dock.classList.contains('open'));
    });

    menu.addEventListener('click', (event) => {
      const button = event.target.closest('button[data-open]');
      if (!button) return;
      setTimeout(() => setOpen(false), 80);
    });

    document.addEventListener('click', (event) => {
      if (!dock.contains(event.target)) setOpen(false);
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') setOpen(false);
    });

    return true;
  }

  if (!buildDropdown()) {
    setTimeout(buildDropdown, 250);
    setTimeout(buildDropdown, 750);
    setTimeout(buildDropdown, 1500);
  }
})();
