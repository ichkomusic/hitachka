const oldPages = new Map([
  ['услуги', 'services/'],
  ['проекти', 'projects/'],
  ['галерия', 'gallery/'],
  ['календар', 'calendar/'],
  ['контакт', 'contact/'],
]);

function redirectOldPageLink(){
  let hash;
  try {
    hash = decodeURIComponent(location.hash.slice(1));
  } catch {
    return;
  }
  const destination = oldPages.get(hash);
  if (destination) location.replace(destination + (location.protocol === 'file:' ? 'index.html' : ''));
}

redirectOldPageLink();
window.addEventListener('hashchange', redirectOldPageLink);
