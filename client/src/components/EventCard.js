import React from 'react';

export default function EventCard({ event, onRegister, onCancel, canRegister, isRegistered, busy }) {
  return (
    <article className="event-card">
      <div className="event-image-wrap">
        {event.imageUrl ? (
          <img alt={event.title} className="event-image" src={event.imageUrl} />
        ) : (
          <div className="event-image placeholder-image">{event.category}</div>
        )}
        <span className={`status-pill ${event.status.toLowerCase()}`}>{event.status}</span>
      </div>
      <div className="event-content">
        <div className="event-meta-row">
          <span>{new Date(event.date).toLocaleDateString()}</span>
          <span>{event.time}</span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description}</p>
        <div className="event-details">
          <span>{event.location}</span>
          <span>{event.eventType}</span>
          <span>{event.category}</span>
        </div>
        <div className="event-footer">
          <span>Participants: {event.participantsCount || 0}</span>
          {canRegister && !isRegistered && (
            <form
              onSubmit={(eventObject) => {
                eventObject.preventDefault();
                onRegister(event._id);
              }}
            >
              <button className="solid-button" disabled={busy} type="submit">
                Register
              </button>
            </form>
          )}
          {canRegister && isRegistered && (
            <form
              onSubmit={(eventObject) => {
                eventObject.preventDefault();
                onCancel(event._id);
              }}
            >
              <button className="ghost-button" disabled={busy} type="submit">
                Cancel Registration
              </button>
            </form>
          )}
        </div>
      </div>
    </article>
  );
}
