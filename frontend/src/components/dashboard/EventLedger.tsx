import { useState } from 'react'
import { useTelemetryStore } from '../../telemetry/telemetryStore'
export function EventLedger() {
  const events = useTelemetryStore((s) => s.events)
  const [expanded, setExpanded] = useState(false)
  return <section className="event-ledger" aria-label="Recent events">
    <div className="ledger-heading"><h2>Recent events <span>{String(events.length).padStart(2, '0')}</span></h2><button onClick={() => setExpanded(!expanded)}>{expanded ? 'Show less' : 'View history'} <span>↗</span></button></div>
    <div className={'event-list ' + (expanded ? 'expanded' : '')}>
      {events.slice(0, expanded ? 30 : 3).map((event) => <div className="event-row" key={event.id}>
        <time>{event.time}</time><span className={'event-severity tone-' + event.severity}><i className="state-dot" />{event.severity}</span><span className="event-message">{event.message}</span><span className="event-source">{event.source}</span>
      </div>)}
      {!events.length && <p className="empty-events">No events in this session.</p>}
    </div>
  </section>
}
