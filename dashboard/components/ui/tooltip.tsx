'use client';

import * as React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

export function Tooltip({ children, content, side = 'right' }: TooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false);
  const [position, setPosition] = React.useState({ top: 0, left: 0 });
  const childRef = React.useRef<HTMLDivElement>(null);

  const updatePosition = React.useCallback(() => {
    if (!childRef.current) return;

    const rect = childRef.current.getBoundingClientRect();
    const tooltipOffset = 8; // ml-2 = 8px

    let top = 0;
    let left = 0;

    switch (side) {
      case 'right':
        top = rect.top + rect.height / 2;
        left = rect.right + tooltipOffset;
        break;
      case 'left':
        top = rect.top + rect.height / 2;
        left = rect.left - tooltipOffset;
        break;
      case 'top':
        top = rect.top - tooltipOffset;
        left = rect.left + rect.width / 2;
        break;
      case 'bottom':
        top = rect.bottom + tooltipOffset;
        left = rect.left + rect.width / 2;
        break;
    }

    setPosition({ top, left });
  }, [side]);

  React.useEffect(() => {
    if (isVisible && childRef.current) {
      updatePosition();
      const handleScroll = () => updatePosition();
      const handleResize = () => updatePosition();
      
      window.addEventListener('scroll', handleScroll, true);
      window.addEventListener('resize', handleResize);
      
      return () => {
        window.removeEventListener('scroll', handleScroll, true);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible, updatePosition]);

  const getTooltipClasses = () => {
    return 'fixed z-[9999] px-3 py-1.5 text-xs font-medium text-white bg-gray-900 rounded-md shadow-lg whitespace-nowrap pointer-events-none';
  };

  const getArrowPosition = () => {
    const arrowSize = 4; // border-4 = 4px
    const offset = 8; // spacing from element
    
    switch (side) {
      case 'right':
        return {
          right: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderRight: `4px solid rgb(17, 24, 39)`, // gray-900
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
        };
      case 'left':
        return {
          left: '100%',
          top: '50%',
          transform: 'translateY(-50%)',
          borderLeft: `4px solid rgb(17, 24, 39)`,
          borderTop: '4px solid transparent',
          borderBottom: '4px solid transparent',
        };
      case 'top':
        return {
          bottom: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderTop: `4px solid rgb(17, 24, 39)`,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
        };
      case 'bottom':
        return {
          top: '-4px',
          left: '50%',
          transform: 'translateX(-50%)',
          borderBottom: `4px solid rgb(17, 24, 39)`,
          borderLeft: '4px solid transparent',
          borderRight: '4px solid transparent',
        };
      default:
        return {};
    }
  };

  return (
    <>
      <div
        ref={childRef}
        className="inline-block"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </div>
      {isVisible && typeof window !== 'undefined' && createPortal(
        <div
          className={getTooltipClasses()}
          style={{
            top: side === 'right' || side === 'left' 
              ? `${position.top}px` 
              : `${position.top}px`,
            left: side === 'right' || side === 'left'
              ? `${position.left}px`
              : `${position.left}px`,
            transform: side === 'right' || side === 'left'
              ? 'translateY(-50%)'
              : side === 'top'
              ? 'translateX(-50%) translateY(-100%)'
              : 'translateX(-50%)',
          }}
        >
          {content}
          <div
            className="absolute w-0 h-0"
            style={getArrowPosition()}
          />
        </div>,
        document.body
      )}
    </>
  );
}

