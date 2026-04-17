import { useState, useRef } from 'react';
import axios from 'axios';
import { Upload, FileText, Image as ImageIcon, Music, Loader2 } from 'lucide-react';

export default function UploadPanel({ fetchDocuments, documents, apiBase }) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await axios.post(`${apiBase}/upload`, formData);
      await fetchDocuments();
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    }
    setUploading(false);
    e.target.value = '';
  };

  const getIcon = (type) => {
    if (type === 'pdf') return <FileText size={16} className="text-red-400" />;
    if (type === 'image') return <ImageIcon size={16} className="text-blue-400" />;
    if (type === 'audio') return <Music size={16} className="text-purple-400" />;
    return <FileText size={16} className="text-slate-400" />;
  };

  return (
    <div className="flex-1 overflow-y-auto flex flex-col">
      <div className="p-4 flex flex-col gap-2 border-b border-slate-800">
        <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
        <button 
          onClick={() => fileInputRef.current.click()}
          disabled={uploading}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-dashed border-slate-600 hover:border-slate-400 hover:bg-slate-800/50 transition-all text-sm text-slate-300 font-medium"
        >
          {uploading ? <Loader2 size={16} className="animate-spin text-primary" /> : <Upload size={16} />}
          {uploading ? 'Processing File...' : 'Upload Document'}
        </button>
      </div>
      
      <div className="p-2 flex-1 overflow-y-auto space-y-2">
        {documents.map((doc, i) => (
          <div key={i} className="p-3 bg-slate-800/40 rounded-lg flex items-center gap-3 border border-slate-700/30 hover:bg-slate-700/50 transition-colors">
            {getIcon(doc.type)}
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-slate-200 truncate" title={doc.filename}>{doc.filename}</p>
              <p className="text-xs text-slate-500">{new Date(doc.upload_time).toLocaleString()}</p>
            </div>
          </div>
        ))}
        {documents.length === 0 && !uploading && (
           <p className="text-xs text-center text-slate-500 mt-4">No documents in KB.</p>
        )}
      </div>
    </div>
  );
}
