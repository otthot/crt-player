# crt-player
An open source CRT player that shows songs or calendar


### Use
From fastapi to run: 
```uv run fastapi dev main.py```


## Calendar integration (planned)

The browser can't read the Mac's Calendar directly, so the calendar follows the same pattern as Spotify:
the FastAPI backend fetches the data, exposes an endpoint, and a client hook polls it.

```
Calendar source ──> FastAPI (GET /calendar/upcoming) ──> useCalendar hook ──> CalendarView in CrtScreen
```

### Backend: two options, depending on where it runs

**Option 1: EventKit (backend runs on the Mac)**
- Read Calendar.app's data through Apple's EventKit framework via `pyobjc-framework-EventKit`.
- Covers every calendar Calendar.app shows (iCloud, Google, Exchange, local), with no extra accounts or tokens.
- On first run, macOS asks for Calendar access for the process running the backend (Terminal, VS Code, ...).
  Manage it later in System Settings → Privacy & Security → Calendars.
- Limitation: macOS only. It won't work if the backend moves to e.g. a Raspberry Pi.

```
uv add pyobjc-framework-EventKit
```

**Option 2: ICS / CalDAV feed (backend runs anywhere)**
- iCloud: Calendar → right-click the calendar → Share → Public Calendar → copy the `webcal://` URL
  (replace `webcal://` with `https://`).
- Google: Calendar settings → "Secret address in iCal format".
- Fetch the URL from the backend and parse it with `icalendar`, or with `recurring-ical-events` to expand repeating events.
- Store the URL(s) in `.env`, never in code.
- Limitations: one URL per calendar, and changes show up with a short delay.

```
uv add httpx icalendar recurring-ical-events
```

Pick EventKit if the player only runs on the Mac. Pick ICS if it will run on a separate device.

### Endpoint

`GET /calendar/upcoming` returns the next events, sorted by start time:

```json
[
  { "title": "Standup", "start": "2026-10-13T09:00:00+02:00", "end": "2026-10-13T09:15:00+02:00", "all_day": false, "calendar": "Work" }
]
```

### Client

- `src/types/CalendarEvent.ts`: type matching the response above.
- `src/hooks/useCalendar.ts`: same shape as `useTrack.ts` (`useFetch` + interval). Poll slowly, e.g. every 60s.
- `src/views/CalendarView/`: view rendered inside `CrtScreen`. Size everything in `cqmin` units so it scales
  with the square `.app` container, like `Player.css`.

## Layout

The app is always a centered 1:1 square that fills the shorter side of the viewport (`.app` in `src/App.css`).
`.app` is a size container, so views size themselves in `cqmin` units and scale with the window.

# Ideas:
- [ ] implement motion sensor to skip to next song on hand gesture
- [ ] display currently playing song 