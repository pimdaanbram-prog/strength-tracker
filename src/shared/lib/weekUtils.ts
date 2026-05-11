export function getWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

export function getYear(date: Date): number {
  return date.getFullYear()
}

export function getDayLabel(date: Date): string {
  const days = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag']
  return days[date.getDay()]
}

export function getMonthLabel(date: Date): string {
  const months = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ]
  return months[date.getMonth()]
}

export function formatDate(date: Date): string {
  const day = date.getDate()
  const month = getMonthLabel(date)
  return `${day} ${month}`
}

export function formatDateShort(date: Date): string {
  const day = date.getDate().toString().padStart(2, '0')
  const month = (date.getMonth() + 1).toString().padStart(2, '0')
  return `${day}-${month}`
}

export function getWeekDates(weekNumber: number, year: number): Date[] {
  const jan1 = new Date(year, 0, 1)
  const days = (weekNumber - 1) * 7
  const weekStart = new Date(jan1)
  weekStart.setDate(jan1.getDate() + days - (jan1.getDay() || 7) + 1)

  const dates: Date[] = []
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart)
    d.setDate(weekStart.getDate() + i)
    dates.push(d)
  }
  return dates
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

export function isToday(date: Date): boolean {
  return isSameDay(date, new Date())
}

export function getStartOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getDay() || 7
  d.setDate(d.getDate() - day + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

export function daysAgo(n: number): Date {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d
}

export function toISODateString(date: Date): string {
  return date.toISOString().split('T')[0]
}
