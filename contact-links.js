(() => {
  const DISCORD_URL = 'https://discord.com/users/828806896089038879';
  const EMAIL = 'mrtacomm@gmail.com';
  const EMAIL_URL = `mailto:${EMAIL}?subject=Commission%20Request`;

  const css = `
    .action-row a.project-button{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;}
    .socials a.email-link{font-size:1.35rem;font-weight:900;line-height:1;}
    .commission-actions a.email-action{background:linear-gradient(135deg,#ffffff,#65efff)!important;color:#0f1016!important;}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function makeActionLink(id, text, href, newTab = false) {
    const link = document.createElement('a');
    link.id = id;
    link.className = 'project-button contact-button';
    link.href = href;
    link.textContent = text;
    if (newTab) {
      link.target = '_blank';
      link.rel = 'noreferrer';
    }
    return link;
  }

  function setupMainButtons() {
    const row = document.querySelector('.action-row');
    if (!row) return;

    const projectsButton = document.getElementById('projectsButton') || row.firstElementChild;

    if (!document.getElementById('discordContactButton')) {
      const discord = makeActionLink('discordContactButton', 'Discord', DISCORD_URL, true);
      projectsButton?.insertAdjacentElement('afterend', discord);
    }

    if (!document.getElementById('emailContactButton')) {
      const email = makeActionLink('emailContactButton', 'Email', EMAIL_URL, false);
      document.getElementById('discordContactButton')?.insertAdjacentElement('afterend', email);
    }
  }

  function setupSocialEmail() {
    const socials = document.querySelector('.socials');
    if (!socials || socials.querySelector('.email-link')) return;

    const email = document.createElement('a');
    email.href = EMAIL_URL;
    email.className = 'email-link';
    email.title = 'Email';
    email.setAttribute('aria-label', 'Email');
    email.textContent = '✉';
    socials.appendChild(email);
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
    setupMainButtons();
    setupSocialEmail();
    setupCommissionModal();
    setupDiscordProfileLinks();
  }

  setup();
  setTimeout(setup, 300);
  setTimeout(setup, 1000);
})();
