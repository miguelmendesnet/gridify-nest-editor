
import { useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useElementOperations } from './useElementOperations';
import { useElementSync } from './useElementSync';

export const useElements = () => {
  const {
    elements,
    setElements,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement,
  } = useElementOperations();

  const {
    isLoading,
    isSaving,
    unsavedChanges,
    isSavingRef,
    loadElements,
    saveChanges,
    setUnsavedChanges
  } = useElementSync(elements, setElements);

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
