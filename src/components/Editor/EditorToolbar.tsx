
import React, { useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Eye, EyeOff, Type, Image as ImageIcon, Grid, LogOut, Save, Timer } from 'lucide-react';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

interface EditorToolbarProps {
  isPreview: boolean;
  showGrid: boolean;
  hasUnsavedChanges: boolean;
  isAutoSaveEnabled: boolean;
  onTogglePreview: () => void;
  onToggleGrid: () => void;
  onAddText: () => void;
  onAddImage: (file: File) => void;
  onSaveChanges: () => void;
  onToggleAutoSave: () => void;
}

const EditorToolbar = ({
  isPreview,
  showGrid,
  hasUnsavedChanges,
  isAutoSaveEnabled,
  onTogglePreview,
  onToggleGrid,
  onAddText,
  onAddImage,
  onSaveChanges,
  onToggleAutoSave
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
      <Button
        variant="outline"
        onClick={onAddText}
        disabled={isPreview}
      >
        <Type className="w-4 h-4 mr-2" />
        Add Text
      </Button>
      <Button
        variant="outline"
        onClick={() => fileInputRef.current?.click()}
        disabled={isPreview}
      >
        <ImageIcon className="w-4 h-4 mr-2" />
        Add Image
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        variant="ghost"
        onClick={onTogglePreview}
      >
        {isPreview ? (
          <><EyeOff className="w-4 h-4 mr-2" /> Exit Preview</>
        ) : (
          <><Eye className="w-4 h-4 mr-2" /> Preview</>
        )}
      </Button>
      <Button
        variant="ghost"
        onClick={onToggleGrid}
      >
        <Grid className="w-4 h-4 mr-2" />
        {showGrid ? 'Hide Grid' : 'Show Grid'}
      </Button>
      <Button
        variant={hasUnsavedChanges ? "default" : "ghost"}
        onClick={onSaveChanges}
        disabled={!hasUnsavedChanges || isPreview}
      >
        <Save className="w-4 h-4 mr-2" />
        Save Changes
      </Button>
      <Button
        variant={isAutoSaveEnabled ? "default" : "ghost"}
        onClick={onToggleAutoSave}
        disabled={isPreview}
      >
        <Timer className="w-4 h-4 mr-2" />
        {isAutoSaveEnabled ? 'Disable Auto-save' : 'Enable Auto-save'}
      </Button>
      <div className="w-px h-8 bg-border mx-1" />
      <Button
        variant="ghost"
        onClick={handleSignOut}
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
