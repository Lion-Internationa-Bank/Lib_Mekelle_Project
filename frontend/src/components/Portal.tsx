// src/components/Portal.tsx
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

interface PortalProps {
  children: React.ReactNode;
  containerId?: string;
}

const Portal: React.FC<PortalProps> = ({ children, containerId = 'portal-root' }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create portal container if it doesn't exist
    let portalContainer = document.getElementById(containerId);
    if (!portalContainer) {
      portalContainer = document.createElement('div');
      portalContainer.id = containerId;
      portalContainer.style.position = 'fixed';
      portalContainer.style.top = '0';
      portalContainer.style.left = '0';
      portalContainer.style.width = '100%';
      portalContainer.style.height = '0';
      portalContainer.style.pointerEvents = 'none';
      portalContainer.style.zIndex = '9999';
      document.body.appendChild(portalContainer);
    }
    setContainer(portalContainer);

    return () => {
      // Clean up if this is the last component using the portal
      // In production, you might want to keep it for performance
      if (portalContainer && portalContainer.children.length === 0) {
        document.body.removeChild(portalContainer);
      }
    };
  }, [containerId]);

  if (!container) return null;

  return ReactDOM.createPortal(
    <div style={{ pointerEvents: 'auto' }}>
      {children}
    </div>,
    container
  );
};

export default Portal;