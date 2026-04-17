import { Wrench, ChevronRight, Terminal } from 'lucide-react';

export default function AgentActivity({ tracesData }) {
  if (!tracesData || tracesData.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-slate-600 p-8 text-center space-y-4">
        <Terminal size={48} className="opacity-20" />
        <p className="text-sm font-medium">Trace logs will appear here when the agent uses tools.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-xs">
      {tracesData.map((trace, idx) => {
        if (trace.input) {
          // Tool Call Action
          return (
            <div key={idx} className="p-3 bg-slate-900 rounded-lg border border-slate-700/50 shadow-inner">
               <div className="flex items-center gap-2 text-primary font-bold mb-2">
                 <Wrench size={14} />
                 Action: {trace.tool}
               </div>
               <div className="pl-3 border-l-2 border-slate-700/80 text-yellow-400/90 whitespace-pre-wrap">
                 {JSON.stringify(trace.input, null, 2)}
               </div>
            </div>
          );
        } else {
          // Tool Output
           return (
            <div key={idx} className="p-3 ml-4 bg-slate-800/40 rounded-lg border border-slate-800 relative">
               <div className="absolute -left-5 top-3text-slate-700">
                  <ChevronRight size={16} />
               </div>
               <div className="flex items-center gap-2 text-emerald-500/80 font-bold mb-2">
                 Observation
               </div>
               <div className="line-clamp-6 hover:line-clamp-none transition-all whitespace-pre-wrap text-slate-400 overflow-hidden break-words">
                 {trace.output}
               </div>
            </div>
          );
        }
      })}
    </div>
  );
}
