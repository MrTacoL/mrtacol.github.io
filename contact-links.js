(() => {
  const DISCORD_URL = 'https://discord.com/users/828806896089038879';
  const EMAIL = 'mrtacomm@gmail.com';
  const EMAIL_URL = `mailto:${EMAIL}?subject=Commission%20Request`;

  const css = `
    #discordContactButton,#emailContactButton,.socials a.email-link{display:none!important;}
    .commission-actions a.email-action{background:linear-gradient(135deg,#ffffff,#65efff)!important;color:#0f1016!important;}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

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
    removeExtraContactButtons();
    setupCommissionModal();
    setupDiscordProfileLinks();
  }

  setup();
  setTimeout(setup, 300);
  setTimeout(setup, 1000);
  setTimeout(setup, 2000);
})();
