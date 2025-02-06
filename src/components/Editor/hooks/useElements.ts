import { useState, useEffect, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import type { Element } from '../types';
import { createTextElement, createImageElement } from './useElementCreation';
import { 
  loadElementsFromDatabase, 
  saveElementsToDatabase, 
  deleteImageFromStorage 
} from './useElementsDatabase';

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

      const formattedElements = await loadElementsFromDatabase(session.user.id);
      setElements(formattedElements);
      setUnsavedChanges(false);
    } catch (error: any) {
      console.error('Error loading elements:', error);
      if (error.message?.includes('JWT expired')) {
        navigate('/auth');
        return;
      }
      toast.error('Error loading elements. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTextElement = () => {
    const newElement = createTextElement();
    setElements(prev => [...prev, newElement]);
    setUnsavedChanges(true);
    toast.success('Added new text element');
  };

  const addImageElement = async (file: File) => {
    const newElement = await createImageElement(file);
    if (newElement) {
      setElements(prev => [...prev, newElement]);
      setUnsavedChanges(true);
      toast.success('Added new image element');
    }
  };

  const duplicateElement = (element: Element): Element => {
    const duplicatedElement: Element = {
      ...element,
      id: crypto.randomUUID(),
      position: {
        x: element.position.x + 20,
        y: element.position.y + 20
      }
    };
    
    setElements(prev => [...prev, duplicatedElement]);
    setUnsavedChanges(true);
    toast.success('Element duplicated');
    return duplicatedElement;
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
      deleteImageFromStorage(elementToDelete.content);
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

      await saveElementsToDatabase(elements, session.session.user.id);
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
    duplicateElement,
    saveChanges
  };
};
