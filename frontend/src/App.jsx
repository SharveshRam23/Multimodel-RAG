import { useState, useEffect } from 'react';
import axios from 'axios';
import { UploadCloud, MessageSquare, Activity, Cpu } from 'lucide-react';
import UploadPanel from './components/UploadPanel';
import ChatPanel from './components/ChatPanel';
import AgentActivity from './components/AgentActivity';

const API_BASE = 'http://localhost:8000';

function App() {
  const [documents, setDocuments] = useState([]);
  const [agentTraces, setAgentTraces] = useState(null); // passing as object {iterations, traces}

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_BASE}/documents`);
      setDocuments(res.data.documents);
    } catch (e) {
      console.error("Failed to fetch documents", e);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col p-4 gap-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      
      {/* Header */}
      <header className="glass-panel p-4 rounded-2xl flex items-center gap-3 shrink-0">
        <div className="bg-primary/20 p-2 rounded-lg relative">
          <Cpu className="text-primary w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">NeuralRAG System</h1>
          <p className="text-xs text-slate-400 font-medium">Local GPU-Accelerated Multimodal Agent</p>
        </div>
      </header>

      {/* Main Grid */}
      <div className="flex-1 grid grid-cols-12 gap-4 min-h-0">
        
        {/* Left Column - Upload and Docs */}
        <div className="col-span-3 flex flex-col gap-4 min-h-0">
          <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700/50 flex gap-2 items-center">
              <UploadCloud size={18} className="text-slate-400" />
              <h2 className="font-semibold text-slate-200">Knowledge Base</h2>
            </div>
            <UploadPanel fetchDocuments={fetchDocuments} documents={documents} apiBase={API_BASE} />
          </div>
        </div>

        {/* Center Column - Chat */}
        <div className="col-span-5 flex flex-col min-h-0">
          <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden shadow-[0_0_40px_-15px_rgba(59,130,246,0.3)]">
            <div className="p-4 border-b border-slate-700/50 flex gap-2 items-center">
              <MessageSquare size={18} className="text-slate-400" />
              <h2 className="font-semibold text-slate-200">Agent Interface</h2>
            </div>
            <ChatPanel apiBase={API_BASE} updateTraces={(t) => setAgentTraces(t)} />
          </div>
        </div>

        {/* Right Column - Activity */}
        <div className="col-span-4 flex flex-col min-h-0">
          <div className="glass-panel rounded-2xl flex-1 flex flex-col overflow-hidden bg-slate-950/50 border-slate-800/80 shadow-[inset_0_4px_30px_rgba(0,0,0,0.5)]">
            <div className="p-4 border-b border-slate-800 flex gap-2 items-center justify-between">
              <div className="flex items-center gap-2">
                <Activity size={18} className="text-accent" />
                <h2 className="font-semibold text-accent uppercase tracking-wider text-sm">Real-time Trace</h2>
              </div>
              {agentTraces && (
                 <span className="text-xs bg-slate-800 text-slate-300 px-2 py-1 rounded-md">
                   {agentTraces.iterations}/7 Iterations
                 </span>
              )}
            </div>
            <AgentActivity tracesData={agentTraces?.traces || []} />
          </div>
        </div>
      </div>

    </div>
  );
}

export default App;
