import React from 'react';
import { Trash2, Bold, Italic, Underline } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface ElementToolbarProps {
  type: 'text' | 'image';
  onDelete: () => void;
  onFormat?: (format: 'bold' | 'italic' | 'underline') => void;
}

const ElementToolbar = ({ type, onDelete, onFormat }: ElementToolbarProps) => {
  return (
    <div className="editor-toolbar">
      {type === 'text' && (
        <>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat?.('bold')}
          >
            <Bold className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat?.('italic')}
          >
            <Italic className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onFormat?.('underline')}
          >
            <Underline className="w-4 h-4" />
          </Button>
        </>
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={onDelete}
      >
        <Trash2 className="w-4 h-4 text-destructive" />
      </Button>
    </div>
  );
};

export default ElementToolbar;