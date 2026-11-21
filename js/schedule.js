const byId = id => document.getElementById(id);
const sofia = new Intl.DateTimeFormat('en-CA', {
  timeZone:'Europe/Sofia', year:'numeric', month:'2-digit', day:'2-digit',
  hour:'2-digit', hourCycle:'h23',
});
const dateLabel = new Intl.DateTimeFormat('bg-BG', {day:'numeric',month:'long',year:'numeric',timeZone:'UTC'});
const monthLabel = new Intl.DateTimeFormat('bg-BG', {month:'long',year:'numeric',timeZone:'UTC'});
const dateTime = value => new Date(value+'T00:00:00Z');
function studioClock(){
  const parts = Object.fromEntries(sofia.formatToParts(new Date()).map(({type,value})=>[type,value]));
  return {date:parts.year+'-'+parts.month+'-'+parts.day, hour:Number(parts.hour)};
}
const initialDate = studioClock().date;
const sessionHours = window.HITACHKA_CONTENT.hours;
const timeText = hour => String(hour).padStart(2,'0')+':00';
const interval = hour => timeText(hour)+' – '+timeText(hour+1);
const hourList = hours => [...hours].sort((a,b)=>a-b).map(interval).join(', ');

function daySchedule(date, clock){
  if(date < clock.date) return [];
  const openHours = window.HITACHKA_CONTENT.days[date] ?? sessionHours;
  return sessionHours
    .filter(hour=>date !== clock.date || hour > clock.hour)
    .map(hour=>({hour, available:openHours.includes(hour)}));
}
