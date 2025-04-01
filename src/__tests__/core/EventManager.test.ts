import { EventManager } from '../../core/EventManager';

describe('EventManager', () => {
  let eventManager: EventManager;

  beforeEach(() => {
    eventManager = new EventManager();
  });

  it('should register event listeners', () => {
    const callback = jest.fn();
    eventManager.on('test', callback);
    eventManager.emit('test');
    expect(callback).toHaveBeenCalled();
  });

  it('should remove event listeners', () => {
    const callback = jest.fn();
    eventManager.on('test', callback);
    eventManager.off('test', callback);
    eventManager.emit('test');
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle multiple listeners for the same event', () => {
    const callback1 = jest.fn();
    const callback2 = jest.fn();
    eventManager.on('test', callback1);
    eventManager.on('test', callback2);
    eventManager.emit('test');
    expect(callback1).toHaveBeenCalled();
    expect(callback2).toHaveBeenCalled();
  });

  it('should pass data to event listeners', () => {
    const testData = { foo: 'bar' };
    const callback = jest.fn();
    eventManager.on('test', callback);
    eventManager.emit('test', testData);
    expect(callback).toHaveBeenCalledWith(testData);
  });

  it('should clear all event listeners', () => {
    const callback = jest.fn();
    eventManager.on('test', callback);
    eventManager.clear();
    eventManager.emit('test');
    expect(callback).not.toHaveBeenCalled();
  });

  it('should handle errors in event listeners gracefully', () => {
    const consoleError = jest.spyOn(console, 'error').mockImplementation();
    const callback = jest.fn().mockImplementation(() => {
      throw new Error('Test error');
    });
    eventManager.on('test', callback);
    eventManager.emit('test');
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
}); 