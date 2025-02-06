import React, { useRef } from 'react';
import ElementToolbar from './ElementToolbar';
import ResizeHandle from './ResizeHandle';
import { useElementInteraction } from './useElementInteraction';
import type { Element } from './EditorContainer';

interface EditorElementProps {
  element: Element;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<Element>) => void;
  onDelete: () => void;
  isPreview: boolean;
}

const EditorElement: React.FC<EditorElementProps> = ({
  element,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  isPreview
}) => {
  const elementRef = useRef<HTMLDivElement>(null);
  
  const { handleDragStart, handleResizeStart } = useElementInteraction({
    element,
    onUpdate,
    isPreview
  });

  const handleTextFormat = (format: 'bold' | 'italic' | 'underline') => {
    const style = window.getSelection()?.toString()
      ? `<span class="${format}">${window.getSelection()?.toString()}</span>`
      : '';
    document.execCommand(format, false, style);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (isPreview) return;
    
    const target = e.target as HTMLElement;
    if (!target.classList.contains('resize-handle')) {
      handleDragStart(e);
    }
    onSelect();
  };

  return (
    <div
      ref={elementRef}
      className={`editor-element ${isSelected ? 'selected' : ''}`}
      style={{
        transform: `translate(${element.position.x}px, ${element.position.y}px)`,
        width: element.size.width,
        height: element.size.height,
      }}
      onMouseDown={handleMouseDown}
    >
      {isSelected && !isPreview && (
        <>
          <ElementToolbar
            type={element.type}
            onDelete={onDelete}
            onFormat={handleTextFormat}
          />
          <ResizeHandle onResizeStart={handleResizeStart} />
        </>
      )}
      
      {element.type === 'text' ? (
        <div
          contentEditable={!isPreview}
          suppressContentEditableWarning
          className="w-full h-full p-2"
          onBlur={(e) => onUpdate({ content: e.currentTarget.innerHTML })}
        >
          {element.content}
        </div>
      ) : (
        <img
          src={element.content}
          alt="Editor element"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
};

export default EditorElement;