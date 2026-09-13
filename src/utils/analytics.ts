// Client-side analytics and campaign tracking utility

const SESSION_STORAGE_KEY = 'nmdp_berkeley_session_id';

export function getOrCreateSessionId(): string {
  if (typeof window === 'undefined') return 'sess-server';
  let id = localStorage.getItem(SESSION_STORAGE_KEY);
  if (!id) {
    id = 'sess-' + Math.random().toString(36).substring(2, 10) + '-' + Date.now().toString(36);
    localStorage.setItem(SESSION_STORAGE_KEY, id);
  }
  return id;
}

export async function trackVisitOnLoad(): Promise<boolean> {
  try {
    const sessionId = getOrCreateSessionId();
    const urlParams = new URLSearchParams(window.location.search);
    const source = urlParams.get('utm_source') || urlParams.get('source') || 'direct';
    const medium = urlParams.get('utm_medium') || (source.includes('qr') || source.includes('flyer') ? 'qr_code' : 'web');
    const campaign = urlParams.get('utm_campaign') || 'nmdp_berkeley_fall26';
    const referrer = document.referrer || 'direct';

    const res = await fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        source,
        medium,
        campaign,
        referrer,
        sessionId,
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Visit tracking request skipped or network offline:', err);
    return false;
  }
}

export async function trackEvent(
  type: 'qr_scanned' | 'pledge_submitted' | 'calendar_add' | 'map_opened' | 'quiz_answered' | 'share_clicked' | 'faq_toggled' | 'invitation_downloaded' | 'flyer_printed',
  metadata?: Record<string, any>
): Promise<boolean> {
  try {
    const sessionId = getOrCreateSessionId();
    const res = await fetch('/api/track/event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        sessionId,
        type,
        metadata: metadata || {},
      }),
    });
    return res.ok;
  } catch (err) {
    console.warn('Event tracking error:', err);
    return false;
  }
}

export function generateGoogleCalendarUrl(): string {
  // Monday September 21, 2026, 10:00 AM - 12:00 PM PDT
  // ISO with timezone: 20260921T170000Z to 20260921T190000Z
  const title = encodeURIComponent('NMDP Stem Cell Registry Tabling @ UC Berkeley');
  const details = encodeURIComponent(
    'September is Blood & Pediatric Cancer Awareness Month!\n\nJoin UC Berkeley MDes students outside the Amazon Hub Locker (2495 Bancroft Way) to learn about joining the NMDP Registry. A simple 30-second cheek swab can save a patient diagnosed with blood cancer.\n\nEvery 3-4 minutes, someone is diagnosed with blood cancer.'
  );
  const location = encodeURIComponent('Outside Amazon Hub Locker, 2495 Bancroft Way, Berkeley, CA 94720');
  const dates = '20260921T170000Z/20260921T190000Z'; // 10:00am - 12:00pm PDT is UTC-7 -> 17:00 - 19:00 UTC

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
}

export function downloadIcsFile(): void {
  const icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//UC Berkeley NMDP Tabling Campaign//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    'SUMMARY:NMDP Stem Cell Registry Tabling - UC Berkeley',
    'DESCRIPTION:September is Blood and Pediatric Cancer Awareness Month! Stop by outside Amazon Hub Locker (2495 Bancroft Way) to join the NMDP registry with a quick cheek swab and support blood cancer patients.',
    'LOCATION:Outside Amazon Hub Locker, 2495 Bancroft Way, Berkeley, CA 94720',
    'DTSTART:20260921T170000Z',
    'DTEND:20260921T190000Z',
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');

  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'NMDP-Berkeley-Tabling-Session.ics';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
