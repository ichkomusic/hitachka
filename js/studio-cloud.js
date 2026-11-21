window.loadStudioCloud = async function loadStudioCloud(section) {
  if (!window.HITACHKA_API) return;

  const origin = new URL(window.HITACHKA_API);
  if (origin.protocol !== 'https:' || origin.origin !== window.HITACHKA_API) {
    throw new Error('Invalid HITACHKA API origin.');
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  try {
    const response = await fetch(new URL('/' + section, origin), {
      cache: 'no-store',
      credentials: 'omit',
      signal: controller.signal,
    });
    if (!response.ok) throw new Error('Studio data unavailable.');
    const data = await response.json();
    if (section === 'projects') {
      window.HITACHKA_CONTENT.projects = data.projects.map(project => ({
        ...project,
        image: project.image ? new URL(project.image, origin).href : '',
      }));
    } else {
      window.HITACHKA_CONTENT.hours = data.hours;
      window.HITACHKA_CONTENT.days = data.days;
    }
  } finally {
    clearTimeout(timeout);
  }
};
