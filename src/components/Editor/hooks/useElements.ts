import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from 'sonner';
import type { Element } from '../types';

export const useElements = () => {
  const [elements, setElements] = useState<Element[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

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
    } catch (error) {
      console.error('Error loading elements:', error);
      toast.error('Error loading elements. Please try refreshing the page.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTextElement = async () => {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate('/auth');
        return;
      }

      const { error } = await supabase
        .from('elements')
        .insert({
          type: 'text',
          content: 'New Text',
          position_x: 0,
          position_y: 0,
          width: 150,
          height: 50,
          text_align: 'left',
          user_id: session.session.user.id
        });

      if (error) throw error;
      toast.success('Added new text element');
    } catch (error) {
      toast.error('Error adding text element');
      console.error('Error:', error);
    }
  };

  const addImageElement = async (file: File) => {
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
  };

  const updateElement = async (id: string, updates: Partial<Element>) => {
    try {
      const updateData: any = {};
      
      if (updates.content !== undefined) {
        updateData.content = updates.content;
      }
      if (updates.position) {
        updateData.position_x = Math.round(updates.position.x);
        updateData.position_y = Math.round(updates.position.y);
      }
      if (updates.size) {
        updateData.width = Math.round(updates.size.width);
        updateData.height = Math.round(updates.size.height);
      }
      if (updates.textAlign !== undefined) {
        updateData.text_align = updates.textAlign;
      }

      const { error } = await supabase
        .from('elements')
        .update(updateData)
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
      toast.success('Element deleted');
    } catch (error) {
      toast.error('Error deleting element');
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    loadElements();
    const subscription = subscribeToChanges();
    return () => {
      subscription();
    };
  }, []);

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

  return {
    elements,
    isLoading,
    addTextElement,
    addImageElement,
    updateElement,
    deleteElement
  };
};