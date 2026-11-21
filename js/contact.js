function updateInquiryHours(requestedHours = []){
  const date = byId('requested-date').value;
  const grid = byId('requested-hours');
  const freeSlots = date ? daySchedule(date,studioClock()).filter(slot=>slot.available) : [];
  grid.replaceChildren();
  byId('inquiry-hours-note').textContent = !date ? 'Избери дата.'
    : freeSlots.length ? '' : 'Няма свободни часове.';
  for(const {hour} of freeSlots){
    const label = document.createElement('label');
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.name = 'hour';
    input.value = String(hour);
    input.checked = requestedHours.includes(hour);
    label.append(input, document.createTextNode(interval(hour)));
    grid.append(label);
  }
}
byId('requested-date').addEventListener('change',()=>updateInquiryHours());
byId('contact-form').addEventListener('input',()=>{byId('form-note').hidden = true;});
byId('contact-form').addEventListener('submit',event=>{
  event.preventDefault();
  const requestedHours = new FormData(event.currentTarget).getAll('hour').map(Number);
  updateInquiryHours(requestedHours);
  const data = new FormData(event.currentTarget);
  const hours = data.getAll('hour').map(Number);
  const details = [
    data.get('service'),
    data.get('date') && dateLabel.format(dateTime(data.get('date'))),
    hourList(hours),
  ].filter(Boolean);
  const note = byId('form-note');
  note.textContent = 'Преглед за '+data.get('name')+(details.length ? ' · '+details.join(' · ') : '')+'. Запитването е само за демонстрация.';
  note.hidden = false;
});
byId('requested-date').min = initialDate;

const params = new URLSearchParams(location.search);
const service = params.get('service');
if(service === 'video') byId('service').value = 'Видеопродукция (препоръка)';
if(service === 'recording'){
  byId('service').value = 'Запис';
  const date = params.get('date') || '';
  if(/^\d{4}-\d{2}-\d{2}$/.test(date) && date >= initialDate){
    byId('requested-date').value = date;
  }
}
updateInquiryHours(service === 'recording' ? params.getAll('hour').map(Number) : []);
