import React, { useRef, useState, useEffect } from 'react';

interface ChartContainerProps {
  children: (width: number, height: number) => React.ReactNode;
  height?: number;
  className?: string;
  ariaLabel?: string;
}

/**
 * A wrapper component that solves ResponsiveContainer issues on iOS Safari
 * by manually calculating and providing dimensions
 */
export function ChartContainer({ 
  children, 
  height = 300, 
  className = '',
  ariaLabel 
}: ChartContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height });

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width } = containerRef.current.getBoundingClientRect();
        setDimensions({ width: Math.floor(width), height });
      }
    };

    // Initial measurement
    updateDimensions();

    // Debounced resize handler
    let timeoutId: ReturnType<typeof setTimeout>;
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimensions, 100);
    };

    window.addEventListener('resize', handleResize);
    
    // Also observe the container for size changes
    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
      resizeObserver.disconnect();
    };
  }, [height]);

  return (
    <div 
      ref={containerRef}
      className={`w-full ${className}`}
      style={{ height: `${height}px`, minHeight: `${height}px` }}
      aria-label={ariaLabel}
    >
      {dimensions.width > 0 && children(dimensions.width, dimensions.height)}
    </div>
  );
}
