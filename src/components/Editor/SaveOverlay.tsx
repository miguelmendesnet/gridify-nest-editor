
import { LoaderCircle } from 'lucide-react';

const SaveOverlay = () => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center animate-fade-in">
      <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3 animate-scale-in">
        <LoaderCircle className="w-6 h-6 animate-spin text-primary" />
        <span className="text-lg font-medium">Saving changes...</span>
      </div>
    </div>
  );
};

export default SaveOverlay;
