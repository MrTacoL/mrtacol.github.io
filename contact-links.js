(() => {
  const DISCORD_URL = 'https://discord.com/users/828806896089038879';
  const EMAIL = 'mrtacomm@gmail.com';
  const EMAIL_URL = `mailto:${EMAIL}?subject=Commission%20Request`;
  const FAVICON_DATA = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAADJklEQVR42i3BSW/cVADA8f+z3/N79uxbNrKTBA6FkgSJAipbhERvVIhLuXJCSBz4AFz4Ckh8BW6IpYULINFSoSJFlKhqKVHS0Mk408xkMotnxh7bXPj9xEfX3k0trZkIG+XlSaWDl83jP2myOL/E4vwcjxt1hLQ4PzsjGJzT73UIR2P6/QGy+vAxbqVALAypjtC1KTKuTdzskFldQzuaMAxp1E9xPZdCqYgxNsYYBv0OMr3zJxMpsIUNiQ2ZInJlhamZEuedE86zmid+gx++/5EU2HrhWcJJzCAY8sz6AlIoDdEYwRhIsLpDZN0gSi6dTg+ZaxESEZNgtEJph8PjOmkcM0kEcvmzT7GiGMYhk1aPpDfAvrePHo8ZjR5yetCgcqbZzngkUjItbEIvg+N5VDNlZNw4QXkuEYqlD67S3d0juLmLqRZ5tL/POy+9ylY0YqsbY7CIfn6A0IZJzaG3lkW2v/wKEY9xr+ww2rrAyedfUBkE1C9nmesVeXFznXJBcNgPSXd9SuGIQFoYVyNafaQyhnR5lac/+ZDmjV/QszUmJcVJ2ublnQxWeZ87f0vm1pYY9RR7xuN6/RFq0uWNwTlyaAuKO68g+iHWyiLm4w0se0Dl6DuCrkXQLrGwGBE6ZQ4ys3z96y1qC7N0O11+CtpIcXEdq36M/823DF0Xhc3e4QOGTpPtt2uoSoeklyG6cZff/SbZSpVL25vUGyc06i3kbXuCDs7otXycTI5U2vzx1z1migmFxQI3fztgeX6d676P32xTDmP8Vov2ICRxHASQ8r98zqVSytFoPKFSybKxsUaUaITtUs1q8rk83WCIdj2mq1NM16rIK29eQilNPp9DKwVJRKfbZTw55fnNWXbvNrn23nMwXiAKwc24KK3BNsSWgyxPzbG6/BQVL4ctBEJYGCn5x/8Xz9hcWC2yfzxirZwiLUEYhkxSECLF8RTy6vvbvH75IrdvHXF/94hqwSOKIlZmFtBKMe1GnPZDbCFxXIXjebj5PI720G4e+dZrG7iu4v6RTxAnSGOQjsE1DpZtoYxho5hHKQdbaSzHQSoHKTVJavMfpEw+hpO1ppYAAAAASUVORK5CYII=';

  const css = `
    #discordContactButton,#emailContactButton,.socials a.email-link{display:none!important;}
    .commission-actions a.email-action{background:linear-gradient(135deg,#ffffff,#65efff)!important;color:#0f1016!important;}
  `;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function setupFavicon() {
    document.querySelectorAll('link[rel="icon"],link[rel="shortcut icon"],link[rel="apple-touch-icon"]').forEach((link) => link.remove());
    [
      ['icon', 'image/png'],
      ['shortcut icon', 'image/png'],
      ['apple-touch-icon', 'image/png']
    ].forEach(([rel, type]) => {
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
