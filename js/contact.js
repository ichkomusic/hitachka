(async () => {
  const form = byId('contact-form');
  const dateInput = byId('requested-date');
  const grid = byId('requested-hours');
  const hoursNote = byId('inquiry-hours-note');
  const note = byId('form-note');
  const submit = form.querySelector('button[type="submit"]');
  const show = (text) => {
    note.textContent = text;
    note.hidden = false;
  };

  form.addEventListener('submit', sendInquiry);
  let token = '';
  let widget;
  let sending = false;
  let loadingAvailability = true;

  function setToken(value = '') {
    token = value;
    submit.disabled = sending || loadingAvailability || !token;
  }

  dateInput.min = initialDate;
  dateInput.disabled = true;
  hoursNote.textContent = 'Зареждане на свободните часове…';
  const params = new URLSearchParams(location.search);
  const service = params.get('service');
  if (service === 'video') byId('service').value = 'Видеопродукция (препоръка)';
  const requestedHours = service === 'recording' ? params.getAll('hour').map(Number) : [];
  if (service === 'recording') {
    byId('service').value = 'Запис';
    const date = params.get('date') || '';
    if (/^\d{4}-\d{2}-\d{2}$/.test(date) && date >= initialDate) dateInput.value = date;
  }

  function updateInquiryHours(selected = []) {
    const date = dateInput.value;
    const freeSlots = date ? daySchedule(date, studioClock()).filter(slot => slot.available) : [];
    grid.replaceChildren();
    hoursNote.textContent = !date ? 'Избери дата.' : freeSlots.length ? '' : 'Няма свободни часове.';
    for (const { hour } of freeSlots) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.name = 'hour';
      input.value = String(hour);
      input.checked = selected.includes(hour);
      label.append(input, document.createTextNode(interval(hour)));
      grid.append(label);
    }
  }

  dateInput.addEventListener('change', () => updateInquiryHours());
  form.addEventListener('input', () => { if (!sending) note.hidden = true; });

  try {
    await availabilityReady;
    dateInput.disabled = false;
    updateInquiryHours(requestedHours);
  } catch {
    hoursNote.textContent = 'Часовете са недостъпни. Можеш да изпратиш запитване без дата.';
  }

  loadingAvailability = false;

  if (!window.HITACHKA_API || !window.HITACHKA_TURNSTILE_SITE_KEY || location.protocol === 'file:') {
    show('Формата е недостъпна. Можеш да ни пишеш на посочения имейл.');
    return;
  }
  const script = document.createElement('script');
  script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  const verificationFailed = () => {
    setToken();
    if (!sending) show('Проверката е недостъпна. Опитай отново или ни пиши на посочения имейл.');
  };
  script.onload = () => {
    try {
      widget = window.turnstile.render('#inquiry-challenge', {
        sitekey: window.HITACHKA_TURNSTILE_SITE_KEY,
        action: 'inquiry',
        language: 'bg',
        callback: setToken,
        'expired-callback': () => setToken(),
        'error-callback': verificationFailed,
      });
    } catch {
      verificationFailed();
    }
  };
  script.onerror = verificationFailed;
  document.head.append(script);

  async function sendInquiry(event) {
    event.preventDefault();
    if (!token || sending || loadingAvailability) return;
    const data = new FormData(form);
    const hours = data.getAll('hour').map(Number);
    const payload = Object.fromEntries(['name', 'email', 'phone', 'service', 'date', 'message']
      .map(key => [key, data.get(key) || '']));
    sending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    show('Изпращаме запитването…');
    try {
      const response = await fetch(new URL('/contact', window.HITACHKA_API), {
        method: 'POST',
        credentials: 'omit',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, hours, token }),
        signal: AbortSignal.timeout(20000),
      });
      const result = await response.json();
      if (response.ok && result.sent) {
        form.reset();
        if (!dateInput.disabled) updateInquiryHours();
        show('Запитването е изпратено. Ще ти пишем, за да уточним подробностите.');
      } else if (result.error === 'availability') {
        if (payload.date < studioClock().date) dateInput.value = '';
        await window.loadStudioCalendar();
        updateInquiryHours(hours);
        show('Избраните часове вече не са налични. Провери календара и опитай отново.');
      } else if (result.error === 'challenge' || result.error === 'invalid') {
        show(result.error === 'challenge'
          ? 'Проверката изтече. Изчакай да се обнови и опитай отново.'
          : 'Провери попълнените полета и опитай отново.');
      } else {
        show('Не успяхме да изпратим запитването. Опитай отново или ни пиши по имейл.');
      }
    } catch {
      show('Изпращането не е потвърдено. Ако проблемът продължи, пиши ни по имейл.');
    } finally {
      sending = false;
      form.removeAttribute('aria-busy');
      setToken();
      if (widget !== undefined) window.turnstile.reset(widget);
    }
  }
})();
