import { EventCallback, EventRegistry } from '../types';

export class EventManager {
  private events: EventRegistry = {};

  /**
   * Register an event listener
   * @param eventName - Name of the event to listen for
   * @param callback - Function to call when event occurs
   */
  on(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) {
      this.events[eventName] = [];
    }
    this.events[eventName].push(callback);
  }

  /**
   * Remove an event listener
   * @param eventName - Name of the event to remove listener from
   * @param callback - Function to remove
   */
  off(eventName: string, callback: EventCallback): void {
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emit an event with optional data
   * @param eventName - Name of the event to emit
   * @param data - Optional data to pass to event listeners
   */
  emit(eventName: string, data?: any): void {
    if (!this.events[eventName]) return;
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${eventName}:`, error);
      }
    });
  }

  /**
   * Remove all event listeners
   */
  clear(): void {
    this.events = {};
  }
} 