/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React from 'react';
import './ImageModal.css';

interface ImageModalProps {
  src: string;
  alt: string;
  onClose: () => void;
}

export default function ImageModal({ src, alt, onClose }: ImageModalProps) {
  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = src;
    link.download = `orbit-generated-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="image-modal-overlay" onClick={onClose}>
      <div className="image-modal-content" onClick={e => e.stopPropagation()}>
        <div className="image-modal-actions">
          <button className="image-action-button" onClick={handleDownload} title="Download Image">
            <span className="material-symbols-outlined">download</span>
          </button>
          <button className="image-action-button" onClick={onClose} title="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <img src={src} alt={alt} className="image-modal-img" />
      </div>
    </div>
  );
}