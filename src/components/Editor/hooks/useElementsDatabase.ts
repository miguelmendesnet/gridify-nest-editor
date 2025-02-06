
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import type { Element } from '../types';

const isValidTextSize = (size: string | null): size is 'S' | 'M' | 'L' | 'XL' => {
  return size === 'S' || size === 'M' || size === 'L' || size === 'XL';
};

export const loadElementsFromDatabase = async (userId: string) => {
  const { data, error } = await supabase
    .from('elements')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;

  return data.map(el => ({
    id: el.id,
    type: el.type as 'text' | 'image',
    content: el.content,
    position: { x: Math.round(el.position_x), y: Math.round(el.position_y) },
    size: { width: Math.round(el.width), height: Math.round(el.height) },
    textAlign: el.text_align as 'left' | 'center' | 'right' | undefined,
    textSize: isValidTextSize(el.text_size) ? el.text_size : 'M',
  }));
};

export const saveElementsToDatabase = async (elements: Element[], userId: string) => {
  const { error: deleteError } = await supabase
    .from('elements')
    .delete()
    .eq('user_id', userId);

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
    user_id: userId
  }));

  const { error: insertError } = await supabase
    .from('elements')
    .insert(elementsToInsert);

  if (insertError) throw insertError;
};

export const deleteImageFromStorage = async (imageUrl: string) => {
  const fileName = imageUrl.split('/').pop();
  if (fileName) {
    const { error } = await supabase.storage
      .from('editor-images')
      .remove([fileName]);
    
    if (error) {
      console.error('Error deleting image from storage:', error);
    }
  }
};
