
import React, { useState, useRef } from 'react';
import EditorElement from './EditorElement';
import EditorToolbar from './EditorToolbar';
import SaveOverlay from './SaveOverlay';
import { useElements } from './hooks/useElements';

const EditorContainer = () => {
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleSaveChanges = async () => {
    setIsSaving(true);
    await saveChanges();
    // Show overlay for at least 2 seconds
    setTimeout(() => {
      setIsSaving(false);
    }, 2000);
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
      {isSaving && <SaveOverlay />}
      <div className="max-w-[1200px] mx-auto px-8">
        <div 
          ref={containerRef}
          className={`editor-grid relative ${isPreview ? 'preview-mode' : ''} ${!showGrid ? 'hide-grid' : ''}`}
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
        onSaveChanges={handleSaveChanges}
      />
    </div>
  );
};

export default EditorContainer;
