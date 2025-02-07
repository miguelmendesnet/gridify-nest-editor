
export type Element = {
  id: string;
  type: 'text' | 'image' | 'icon';
  content: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  textAlign?: 'left' | 'center' | 'right';
  textSize?: 'S' | 'M' | 'L' | 'XL';
  iconType?: 'arrow-down' | 'arrow-left' | 'arrow-right' | 'arrow-up' | 'check' | 'x' | 'plus' | 'minus' | 'search' | 'user';
};

