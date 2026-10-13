import { useEffect, useState } from 'react'
import CrtScreen from '../../components/CrtScreen'
import './Calendar.css'

type CalendarEvent = {
  day: number // Monday = 0
  start: string
  durationMinutes: number
  title: string
}

const START_HOUR = 8
const END_HOUR = 20
const DAY_MINUTES = (END_HOUR - START_HOUR) * 60

// Sample events repeat each week until a real calendar source is connected.
const DUMMY_EVENTS: CalendarEvent[] = [
  { day: 0, start: '09:00', durationMinutes: 60, title: 'PLAN WEEK' },
  { day: 0, start: '14:00', durationMinutes: 90, title: 'FOCUS' },
  { day: 1, start: '10:30', durationMinutes: 60, title: 'DESIGN' },
  { day: 1, start: '16:00', durationMinutes: 45, title: 'CHECK IN' },
  { day: 2, start: '09:30', durationMinutes: 30, title: 'STANDUP' },
  { day: 2, start: '13:00', durationMinutes: 120, title: 'BUILD' },
  { day: 3, start: '11:00', durationMinutes: 60, title: 'REVIEW' },
  { day: 3, start: '15:30', durationMinutes: 60, title: 'DEEP WORK' },
  { day: 4, start: '10:00', durationMinutes: 45, title: 'SYNC' },
  { day: 4, start: '14:30', durationMinutes: 90, title: 'WRAP UP' },
  { day: 5, start: '12:00', durationMinutes: 90, title: 'OPEN SLOT' },
  { day: 6, start: '17:00', durationMinutes: 60, title: 'RESET' },
]

const weekdayFormatter = new Intl.DateTimeFormat(undefined, { weekday: 'short' })
const rangeFormatter = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })

function getCurrentWeek(today: Date): Date[] {
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7))

  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday)
    day.setDate(monday.getDate() + index)
    return day
  })
}

function EventBlock({ event }: { event: CalendarEvent }) {
  const [hours, minutes] = event.start.split(':').map(Number)
  const startMinutes = hours * 60 + minutes - START_HOUR * 60
  const top = (startMinutes / DAY_MINUTES) * 100
  const height = (event.durationMinutes / DAY_MINUTES) * 100

  return (
    <article
      className="calendar__event"
      style={{ top: `${top}%`, height: `${height}%` }}
      aria-label={`${event.title} at ${event.start}`}
    >
      <span className="calendar__event-time">{event.start}</span>
      <span className="calendar__event-title">{event.title}</span>
    </article>
  )
}

function DayColumn({ date, index, today }: { date: Date; index: number; today: Date }) {
  const isToday = date.toDateString() === today.toDateString()
  const className = `calendar__day${isToday ? ' calendar__day--today' : ''}`

  return (
    <div className={className} aria-label={date.toDateString()}>
      {DUMMY_EVENTS.filter((event) => event.day === index).map((event) => (
        <EventBlock key={`${event.start}-${event.title}`} event={event} />
      ))}
    </div>
  )
}

export default function Calendar() {
  const [today, setToday] = useState(() => new Date())

  // Keep the highlighted day and week current if the CRT stays open overnight.
  useEffect(() => {
    const interval = window.setInterval(() => setToday(new Date()), 60_000)
    return () => window.clearInterval(interval)
  }, [])

  const week = getCurrentWeek(today)
  const weekLabel = `${rangeFormatter.format(week[0])} — ${rangeFormatter.format(week[6])}`

  return (
    <CrtScreen>
      <section className="calendar" aria-label={`Calendar week of ${weekLabel}`}>
        <header className="calendar__topbar">
          <div>
            <span className="calendar__eyebrow">CRT / CALENDAR</span>
            <h1>WEEK VIEW</h1>
          </div>
          <span className="calendar__range">{weekLabel}</span>
        </header>

        <div className="calendar__grid">
          <div className="calendar__headings">
            {week.map((date) => {
              const isToday = date.toDateString() === today.toDateString()
              return (
                <div className={`calendar__heading${isToday ? ' calendar__heading--today' : ''}`} key={date.toISOString()}>
                  <span>{weekdayFormatter.format(date).toUpperCase()}</span>
                  <strong>{date.getDate()}</strong>
                </div>
              )
            })}
          </div>
          <div className="calendar__days">
            {week.map((date, index) => (
              <DayColumn date={date} index={index} today={today} key={date.toISOString()} />
            ))}
          </div>
        </div>

        <footer className="calendar__footer">
          <span>08:00 — 20:00</span>
          <span>LOCAL TIME / SAMPLE DATA</span>
        </footer>
      </section>
    </CrtScreen>
  )
}
