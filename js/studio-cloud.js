window.loadStudioCalendar = async function loadStudioCalendar() {
  if (!window.HITACHKA_API || location.protocol === 'file:') return;

  const response = await fetch(new URL('/calendar', window.HITACHKA_API), {
    cache: 'no-store',
    credentials: 'omit',
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) throw new Error('Studio calendar unavailable.');
  const { hours, days } = await response.json();
  window.HITACHKA_CONTENT.hours = hours;
  window.HITACHKA_CONTENT.days = days;
};
