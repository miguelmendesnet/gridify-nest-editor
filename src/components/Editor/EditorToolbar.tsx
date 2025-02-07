
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Type, Image as ImageIcon, LogOut, Save, icons } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface EditorToolbarProps {
  isPreview: boolean;
  hasUnsavedChanges: boolean;
  onTogglePreview: () => void;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onAddIcon: () => void;
  onSaveChanges: () => void;
}

const EditorToolbar = ({
  isPreview,
  hasUnsavedChanges,
  onTogglePreview,
  onAddText,
  onAddImage,
  onAddIcon,
  onSaveChanges
}: EditorToolbarProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/auth');
        return;
      }
      
      await supabase.auth.signOut();
      navigate('/auth');
    } catch (error: any) {
      console.error('Sign out error:', error);
      if (error.message?.includes('session_not_found')) {
        navigate('/auth');
        return;
      }
      toast.error('Error signing out. Please try again.');
    }
  };

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onAddImage(file);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-background rounded-lg shadow-lg border p-2 flex gap-2">
      {!isPreview && (
        <>
          <Button
            variant="outline"
            onClick={onAddText}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <Type className="w-4 h-4 mr-2" />
            Add Text
          </Button>
          <Button
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Add Image
          </Button>
          <Button
            variant="outline"
            onClick={onAddIcon}
            className="hover:bg-primary/10 hover:text-primary"
          >
            <icons.User className="w-4 h-4 mr-2" />
            Add Icon
          </Button>
          <Button
            variant={hasUnsavedChanges ? "default" : "ghost"}
            onClick={onSaveChanges}
            disabled={!hasUnsavedChanges}
            className={hasUnsavedChanges ? "hover:bg-primary/90" : "hover:bg-primary/10 hover:text-primary"}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
          <div className="w-px h-8 bg-border mx-1" />
        </>
      )}
      <Button
        variant="ghost"
        onClick={onTogglePreview}
        className="hover:bg-primary/10 hover:text-primary"
      >
        {isPreview ? (
          <><EyeOff className="w-4 h-4 mr-2" /> Exit Preview</>
        ) : (
          <><Eye className="w-4 h-4 mr-2" /> Preview</>
        )}
      </Button>
      <Button
        variant="ghost"
        onClick={handleSignOut}
        className="hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleImageSelect}
      />
    </div>
  );
};

export default EditorToolbar;
