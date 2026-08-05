export interface AnalyticsEvent {
  eventId: string;
  eventType: 'query_sent' | 'feedback_given' | 'action_executed' | 'tour_started' | 'tour_completed';
  timestamp: string;
  payload: Record<string, unknown>;
}

/**
 * Client-Side Privacy-Friendly AI Analytics Engine (Zero PII).
 */
export class AIAnalytics {
  private static eventsBuffer: AnalyticsEvent[] = [];
  private static maxBufferLength = 50;

  /**
   * Log an anonymous analytics event.
   */
  public static logEvent(
    eventType: AnalyticsEvent['eventType'],
    payload: Record<string, unknown> = {}
  ): void {
    const event: AnalyticsEvent = {
      eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      eventType,
      timestamp: new Date().toISOString(),
      payload,
    };

    this.eventsBuffer.push(event);

    if (this.eventsBuffer.length >= this.maxBufferLength) {
      this.flush();
    }
  }

  /**
   * Get all buffered analytics events.
   */
  public static getEvents(): AnalyticsEvent[] {
    return [...this.eventsBuffer];
  }

  /**
   * Flush event buffer.
   */
  public static flush(): void {
    this.eventsBuffer = [];
  }
}
