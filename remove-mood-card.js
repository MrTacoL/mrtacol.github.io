(() => {
  function removeMoodCard() {
    document.getElementById('mtMoodCard')?.remove();
  }

  const style = document.createElement('style');
  style.textContent = '#mtMoodCard,.mt-mood-card{display:none!important;}';
  document.head.appendChild(style);

  removeMoodCard();
  setTimeout(removeMoodCard, 250);
  setTimeout(removeMoodCard, 800);
  setTimeout(removeMoodCard, 1600);
})();
