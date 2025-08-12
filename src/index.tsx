import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';

import { timelineItems } from './timelineItems';


import Timeline from './components/Timeline';
import type { RawItem } from './types';

function App() {
  const [items] = useState<RawItem[]>(timelineItems as unknown as RawItem[]);
  return (
    <div className="tl-app">
      <header className="tl-header">
        <h1>Airtable Timeline</h1>
        <p className="tl-sub">Itens carregados: {items.length}</p>
      </header>
      <main className="tl-stage">
        <Timeline items={items} />
      </main>
    </div>
  );
}

const rootEl = document.getElementById('app') || document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');
createRoot(rootEl).render(<App />);
