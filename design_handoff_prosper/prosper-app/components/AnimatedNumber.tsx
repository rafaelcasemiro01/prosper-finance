'use client';

import { useEffect, useState } from 'react';
import { animate } from 'framer-motion';
import { brl } from '@/lib/format';

// Número que anima de 0 até o valor (count-up). Usa Framer Motion.
// kind: 'brl' (R$), 'percent' (%) ou 'int'. signed adiciona +/−.
export function AnimatedNumber({
  value,
  kind = 'brl',
  duration = 0.9,
  signed = false,
}: {
  value: number;
  kind?: 'brl' | 'percent' | 'int';
  duration?: number;
  signed?: boolean;
}) {
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setDisplay(v),
    });
    return () => controls.stop();
  }, [value, duration]);

  if (kind === 'percent') return <>{Math.round(display)}%</>;
  if (kind === 'int') return <>{Math.round(display).toLocaleString('pt-BR')}</>;
  return <>{brl(display, { sign: signed })}</>;
}
