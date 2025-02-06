import React from 'react';

interface ResizeHandleProps {
  onResizeStart: (e: React.MouseEvent) => void;
}

const ResizeHandle = ({ onResizeStart }: ResizeHandleProps) => {
  return (
    <div 
      className="resize-handle resize-handle-se" 
      onMouseDown={onResizeStart}
    />
  );
};

export default ResizeHandle;