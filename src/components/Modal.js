import React, { useState, useEffect, useMemo, useRef } from "react";

// =========================================================================
// REUSABLE POPUP MODAL ARCHITECTURE (CUBIC-BEZIER SPRING TRANSITIONS)
// =========================================================================
const Modal = ({ isOpen, onClose, title, children, style, maxWidth }) => {
  const [shouldRender, setShouldRender] = useState(isOpen);
  const [isAnimated, setIsAnimated] = useState(false);
  
  // ✨ NEW: We use a ref to remember if the user started their click on the overlay itself
  const isOverlayMouseDown = useRef(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      const timer = setTimeout(() => setIsAnimated(true), 10);
      return () => clearTimeout(timer);
    } else {
      setIsAnimated(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // ✨ NEW: Track where the mouse down happens
  const handleMouseDown = (e) => {
    // e.target is the element that was clicked. 
    // e.currentTarget is the element the listener is attached to (the overlay).
    if (e.target === e.currentTarget) {
      isOverlayMouseDown.current = true;
    } else {
      isOverlayMouseDown.current = false;
    }
  };

  // ✨ NEW: Only close if the mouse down ALSO happened on the overlay
  const handleMouseUp = (e) => {
    if (isOverlayMouseDown.current && e.target === e.currentTarget) {
      onClose();
    }
    // Reset the tracking flag
    isOverlayMouseDown.current = false; 
  };

  if (!shouldRender) return null;

  // =========================================================================
  // HIGH-FIDELITY FLEXIBLE OBJECT RENDERING MATRIX STYLES SHEET
  // =========================================================================
  const modalStyles = {
    overlay: { position: "fixed", inset: 0, backgroundColor: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(4px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 200, transition: "opacity 0.3s ease" },
    card: { backgroundColor: "#ffffff", borderRadius: "12px", boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)", width: "100%", maxWidth: maxWidth ? maxWidth : "540px", paddingTop: "24px", paddingBottom: "24px", boxSizing: "border-box", transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)" },
    headerRow: { display: "flex", justifyContent: "flex-end", alignItems: "center", borderBottom: "1px none #f1f5f9", paddingBottom: "12px", marginBottom: "16px", marginBottom: "0", paddingRight: 24, paddingLeft: 24 },
    headerTitle: { margin: "auto", fontSize: "16px", fontWeight: "700", color: "#1e293b" },
    closeXBtn: { background: "none", border: "none", fontSize: "26px", color: "#94a3b8", cursor: "pointer" },
    bodyContent: { display: "flex", flexDirection: "column", maxHeight: "80vh", overflowY: "scroll" }
  };

  return (
    <div 
      style={{ ...modalStyles.overlay, opacity: isAnimated ? 1 : 0 }} 
      // ✨ NEW: Replaced onClick with onMouseDown and onMouseUp
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div 
        style={{            
          ...modalStyles.card, 
          ...style,
          opacity: isAnimated ? 1 : 0, 
          transform: isAnimated ? "scale(1) translateY(0)" : "scale(0.85) translateY(20px)" 
        }} 
        // Note: stopPropagation is still good to keep here so clicks on the modal 
        // card itself don't trigger the overlay's event handlers at all.
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div style={modalStyles.headerRow}>
          {/* <h3 style={modalStyles.headerTitle}>{title}</h3> */}
          <button onClick={onClose} style={modalStyles.closeXBtn}>✕</button>
        </div>
        <div style={modalStyles.bodyContent}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;