/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import './Radar.css';
import { useUI } from '@/lib/state';

export default function Radar() {
  const { isRadarActive } = useUI();

  return (
    <div className={`radar-container ${isRadarActive ? 'active' : ''}`}>
      <div className="radar-circle"></div>
      <div className="radar-circle"></div>
      <div className="radar-circle"></div>
      <div className="radar-sweep"></div>
      
      {/* Simulation dots that could appear */}
      <div className={`radar-dot ${isRadarActive ? 'found' : ''}`} style={{top: '30%', left: '70%', animationDelay: '0.2s'}}></div>
      <div className={`radar-dot ${isRadarActive ? 'found' : ''}`} style={{top: '60%', left: '20%', animationDelay: '0.8s'}}></div>
      <div className={`radar-dot ${isRadarActive ? 'found' : ''}`} style={{top: '80%', left: '60%', animationDelay: '1.4s'}}></div>

      <div className="radar-label">Scanning Surroundings...</div>
    </div>
  );
}
