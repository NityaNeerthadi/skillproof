import React, { useState, useEffect, useRef } from 'react';

/**
 * AnimatedNumber
 * Smoothly interpolates and transitions numbers across view changes, currency switches
 * (e.g. Lakh to Thousand), statistics roll-ups, and match percentages.
 */
export const AnimatedNumber = ({
  value = 0,
  duration = 450,
  format = 'number', // 'number' | 'currency-in' | 'percent' | 'raw'
  prefix = '',
  suffix = '',
  decimals = 0,
  className = '',
  style = {}
}) => {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0;
  const [displayValue, setDisplayValue] = useState(numValue);
  const startValRef = useRef(numValue);
  const startTimeRef = useRef(null);
  const frameRef = useRef(null);

  useEffect(() => {
    const startVal = displayValue;
    const targetVal = numValue;

    if (Math.abs(startVal - targetVal) < 0.001) {
      setDisplayValue(targetVal);
      return;
    }

    startValRef.current = startVal;
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = timestamp - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Smooth ease-out cubic curve
      const ease = 1 - Math.pow(1 - progress, 3);
      const current = startValRef.current + (targetVal - startValRef.current) * ease;

      setDisplayValue(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetVal);
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [numValue, duration]);

  // Format rendering
  let formatted = '';
  if (format === 'currency-in') {
    formatted = Math.round(displayValue).toLocaleString('en-IN');
  } else if (format === 'percent') {
    formatted = `${Math.round(displayValue)}%`;
  } else if (decimals > 0) {
    formatted = displayValue.toFixed(decimals);
  } else {
    formatted = Math.round(displayValue).toLocaleString('en-IN');
  }

  return (
    <span
      className={`animated-number ${className}`}
      style={{
        display: 'inline-block',
        fontVariantNumeric: 'tabular-nums',
        transition: 'color 0.2s ease',
        ...style
      }}
    >
      {prefix}{formatted}{suffix}
    </span>
  );
};

export default AnimatedNumber;
