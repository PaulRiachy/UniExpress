export const CAMPUS_TIMEZONE = 'Asia/Beirut';
const clock = new Intl.DateTimeFormat('en-GB', {
  timeZone: CAMPUS_TIMEZONE, weekday: 'short', year: 'numeric', month: '2-digit',
  day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
});
const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function getCampusTime(now = new Date()) {
  const parts = Object.fromEntries(clock.formatToParts(now).map(part => [part.type, part.value]));
  return {
    weekday: weekdays.indexOf(parts.weekday),
    minutes: Number(parts.hour) * 60 + Number(parts.minute) + Number(parts.second) / 60,
    date: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

export function timeInMinutes(value) {
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(':').map(Number);
  return hour * 60 + minute;
}

export function getStoreStatus(store, now = new Date()) {
  const closed = message => ({ isOpen: false, label: 'Closed', message });
  if (!store?.is_active) return closed('Store unavailable for ordering.');
  const { weekday, minutes } = getCampusTime(now);
  const today = store.hours?.find(hours => hours.weekday === weekday);
  if (!today) return closed('Opening hours unavailable.');
  if (today.is_closed) return closed('Closed today. Browse for later.');
  const opens = timeInMinutes(today.opens_at), closes = timeInMinutes(today.closes_at);
  if (opens === null || closes === null || closes <= opens) {
    // Overnight/24-hour semantics are not defined by the current academic schedule.
    return closed('Opening hours unavailable.');
  }
  const isOpen = minutes >= opens && minutes < closes;
  return {
    isOpen, label: isOpen ? 'Open' : 'Closed',
    message: isOpen ? `Open until ${today.closes_at} · Beirut time` : `Hours ${today.opens_at}–${today.closes_at} · Beirut time. Unavailable for ordering.`,
  };
}

// Informational only: today's next unstarted recurring window. No invented day/cutoff policy.
export function getNextCandidateSlot(slots, now = new Date()) {
  const { minutes, date } = getCampusTime(now);
  const slot = slots.filter(item => {
    const start = timeInMinutes(item.start_time), end = timeInMinutes(item.end_time);
    return item.is_active && start !== null && end !== null && start > minutes && end > start;
  }).sort((a, b) => a.start_time.localeCompare(b.start_time) || a.sort_order - b.sort_order || a.id.localeCompare(b.id))[0];
  return slot ? { ...slot, date } : null;
}
