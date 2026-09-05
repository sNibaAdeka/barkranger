'use client';

import { useState } from 'react';
import BarkRangerScene from './model-scene';

export default function Home() {
  const [missionActive, setMissionActive] = useState(true);

  return (
    <main className="demo">
      <BarkRangerScene missionActive={missionActive} />
      <div className="atmosphere atmosphere-one" aria-hidden="true" />
      <div className="atmosphere atmosphere-two" aria-hidden="true" />
      <div className="reticle" aria-hidden="true"><i /><i /><i /><i /></div>
      <div className="corner corner-top-left" aria-hidden="true" />
      <div className="corner corner-top-right" aria-hidden="true" />
      <div className="corner corner-bottom-left" aria-hidden="true" />
      <div className="corner corner-bottom-right" aria-hidden="true" />
      <button
        className={`mission-control ${missionActive ? 'is-active' : ''}`}
        onClick={() => setMissionActive(!missionActive)}
        aria-label={missionActive ? 'Поставить демонстрацию на паузу' : 'Запустить демонстрацию'}
      >
        <span />
      </button>
    </main>
  );
}
