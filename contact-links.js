(() => {
  const DISCORD_URL = 'https://discord.com/users/828806896089038879';
  const EMAIL = 'mrtacomm@gmail.com';
  const EMAIL_URL = `mailto:${EMAIL}?subject=Commission%20Request`;
  const FAVICON_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAALE0lEQVR42i2Wy5Pc51WGn+/2u3f39EzPaK4aaSTLlu1gxbZiWzYY4lRsijgpKAwbFtxCFezgL8iSLX8AUAkLKgVV2JgECkNhLOxgLF+k2JGlkeaiGWnUc+vpnr79Lt/3sRgvzuJdnXPeOu+pR/zuG6/5IE3RUYDWBqk0zkuU0iRRxnhc0D8eYK2nMVGnkSVc++QGC0uLvPj8C/RHQ6oyZ9DvM85zjjodKluSj8cMB328tyitsLbEWYu1jrIssZVlNBqh5zo56rjEAWNrsUohggiyjCIt0VHE0uICKIMKA5I4QkcRSmmCMGQpq7HxYJuiLEmzjFOnl3hwf5syz1lKYjqHh2hR4VzF8fGAqiwoy4Kq8oyLEj11Zh4ThMT1DOEl5chCZSmGOb4UUFbI0SE6iiiqkrIYk3V7xGfPMlnLaO8fUq83OO4fk4/HNKRmZeU8nW6H1nSLFeD6tQ9QUhGGAfVGjThOOL0Qc/WDm+juj95CSEl6qoFs1HAygiBBN+voWp2wOYmZqIFQJLUW6fYOm5sPUc88zXgwYKO9w7nZWaLAcOvOFm++/VOSJCaOI7Ispl5LWVqYoqosM7OnsJVHSri7vouWEp1IjagK/L1ddHKENobhURePpiLERwm20cAbg1yY4cwrL+FsCT5nVBxzcbLFQb/LYDRgMDxmZ+chSknAU5QlE7WUhd/6NnfWNtna3iEKQ5oTGbPTkygt0MJZcA6pweY5srJoIRE4FBWyyhFHHSQKEwb4fh+KkirPud/eYdAfY71HCoErC7SAONCcXVnm9p0NAhPgqord3UPaDzukccRwlDM9NYlzAq0CA86hBEjh0MoAFiFA4pG+QqLw1uHzHGUt5AXOWWxVUdkCkDjhKcsSX1VUOazfWsUWljBLcdbhLAihGPZHJGmM9wLrPFqFIXiBKisUHlmB8RLhQaJRQqOsh8ojKodyFik8WgqwFXiJ0uIkYsUI6Sy+ApMYGq1JalECzlMUBYGS1CcmqGUJAsBJdHnlEn5UIIoSVTlEVeEHBT4/0bqoCBwE1iEBihLtPdv396nKY/Y729QnH+Hc+WVKCSIJQEh64zF+FFKvNfBS4hAYpRBeEAYx9doEY+vRL/zpH+O9AMB7j3eOsrK4qqIcjhHOMTjo0P2P/yH+xTrOWiZSwSg7otmUSNFmdDel5h3P557Hzp6lqKDyFZWUxGmdpNPnyUaDQRwTZhlhVkM7SbNWQ+9vbKLDkCAMkUojTYDRBqU1tXPzhGnKF2/+hPiz20it8GWOzR2i2ubB+hG97gKvtiL4cpXFz27zzFjgxwVWg5MJhdKUExkXhyWuluCSglx2cY+H6LkUfeev/hoJRKnBWolUAaNaxsTlS7z4xve4+9HHdP7p35nsDXGTKVhLNBPw6fWcWM/z2PkW3/z9KxAaPvrLtxi9+zlbLzzB/NYuyb0ONjUoJNILkAqEJlUBdqrFzlQLnT7sIEuHCRRSKbw0uOfnuPTr32Q0GrL19jtMbrZBeESekzcV9smYi4eWLBE8dWESE8CgKHjpz5/m4yjmYZjRqtepL0N55x5ea5QvkU7ghcLWM7rOEw1LJB6c91ROAIqjxRZnv/stGtMtvvjJO0Sf3UI5h6NCesdRNGS7N2Qqc7Qa8NSTy/T6Be9/8AXbZcbU+Tmmt3eI8dWESE8CgKHjpz5/m4yjmYZjRqtepL0N55x5ea5QvkU7ghcLWM7rOEw1LJB6c91ROAIqjxRZnv/stGtMtvvjJO0Sf3UI5h6NCesdRNGS7N2Qqc7Qa8NSTy/T6Be9/8AXbZcbU+Tmmt3eI8dWESE8CgKHjpz5/m4yjmYZjRqtepL0N55x5ea5QvkU7ghcLWM7rOEw1LJB6c91ROAIqjxRZnv/stGtMtvvjJO0Sf3UI5h6NCesdRNGS7N2Qqc7Qa8NSTy/T6Be9/8AXbZcbU+Tmmt3eI';

  const css = `
    #discordContactButton,#emailContactButton,.socials a.email-link{display:none!important;}
    .commission-actions a.email-action{background:linear-gradient(135deg,#ffffff,#65efff)!important;color:#0f1016!important;}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function setupFavicon() {
    const icons = [
      ['icon', 'image/png'],
      ['shortcut icon', 'image/png'],
      ['apple-touch-icon', 'image/png']
    ];
    document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').forEach((link) => link.remove());
    icons.forEach(([rel, type]) => {
      const link = document.createElement('link');
      link.rel = rel;
      link.type = type;
      link.href = FAVICON_DATA;
      document.head.appendChild(link);
    });
  }

  function removeExtraContactButtons() {
    document.getElementById('discordContactButton')?.remove();
    document.getElementById('emailContactButton')?.remove();
    document.querySelectorAll('.socials a.email-link').forEach((link) => link.remove());
  }

  function setupCommissionModal() {
    const card = document.querySelector('.commission-card');
    const actions = document.querySelector('.commission-actions');
    if (!card || !actions) return;

    const paragraphs = card.querySelectorAll('p');
    const lastParagraph = paragraphs[paragraphs.length - 1];
    if (lastParagraph && !lastParagraph.dataset.contactFixed) {
      lastParagraph.dataset.contactFixed = 'true';
      lastParagraph.innerHTML = `<strong>Best way to contact:</strong> Discord @mrtacosi or email ${EMAIL}`;
    }

    const openDiscord = actions.querySelector('a[href*="discord.com/users/"]');
    if (openDiscord) {
      openDiscord.href = DISCORD_URL;
      openDiscord.target = '_blank';
      openDiscord.rel = 'noreferrer';
      openDiscord.textContent = 'Open Discord';
    }

    if (!actions.querySelector('.email-action')) {
      const email = document.createElement('a');
      email.className = 'email-action';
      email.href = EMAIL_URL;
      email.textContent = 'Email Me';
      actions.insertBefore(email, actions.children[1] || null);
    }
  }

  function setupDiscordProfileLinks() {
    document.querySelectorAll('a[href*="discord.com/users/"]').forEach((link) => {
      link.href = DISCORD_URL;
      link.target = '_blank';
      link.rel = 'noreferrer';
    });
  }

  function setup() {
    setupFavicon();
    removeExtraContactButtons();
    setupCommissionModal();
    setupDiscordProfileLinks();
  }

  setup();
  setTimeout(setup, 300);
  setTimeout(setup, 1000);
  setTimeout(setup, 2000);
})();
