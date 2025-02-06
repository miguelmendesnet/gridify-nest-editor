
import { useState, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import type { Element } from '../types';

export const useElementSync = (
  elements: Element[],
  setElements: (elements: Element[]) => void,
) => {
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
        textSize: el.text_size,
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
        text_size: el.textSize,
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

  return {
    isLoading,
    isSaving,
    unsavedChanges,
    isSavingRef,
    loadElements,
    saveChanges,
    setUnsavedChanges
  };
};
