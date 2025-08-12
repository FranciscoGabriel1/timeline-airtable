import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import './app.css';

import timelineItems from './timelineItems';
import Timeline from './components/Timeline';
import type { RawItem } from './types';

function App() {
  const [items] = useState<RawItem[]>(timelineItems as unknown as RawItem[]);

  return (
    <div className="app">
      <header className="appHeader">
        <h1 className="appHeaderTitle">Airtable Timeline</h1>
        <p className="appHeaderHint">Itens carregados: {items.length}</p>
      </header>

      <main className="appStage">
        <Timeline items={items} controlsAlign='center'/>
      </main>
    </div>
  );
}

const rootEl = document.getElementById('app') || document.getElementById('root');
if (!rootEl) throw new Error('Root element not found');
createRoot(rootEl).render(<App />);
