let month = dateTime(initialDate.slice(0,7)+'-01');
let selectedDate = '';
const selectedHours = new Set();
function renderTimes(){
  const panel = byId('times-heading');
  const note = byId('selected-text');
  const grid = byId('time-grid');
  const link = byId('date-link');
  grid.replaceChildren();
  link.hidden = true;
  if(!selectedDate){
    panel.textContent = 'Избери дата';
    note.textContent = 'Ще видиш свободните едночасови слотове за запис.';
    return;
  }
  const slots = daySchedule(selectedDate,studioClock());
  const hasAvailability = slots.some(slot=>slot.available);
  const freeHours = new Set(slots.filter(slot=>slot.available).map(slot=>slot.hour));
  for(const hour of selectedHours){
    if(!freeHours.has(hour)) selectedHours.delete(hour);
  }
  const hasSelection = selectedHours.size > 0;
  panel.textContent = dateLabel.format(dateTime(selectedDate));
  note.textContent = hasSelection ? 'Избрани часове ('+selectedHours.size+'): '+hourList(selectedHours)
    : hasAvailability ? 'Избери един или повече часа за запис.' : 'Няма свободни часове за тази дата.';
  for(const {hour,available} of slots){
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'time-slot';
    button.disabled = !available;
    button.dataset.hour = String(hour);
    button.textContent = interval(hour);
    button.setAttribute('aria-label',interval(hour)+(available ? ' — свободно' : ' — заето'));
    if(available){
      button.setAttribute('aria-pressed', String(selectedHours.has(hour)));
      button.addEventListener('click',()=>{
        if(selectedHours.has(hour)) selectedHours.delete(hour);
        else selectedHours.add(hour);
        renderTimes();
        grid.querySelector('[data-hour="'+hour+'"]').focus();
      });
    }
    grid.append(button);
  }
  if(hasSelection){
    const params = new URLSearchParams({service:'recording', date:selectedDate});
    for(const hour of [...selectedHours].sort((a,b)=>a-b)) params.append('hour',String(hour));
    const contact = location.protocol === 'file:' ? '../contact/index.html' : '../contact/';
    link.href = contact + '?' + params;
    link.hidden = false;
  }
}
function renderCalendar(){
  byId('month').textContent = monthLabel.format(month);
  const days = byId('days');
  days.replaceChildren();
  const clock = studioClock();
  const year = month.getUTCFullYear();
  const monthIndex = month.getUTCMonth();
  const todayMonth = clock.date.slice(0,7);
  byId('prev').disabled = month.toISOString().slice(0,7) <= todayMonth;
  const offset = (month.getUTCDay()+6)%7;
  const length = new Date(Date.UTC(year,monthIndex+1,0)).getUTCDate();
  for(let index=0;index<offset;index++) days.append(document.createElement('span'));
  for(let day=1;day<=length;day++){
    const date = new Date(Date.UTC(year,monthIndex,day));
    const iso = date.toISOString().slice(0,10);
    const past = iso < clock.date;
    const available = daySchedule(iso,clock).some(slot=>slot.available);
    const status = past ? 'past' : available ? '' : 'booked';
    const cell = document.createElement(past ? 'span' : 'button');
    cell.className = 'day '+status+(selectedDate === iso ? ' chosen' : '');
    cell.textContent = day;
    const statusText = past ? 'минала дата' : available ? 'има свободни часове' : 'няма свободни часове';
    cell.title = dateLabel.format(date)+' — '+statusText;
    cell.setAttribute('aria-label',cell.title);
    if(!past){
      cell.type = 'button';
      cell.dataset.date = iso;
      cell.setAttribute('aria-pressed',String(selectedDate === iso));
      cell.addEventListener('click',()=>{
        if(selectedDate !== iso) selectedHours.clear();
        selectedDate = iso;
        renderCalendar();
        days.querySelector('[data-date="'+iso+'"]').focus();
      });
    }
    days.append(cell);
  }
  renderTimes();
}
function moveMonth(delta){
  month = new Date(Date.UTC(month.getUTCFullYear(),month.getUTCMonth()+delta,1));
  selectedDate = '';
  selectedHours.clear();
  renderCalendar();
}
byId('prev').addEventListener('click',()=>moveMonth(-1));
byId('next').addEventListener('click',()=>moveMonth(1));
byId('date-link').addEventListener('click',event=>{
  const freeHours = new Set(daySchedule(selectedDate,studioClock()).filter(slot=>slot.available).map(slot=>slot.hour));
  if(!selectedHours.size || [...selectedHours].some(hour=>!freeHours.has(hour))){
    event.preventDefault();
    renderCalendar();
    return;
  }
});
renderCalendar();
