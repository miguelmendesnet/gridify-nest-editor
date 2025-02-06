import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Type, Image as ImageIcon, Grid } from 'lucide-react';
import EditorElement from './EditorElement';
import { toast } from 'sonner';

export type Element = {
  id: string;
  type: 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  textAlign?: 'left' | 'center' | 'right';
};

const EditorContainer = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [isPreview, setIsPreview] = useState(false);
  const [showGrid, setShowGrid] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addTextElement = () => {
    const newElement: Element = {
      id: `element-${Date.now()}`,
      type: 'text',
      content: 'New Text',
      position: { x: 0, y: 0 },
      size: { width: 150, height: 50 },
      textAlign: 'left',
    };
    setElements([...elements, newElement]);
    toast.success('Added new text element');
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newElement: Element = {
          id: `element-${Date.now()}`,
          type: 'image',
          content: e.target?.result as string,
          position: { x: 0, y: 0 },
          size: { width: 150, height: 150 },
        };
        setElements([...elements, newElement]);
        toast.success('Added new image element');
      };
      reader.readAsDataURL(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(elements.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
  };

  const deleteElement = (id: string) => {
    setElements(elements.filter(el => el.id !== id));
    setSelectedElement(null);
    toast.success('Element deleted');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isPreview) return;
      
      const target = event.target as HTMLElement;
      const isEditorElement = target.closest('.editor-element');
      const isToolbar = target.closest('.editor-toolbar');
      const isButton = target.closest('button');

      if (!isEditorElement && !isToolbar && !isButton) {
        setSelectedElement(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPreview]);

  return (
    <div className="min-h-screen bg-secondary/50 py-8">
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
              onDelete={() => deleteElement(element.id)}
              isPreview={isPreview}
            />
          ))}
        </div>
      </div>
      
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-background rounded-lg shadow-lg border p-2 flex gap-2">
        <Button
          variant="outline"
          onClick={addTextElement}
          disabled={isPreview}
        >
          <Type className="w-4 h-4 mr-2" />
          Add Text
        </Button>
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isPreview}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Add Image
        </Button>
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          variant="ghost"
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? (
            <><EyeOff className="w-4 h-4 mr-2" /> Exit Preview</>
          ) : (
            <><Eye className="w-4 h-4 mr-2" /> Preview</>
          )}
        </Button>
        <Button
          variant="ghost"
          onClick={() => setShowGrid(!showGrid)}
        >
          <Grid className="w-4 h-4 mr-2" />
          {showGrid ? 'Hide Grid' : 'Show Grid'}
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          onChange={handleImageSelect}
        />
      </div>
    </div>
  );
};

export default EditorContainer;