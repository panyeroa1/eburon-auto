/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import './Radar.css';
import { useUI } from '@/lib/state';

export default function Radar() {
  const { isRadarActive, radarPoints } = useUI();

  // Helper to position dots based on angle/distance
  // Angle 0 is North (Top), 90 is East (Right)
  // CSS Top: 50% - (distance * cos(angle))
  // CSS Left: 50% + (distance * sin(angle))
  const getPosition = (angle: number, distance: number) => {
    // Convert degrees to radians
    const rad = (angle * Math.PI) / 180;
    // Scale distance (0-1) to radius percentage (e.g., max 45% to keep inside circle)
    const r = distance * 45; 
    
    // Calculate offsets
    // angle 0 -> sin=0, cos=1 -> left=50, top=50-r (Top)
    // angle 90 -> sin=1, cos=0 -> left=50+r, top=50 (Right)
    const left = 50 + r * Math.sin(rad);
    const top = 50 - r * Math.cos(rad);
    
    return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className={`radar-container ${isRadarActive ? 'active' : ''}`}>
      <div className="radar-circle"></div>
      <div className="radar-circle"></div>
      <div className="radar-circle"></div>
      <div className="radar-sweep"></div>
      
      {/* Dynamic Radar Points */}
      {radarPoints.map((point, index) => {
        const style = getPosition(point.angle, point.distance);
        // Stagger animations slightly based on distance for effect
        const animationDelay = `${point.distance}s`;
        
        return (
          <div 
            key={index} 
            className="radar-dot-wrapper"
            style={{ ...style }}
          >
             <div className="radar-dot found" style={{ animationDelay }}></div>
             <div className="radar-dot-label">{point.label}</div>
          </div>
        );
      })}

      <div className="radar-label">
        {radarPoints.length > 0 ? `Detected ${radarPoints.length} Points` : 'Scanning Surroundings...'}
      </div>
    </div>
  );
}
