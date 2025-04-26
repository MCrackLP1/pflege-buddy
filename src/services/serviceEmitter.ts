import { DeviceEventEmitter, Platform } from 'react-native';

/**
 * Event-Typen für den Service Event Emitter
 */
interface ServiceEvents {
  'tracking_status_changed': { isTracking: boolean };
  'location_status_changed': { 
    isAtWorkLocation: boolean;
    status?: string;
    latitude?: number;
    longitude?: number;
  };
  'tracking_error': Error;
  'service_connection_changed': { connected: boolean };
}

/**
 * Einfacher Event-Emitter für die Kommunikation zwischen Services
 */
class ServiceEventEmitter {
  constructor() {}

  on<E extends keyof ServiceEvents>(event: E, listener: (data: ServiceEvents[E]) => void) {
    return DeviceEventEmitter.addListener(event as string, listener);
  }

  emit<E extends keyof ServiceEvents>(event: E, data: ServiceEvents[E]): void {
    DeviceEventEmitter.emit(event as string, data);
  }

  removeListener<E extends keyof ServiceEvents>(event: E, subscription: any): void {
    if (subscription && typeof subscription.remove === 'function') {
      subscription.remove();
    }
  }
}

/**
 * Zentrale Event-Emitter-Instanz für die Kommunikation zwischen Services
 */
export const serviceEventEmitter = new ServiceEventEmitter(); 