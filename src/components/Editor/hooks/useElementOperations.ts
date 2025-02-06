
import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import type { Element } from '../types';

export const useElementOperations = () => {
  const [elements, setElements] = useState<Element[]>([]);

  const addTextElement = () => {
    const newElement: Element = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'Hello World',
      position: { x: 0, y: 0 },
      size: { width: 150, height: 50 },
      textAlign: 'left',
      textSize: 'xl'
    };
    
    setElements(prev => [...prev, newElement]);
    toast.success('Added new text element');
    return true;
  };

  const addImageElement = async (file: File) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${crypto.randomUUID()}.${fileExt}`;
      
      const { error: uploadError, data } = await supabase.storage
        .from('editor-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('editor-images')
        .getPublicUrl(fileName);

      const newElement: Element = {
        id: crypto.randomUUID(),
        type: 'image',
        content: publicUrl,
        position: { x: 0, y: 0 },
        size: { width: 150, height: 150 },
      };
      
      setElements(prev => [...prev, newElement]);
      toast.success('Added new image element');
      return true;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
      return false;
    }
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    return true;
  };

  const deleteElement = (id: string) => {
    const elementToDelete = elements.find(el => el.id === id);
    
    if (elementToDelete?.type === 'image') {
      const fileName = elementToDelete.content.split('/').pop();
      if (fileName) {
        supabase.storage
          .from('editor-images')
          .remove([fileName])
          .then(({ error }) => {
            if (error) {
              console.error('Error deleting image from storage:', error);
            }
          });
      }
    }

    setElements(prev => prev.filter(el => el.id !== id));
    toast.success('Element deleted');
    return true;
  };

  return {
    elements,
    setElements,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
  };
};
