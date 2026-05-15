export function trackClientEvent(
  eventType: string,
  metadata: Record<string, unknown> = {}
): void {
  fetch('/api/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ eventType, metadata }),
    keepalive: true,
  }).catch(() => undefined);
}
