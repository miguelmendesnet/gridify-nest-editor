export type Element = {
  id: string;
  type: 'text' | 'image';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  textAlign?: 'left' | 'center' | 'right';
};