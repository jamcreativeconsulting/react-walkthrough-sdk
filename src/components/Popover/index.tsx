import * as React from 'react';
import type { FC } from 'react';
import { WalkthroughStep } from '../../types';
import './Popover.css';

interface PopoverProps {
  step: WalkthroughStep;
  onNext?: () => void;
  onPrevious?: () => void;
  onSkip?: () => void;
  onClose?: () => void;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const Popover: FC<PopoverProps> = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  position = 'bottom',
}) => {
  const [popoverPosition, setPopoverPosition] = React.useState({ top: 0, left: 0 });
  const popoverRef = React.useRef<HTMLDivElement>(null);
  const targetRef = React.useRef<HTMLElement | null>(null);
  const closeButtonRef = React.useRef<HTMLButtonElement>(null);

  // Focus management
  React.useEffect(() => {
    if (popoverRef.current) {
      popoverRef.current.focus();
    }
  }, []);

  // Position calculation
  React.useEffect(() => {
    const target = document.querySelector(step.target);
    if (target instanceof HTMLElement) {
      targetRef.current = target;
      updatePosition(target);
    }

    // Update position on window resize
    const handleResize = () => {
      if (targetRef.current) {
        updatePosition(targetRef.current);
      }
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [step.target, position]);

  const updatePosition = (target: HTMLElement) => {
    if (!popoverRef.current) return;

    const targetRect = target.getBoundingClientRect();
    const popoverRect = popoverRef.current.getBoundingClientRect();
    const offset = 10; // Distance between target and popover

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - popoverRect.height - offset;
        left = targetRect.left + (targetRect.width - popoverRect.width) / 2;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - popoverRect.height) / 2;
        left = targetRect.right + offset;
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + (targetRect.width - popoverRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - popoverRect.height) / 2;
        left = targetRect.left - popoverRect.width - offset;
        break;
    }

    setPopoverPosition({ top, left });
  };

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose?.();
        break;
      case 'Tab':
        // Trap focus within the popover
        if (popoverRef.current) {
          const focusableElements = popoverRef.current.querySelectorAll(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
          const firstFocusable = focusableElements[0] as HTMLElement;
          const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (event.shiftKey) {
            if (document.activeElement === firstFocusable) {
              lastFocusable.focus();
            }
          } else {
            if (document.activeElement === lastFocusable) {
              firstFocusable.focus();
            }
          }
        }
        break;
    }
  };

  return (
    <div
      ref={popoverRef}
      className="walkthrough-popover"
      style={{
        top: `${popoverPosition.top}px`,
        left: `${popoverPosition.left}px`,
      }}
      role="dialog"
      aria-labelledby="popover-title"
      aria-describedby="popover-content"
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div className="walkthrough-popover-header">
        {step.title && <h3 id="popover-title">{step.title}</h3>}
        <button
          ref={closeButtonRef}
          className="walkthrough-popover-close"
          onClick={onClose}
          aria-label="Close walkthrough"
        >
          ×
        </button>
      </div>
      <div id="popover-content" className="walkthrough-popover-content">
        {step.content}
      </div>
      <div className="walkthrough-popover-footer">
        <div className="walkthrough-popover-navigation">
          <button
            className="walkthrough-popover-button"
            onClick={onPrevious}
            disabled={!onPrevious}
            aria-label="Previous step"
          >
            Previous
          </button>
          <button
            className="walkthrough-popover-button"
            onClick={onNext}
            disabled={!onNext}
            aria-label="Next step"
          >
            Next
          </button>
        </div>
        {onSkip && (
          <button
            className="walkthrough-popover-button walkthrough-popover-skip"
            onClick={onSkip}
            aria-label="Skip walkthrough"
          >
            Skip
          </button>
        )}
      </div>
    </div>
  );
};

export { Popover }; 