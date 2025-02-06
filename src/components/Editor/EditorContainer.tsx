
import React, { useState, useRef } from 'react';
import EditorElement from './EditorElement';
import EditorToolbar from './EditorToolbar';
import { useElements } from './hooks/useElements';

const EditorContainer = () => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const {
    elements,
    isLoading,
    unsavedChanges,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
    saveChanges
  } = useElements();

  const handleContainerClick = (e: React.MouseEvent) => {
    // Don't deselect if in preview mode
    if (isPreview) return;

    // Check if the click target is the container or another non-editor element
    const target = e.target as HTMLElement;
    const isClickOnContainer = target === containerRef.current;
    const isClickOnEditorElement = target.closest('.editor-element');

    // Deselect if clicked outside any editor element
    if (isClickOnContainer || !isClickOnEditorElement) {
      setSelectedElement(null);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary/50 flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary/50 py-8">
      <div className="max-w-[1200px] mx-auto px-8">
        <div 
          ref={containerRef}
          className={`editor-grid relative ${isPreview ? 'preview-mode' : ''} ${!showGrid ? 'hide-grid' : ''}`}
          onClick={handleContainerClick}
        >
          {elements.map((element) => (
            <EditorElement
              key={element.id}
              element={element}
              isSelected={selectedElement === element.id}
              onSelect={() => setSelectedElement(element.id)}
              onUpdate={(updates) => updateElement(element.id, updates)}
              onDelete={() => {
                deleteElement(element.id);
                setSelectedElement(null);
              }}
              isPreview={isPreview}
            />
          ))}
        </div>
      </div>
      
      <EditorToolbar
        isPreview={isPreview}
        showGrid={showGrid}
        hasUnsavedChanges={unsavedChanges}
        onTogglePreview={() => setIsPreview(!isPreview)}
        onToggleGrid={() => setShowGrid(!showGrid)}
        onAddText={addTextElement}
        onAddImage={addImageElement}
        onSaveChanges={saveChanges}
      />
    </div>
  );
};

export default EditorContainer;
