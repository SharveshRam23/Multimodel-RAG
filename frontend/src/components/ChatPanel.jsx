import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Send, User, Bot, Loader } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function ChatPanel({ apiBase, updateTraces }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your NeuralRAG Agent. I have access to your uploaded knowledge base. Ask me anything about your documents, and I will search through them to find the answer.'}
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  const scrollToBottom = () => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setLoading(true);
    updateTraces(null);

    try {
      const res = await axios.post(`${apiBase}/chat`, { message: userMsg });
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
      updateTraces({ traces: res.data.traces, iterations: res.data.iterations });
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Error connecting to Agent." }]);
    }
    setLoading(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-primary text-white shadow-lg shadow-blue-500/20' : 'bg-slate-800 text-emerald-400 shadow-lg shadow-emerald-500/20 border border-slate-600'}`}>
              {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
            </div>
            <div className={`px-5 py-4 min-w-[50px] shadow-sm rounded-2xl max-w-[85%] ${msg.role === 'user' ? 'bg-primary text-white rounded-tr-none shadow-blue-500/10' : 'bg-slate-800/80 text-slate-200 rounded-tl-none border border-slate-700/60 shadow-black/20'}`}>
               <div className="prose prose-invert prose-sm max-w-none text-sm break-words">
                 <ReactMarkdown>{msg.content}</ReactMarkdown>
               </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-600 text-emerald-400 flex items-center justify-center shrink-0 animate-pulse">
               <Bot size={18} />
             </div>
             <div className="px-5 py-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 rounded-tl-none flex items-center gap-3">
               <Loader size={16} className="animate-spin text-primary" />
               <span className="text-sm text-slate-400 font-medium">Agent is thinking and executing tools...</span>
             </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="p-4 border-t border-slate-800/50 bg-slate-900/60 backdrop-blur-sm z-10">
        <div className="relative flex items-center">
          <input 
            type="text" 
            className="w-full bg-slate-800/80 border border-slate-700 rounded-full px-5 py-3 pr-12 text-sm text-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-inner transition-all placeholder:text-slate-500"
            placeholder="Ask the Agent a question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className="absolute right-2 p-2 rounded-full bg-primary hover:bg-blue-600 disabled:opacity-50 text-white transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}
