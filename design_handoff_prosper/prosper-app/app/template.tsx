'use client';

import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

// app/template.tsx — re-renderiza a cada navegação, então é o lugar certo
// para a transição de página. Suave (fade + leve subida) e rápida.
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
