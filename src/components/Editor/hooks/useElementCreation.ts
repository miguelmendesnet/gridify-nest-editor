
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';
import type { Element } from '../types';

export const createTextElement = (): Element => ({
  id: crypto.randomUUID(),
  type: 'text',
  content: 'Hello World',
  position: { x: 0, y: 0 },
  size: { width: 150, height: 50 },
  textAlign: 'left',
  textSize: 'XL',
});

export const createImageElement = async (file: File): Promise<Element | null> => {
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

    return {
      id: crypto.randomUUID(),
      type: 'image',
      content: publicUrl,
      position: { x: 0, y: 0 },
      size: { width: 150, height: 150 },
    };
  } catch (error) {
    console.error('Error uploading image:', error);
    toast.error('Failed to upload image. Please try again.');
    return null;
  }
};

export const createIconElement = (iconType: Element['iconType']): Element => ({
  id: crypto.randomUUID(),
  type: 'icon',
  content: iconType || 'user',
  position: { x: 0, y: 0 },
  size: { width: 50, height: 50 },
  iconType: iconType || 'user'
});

