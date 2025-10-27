'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

const Portal: React.FC<PortalProps> = ({ 
  children, 
  containerId = 'modal-root' 
}) => {
  const [mounted, setMounted] = useState(false);
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get the portal container
    let portalContainer = document.getElementById(containerId);
    
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      
      // Force full screen coverage with important styles
      portalContainer.style.cssText = `
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important;
        height: 100vh !important;
        pointer-events: none !important;
        z-index: 9999 !important;
        margin: 0 !important;
        padding: 0 !important;
        border: none !important;
        outline: none !important;
      `;
      
      document.body.appendChild(portalContainer);
    }

    setContainer(portalContainer);
    setMounted(true);

    return () => {
      // Clean up: remove container if it's empty
      if (portalContainer && portalContainer.children.length === 0 && portalContainer.parentNode) {
        portalContainer.parentNode.removeChild(portalContainer);
      }
    };
  }, [containerId]);

  if (!mounted || !container) {
    return null;
  }

  return createPortal(children, container);
};

export default Portal;
