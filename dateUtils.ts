
// Italian Public Holidays (fixed for simplicity, can be expanded)
// Format: MM-DD
const publicHolidays2025: Set<string> = new Set([
  '01-01', // Capodanno
  '01-06', // Epifania
  '04-20', // Pasqua (example, needs dynamic calc for real app) - Easter Sunday
  '04-21', // Pasquetta (example, needs dynamic calc for real app) - Easter Monday
  '04-25', // Festa della Liberazione
  '05-01', // Festa dei Lavoratori
  '06-02', // Festa della Repubblica
  '08-15', // Ferragosto
  '11-01', // Ognissanti
  '12-08', // Immacolata Concezione
  '12-25', // Natale
  '12-26', // Santo Stefano
]);

// For other years, you might need a more dynamic holiday calculation, especially for Easter.
// This is a simplified version.
const publicHolidaysGeneric: Set<string> = new Set([
  '01-01', '01-06', '04-25', '05-01', '06-02', '08-15', '11-01', '12-08', '12-25', '12-26',
]);


// Function to calculate Easter Sunday for a given year
// Using the Anonymous Gregorian algorithm
function getEasterSunday(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}


function getPublicHolidaysForYear(year: number): Set<string> {
  const holidays = new Set<string>(publicHolidaysGeneric);
  const easterSunday = getEasterSunday(year);
  const easterMonday = new Date(easterSunday);
  easterMonday.setDate(easterSunday.getDate() + 1);

  holidays.add(`${String(easterSunday.getMonth() + 1).padStart(2, '0')}-${String(easterSunday.getDate()).padStart(2, '0')}`);
  holidays.add(`${String(easterMonday.getMonth() + 1).padStart(2, '0')}-${String(easterMonday.getDate()).padStart(2, '0')}`);
  
  // Specific year overrides if needed (like 2025 example provided)
  if (year === 2025) {
    publicHolidays2025.forEach(h => holidays.add(h)); // Ensure 2025 specific ones are present
  }

  return holidays;
}


export function getDaysInMonth(year: number, month: number): number { // month is 1-12
  return new Date(year, month, 0).getDate();
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // Sunday or Saturday
}

export function calculateWorkingDays(year: number, month: number): number { // month is 1-12
  const daysInMonth = getDaysInMonth(year, month);
  let workingDays = 0;
  const holidaysForYear = getPublicHolidaysForYear(year);

  for (let day = 1; day <= daysInMonth; day++) {
    const currentDate = new Date(year, month - 1, day);
    const monthStr = String(month).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const holidayKey = `${monthStr}-${dayStr}`;

    if (!isWeekend(currentDate) && !holidaysForYear.has(holidayKey)) {
      workingDays++;
    }
  }
  return workingDays;
}
