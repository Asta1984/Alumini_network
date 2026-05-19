'use client';

import React, { useState, useEffect, useMemo } from 'react';

export const MemoryWallSpinner = () => {
  const [mounted, setMounted] = useState(false);

  const SPEED = 1;
  const SQUARE_COUNT = 10;

  useEffect(() => {
    setMounted(true);
    
    // Inject animation styles
    const styleId = 'memory-wall-spinner-styles';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.textContent = `
        @keyframes magic {
          0% {
            transform: scale(0) rotate(0deg);
            filter: blur(0px);
          }
          50% {
            transform: scale(1) rotate(90deg);
            filter: blur(0.5px);
          }
          100% {
            transform: scale(2) rotate(180deg);
            filter: blur(1px);
          }
        }

        @keyframes glow {
          0%, 100% { opacity: 0.2; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.5); }
        }

        .memory-wall-square {
          animation: magic calc(2s / var(--speed, 1)) ease infinite alternate;
          animation-delay: var(--delay);
          transform-origin: center;
          will-change: transform;
        }
      `;
      document.head.appendChild(style);
    }
    
    return () => {
      const style = document.getElementById(styleId);
      if (style && document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const squares = useMemo(() => {
    return Array.from({ length: SQUARE_COUNT }, (_, i) => {
      const index = i + 1;
      const hue = (index * 360 / SQUARE_COUNT) % 360;
      return {
        id: index,
        padding: index * 10,
        offset: index * -10,
        color: `hsl(${260 + hue / 3}, 80%, 60%)`,
        delay: i * 0.1,
      };
    });
  }, []);

  if (!mounted) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: '100%',
        minHeight: '200px'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '4px solid transparent',
          borderTopColor: '#a855f7',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
      minHeight: '200px',
      background: 'transparent'
    }}>
      <div style={{ position: 'relative' }}>
        {squares.map((square) => (
          <div
            key={square.id}
            className="memory-wall-square"
            style={{
              position: 'absolute',
              boxSizing: 'content-box',
              padding: `${square.padding}px`,
              top: `${square.offset}px`,
              left: `${square.offset}px`,
              border: `1px solid ${square.color}`,
              boxShadow: `0 0 3px ${square.color}, inset 0 0 3px rgba(255, 255, 255, 0.1)`,
              borderRadius: '2px',
              '--delay': `${square.delay}s`,
              '--speed': SPEED,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};
