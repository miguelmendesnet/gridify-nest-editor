import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Type, Image as ImageIcon, Grid, LogOut } from 'lucide-react';
import EditorElement from './EditorElement';
import { toast } from 'sonner';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();

  useEffect(() => {
    loadElements();
    subscribeToChanges();
  }, []);

  const loadElements = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('elements')
        .select('*')
        .eq('user_id', session.session.user.id);

      if (error) throw error;

      const formattedElements: Element[] = data.map(el => ({
        id: el.id,
        type: el.type as 'text' | 'image',
        content: el.content,
        position: { x: el.position_x, y: el.position_y },
        size: { width: el.width, height: el.height },
        textAlign: el.text_align as 'left' | 'center' | 'right' | undefined,
      }));

      setElements(formattedElements);
    } catch (error) {
      toast.error('Error loading elements');
      console.error('Error:', error);
    }
  };

  const subscribeToChanges = () => {
    const channel = supabase
      .channel('elements-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'elements' },
        (payload) => {
          console.log('Change received:', payload);
          loadElements();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const addTextElement = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const newElement = {
        type: 'text' as const,
        content: 'New Text',
        position_x: 0,
        position_y: 0,
        width: 150,
        height: 50,
        text_align: 'left' as const,
        user_id: session.session.user.id
      };

      const { error } = await supabase
        .from('elements')
        .insert(newElement);

      if (error) throw error;
      toast.success('Added new text element');
    } catch (error) {
      toast.error('Error adding text element');
      console.error('Error:', error);
    }
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        const { data: session } = await supabase.auth.getSession();
        if (!session.session) {
          navigate('/auth');
          return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
          const { error } = await supabase
            .from('elements')
            .insert({
              type: 'image',
              content: e.target?.result as string,
              position_x: 0,
              position_y: 0,
              width: 150,
              height: 150,
              user_id: session.session.user.id
            });

          if (error) throw error;
          toast.success('Added new image element');
        };
        reader.readAsDataURL(file);
      } catch (error) {
        toast.error('Error adding image element');
        console.error('Error:', error);
      }
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const updateElement = async (id: string, updates: Partial<Element>) => {
    try {
      const { error } = await supabase
        .from('elements')
        .update({
          content: updates.content,
          position_x: updates.position?.x,
          position_y: updates.position?.y,
          width: updates.size?.width,
          height: updates.size?.height,
          text_align: updates.textAlign,
        })
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      toast.error('Error updating element');
      console.error('Error:', error);
    }
  };

  const deleteElement = async (id: string) => {
    try {
      const { error } = await supabase
        .from('elements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      setSelectedElement(null);
      toast.success('Element deleted');
    } catch (error) {
      toast.error('Error deleting element');
      console.error('Error:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      navigate('/auth');
    } catch (error) {
      toast.error('Error signing out');
      console.error('Error:', error);
    }
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
        <div className="w-px h-8 bg-border mx-1" />
        <Button
          variant="ghost"
          onClick={handleSignOut}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
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