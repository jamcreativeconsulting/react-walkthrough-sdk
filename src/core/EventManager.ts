import { EventCallback, EventRegistry } from '../types';

export class EventManager {
  private events: { [key: string]: ((data?: any) => void)[] } = {};

  /**
   * Register an event listener
   * @param eventName - Name of the event to listen for
   * @param callback - Function to call when event occurs
   */
  on(eventName: string, callback: (data?: any) => void): void {
    console.log('EventManager: Registering listener for event:', eventName);
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
  off(eventName: string, callback: (data?: any) => void): void {
    console.log('EventManager: Removing listener for event:', eventName);
    if (!this.events[eventName]) return;
    this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
  }

  /**
   * Emit an event with optional data
   * @param eventName - Name of the event to emit
   * @param data - Optional data to pass to event listeners
   */
  emit(eventName: string, data?: any): void {
    console.log('EventManager: Emitting event:', eventName, 'with data:', data);
    if (!this.events[eventName]) {
      console.log('EventManager: No listeners for event:', eventName);
      return;
    }
    this.events[eventName].forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('EventManager: Error in event listener:', error);
      }
    });
  }

  /**
   * Remove all event listeners
   */
  clear(): void {
    console.log('EventManager: Clearing all event listeners');
    this.events = {};
  }
} 