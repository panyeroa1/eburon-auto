/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

import React from 'react';
import './PopUp.css';

interface PopUpProps {
  onClose: () => void;
}

const PopUp: React.FC<PopUpProps> = ({ onClose }) => {
  return (
    <div className="popup-overlay">
      <div className="popup-content">
        <h2>Eburon Automation</h2>
        <p>Operational console for autonomous agents.</p>
        <button onClick={onClose}>Initialize System</button>
      </div>
    </div>
  );
};

export default PopUp;