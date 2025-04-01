import React, { useState, useRef, useEffect } from 'react';
import './Popover.css';
import type { WalkthroughStep } from '../../types';

interface PopoverProps {
  step: WalkthroughStep;
  onNext: () => void;
  onPrevious: () => void;
  onSkip: () => void;
  onClose: () => void;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

export const Popover: React.FC<PopoverProps> = ({
  step,
  onNext,
  onPrevious,
  onSkip,
  onClose,
  position = 'bottom'
}) => {
  const [popoverStyle, setPopoverStyle] = useState<React.CSSProperties>({});
  const popoverRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    console.log('Popover mounted with step:', step);
    const target = document.querySelector(step.target);
    if (!target) {
      console.error('Target element not found:', step.target);
      return;
    }
    targetRef.current = target as HTMLElement;
    console.log('Target element found:', targetRef.current);

    const updatePosition = () => {
      if (!popoverRef.current || !targetRef.current) return;

      const targetRect = targetRef.current.getBoundingClientRect();
      const popoverRect = popoverRef.current.getBoundingClientRect();
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'bottom':
          top = targetRect.bottom + scrollY + 10;
          left = targetRect.left + scrollX + (targetRect.width - popoverRect.width) / 2;
          break;
        case 'top':
          top = targetRect.top + scrollY - popoverRect.height - 10;
          left = targetRect.left + scrollX + (targetRect.width - popoverRect.width) / 2;
          break;
        case 'left':
          top = targetRect.top + scrollY + (targetRect.height - popoverRect.height) / 2;
          left = targetRect.left + scrollX - popoverRect.width - 10;
          break;
        case 'right':
          top = targetRect.top + scrollY + (targetRect.height - popoverRect.height) / 2;
          left = targetRect.right + scrollX + 10;
          break;
      }

      setPopoverStyle({
        top: `${top}px`,
        left: `${left}px`
      });
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition);

    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition);
    };
  }, [step, position]);

  return (
    <div
      ref={popoverRef}
      className="walkthrough-popover"
      style={popoverStyle}
      role="dialog"
      aria-labelledby="popover-title"
      aria-describedby="popover-content"
    >
      <div className="walkthrough-popover-header">
        <h3 id="popover-title">Walkthrough Step</h3>
        <button
          className="walkthrough-popover-close"
          onClick={onClose}
          aria-label="Close"
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
            aria-label="Previous step"
          >
            Previous
          </button>
          <button
            className="walkthrough-popover-button"
            onClick={onNext}
            aria-label="Next step"
          >
            Next
          </button>
        </div>
        <button
          className="walkthrough-popover-button walkthrough-popover-skip"
          onClick={onSkip}
        >
          Skip
        </button>
      </div>
    </div>
  );
}; 