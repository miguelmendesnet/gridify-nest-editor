
import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import type { Element } from '../types';

export const useElements = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [unsavedChanges, setUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();
  const isSavingRef = useRef(false);

  const loadElements = async () => {
    try {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }

      const { data, error } = await supabase
        .from('elements')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        if (error.message.includes('JWT expired')) {
          navigate('/auth');
          return;
        }
        throw error;
      }

      const formattedElements: Element[] = data.map(el => ({
        id: el.id,
        type: el.type as 'text' | 'image',
        content: el.content,
        position: { x: Math.round(el.position_x), y: Math.round(el.position_y) },
        size: { width: Math.round(el.width), height: Math.round(el.height) },
        textAlign: el.text_align as 'left' | 'center' | 'right' | undefined,
      }));

      setElements(formattedElements);
      setUnsavedChanges(false);
    } catch (error) {
      console.error('Error loading elements:', error);
      toast.error('Error loading elements. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTextElement = () => {
    const newElement: Element = {
      id: crypto.randomUUID(),
      type: 'text',
      content: 'New Text',
      position: { x: 0, y: 0 },
      size: { width: 150, height: 50 },
      textAlign: 'left',
    };
    
    setElements(prev => [...prev, newElement]);
    setUnsavedChanges(true);
    toast.success('Added new text element');
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
      setUnsavedChanges(true);
      toast.success('Added new image element');
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image. Please try again.');
    }
  };

  const updateElement = (id: string, updates: Partial<Element>) => {
    setElements(prev => prev.map(el => 
      el.id === id ? { ...el, ...updates } : el
    ));
    setUnsavedChanges(true);
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
    setUnsavedChanges(true);
    toast.success('Element deleted');
  };

  const saveChanges = async () => {
    try {
      setIsSaving(true);
      isSavingRef.current = true;
      
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const { error: deleteError } = await supabase
        .from('elements')
        .delete()
        .eq('user_id', session.session.user.id);

      if (deleteError) throw deleteError;

      const elementsToInsert = elements.map(el => ({
        type: el.type,
        content: el.content,
        position_x: Math.round(el.position.x),
        position_y: Math.round(el.position.y),
        width: Math.round(el.size.width),
        height: Math.round(el.size.height),
        text_align: el.textAlign,
        user_id: session.session.user.id
      }));

      const { error: insertError } = await supabase
        .from('elements')
        .insert(elementsToInsert);

      if (insertError) throw insertError;

      setUnsavedChanges(false);
      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Error saving changes:', error);
      toast.error('Error saving changes. Please try again.');
    } finally {
      setIsSaving(false);
      isSavingRef.current = false;
    }
  };

  useEffect(() => {
    loadElements();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel('elements-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'elements' },
        (payload) => {
          if (!isSavingRef.current) {
            console.log('Change received:', payload);
            loadElements();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    elements,
    isLoading,
    unsavedChanges,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
    saveChanges
  };
};
