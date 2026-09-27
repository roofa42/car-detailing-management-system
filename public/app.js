const pages = [...document.querySelectorAll('.page')];
function showPage() {
  const id = location.hash.replace('#', '') || 'dashboard';
  pages.forEach(page => page.classList.toggle('hidden', page.id !== id));
  document.querySelectorAll('nav a').forEach(link => link.classList.toggle('active', link.getAttribute('href') === `#${id}`));
}
window.addEventListener('hashchange', showPage);
showPage();
