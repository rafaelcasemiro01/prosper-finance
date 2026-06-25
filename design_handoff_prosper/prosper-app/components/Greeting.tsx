'use client';

import { useEffect, useState } from 'react';

// Saudação dinâmica conforme a hora local do usuário.
export function Greeting({ name }: { name: string }) {
  const [greet, setGreet] = useState('Olá');
  useEffect(() => {
    const h = new Date().getHours();
    setGreet(h < 6 ? 'Boa madrugada' : h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite');
  }, []);
  return (
    <div>
      <div className="eyebrow">{greet}</div>
      <h1 className="h-page" style={{ margin: '6px 0 0' }}>Olá, {name}</h1>
    </div>
  );
}
