import React, { useState, useRef, useEffect } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram';
import { Send, Database, Sparkles, User, Box, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

function App() {
  const [messages, setMessages] = useState<any[]>([{ role: "agent", content: "Welcome to the GraphRAG Multi-Agent Hub. Try a query below!", activeNode: null, meta: null }]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  
  const endOfMessagesRef = useRef<any>(null);
  useEffect(() => {
     endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const runQuery = async (query: string) => {
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setInputValue("");
    setIsThinking(true);
    setActiveNode(null);

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      const data = await res.json();
      
      let node: any = null;
      if (data.db_name === "Spanner Graph") node = "spanner";
      else if (data.db_name === "BigQuery") node = "bigquery";
      else if (data.db_name === "Neo4j") node = "neo4j";
      
      setActiveNode(node);
      
      setTimeout(() => {
          setMessages(prev => [...prev, { 
             role: "agent", 
             content: data.synthesis, 
             activeNode: node,
             meta: data 
          }]);
          setIsThinking(false);
      }, 600);
      
    } catch (e) {
      setIsThinking(false);
      setMessages(prev => [...prev, { role: "agent", content: "Error running query. " + String(e), activeNode: null, meta: null }]);
    }
  };

  const handleSend = () => {
    runQuery(inputValue);
  };
  
  const handleKeyDown = (e: any) => {
    if (e.key === 'Enter') handleSend();
  }

  const examples = [
    { text: "Find products like running shoe", icon: <Box className="w-4 h-4 text-blue-400" />, node: "spanner" },
    { text: "Large money transfers for customers", icon: <User className="w-4 h-4 text-green-400" />, node: "bigquery" },
    { text: "Which influencers run tech brand campaigns?", icon: <Sparkles className="w-4 h-4 text-orange-400" />, node: "neo4j" },
  ];

  const getColorClass = (node: any) => {
      if (node === 'spanner') return 'border-blue-500 bg-blue-500/10 text-blue-100';
      if (node === 'bigquery') return 'border-green-500 bg-green-500/10 text-green-100';
      if (node === 'neo4j') return 'border-orange-500 bg-orange-500/10 text-orange-100';
      return 'border-purple-500 bg-purple-500/10 text-purple-100';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex p-6 gap-6 font-sans">
      <div className="w-[45%] flex flex-col gap-4 border border-slate-800 bg-slate-900 rounded-2xl p-6 shadow-2xl">
         <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
             <Database className="text-purple-500 w-8 h-8" />
             <h1 className="text-xl font-bold text-white tracking-wide">GraphRAG Agent Interface</h1>
         </div>
         
         <div className="flex-1 overflow-y-auto flex flex-col gap-4 py-4 pr-2">
            {messages.map((msg, i) => (
                <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`max-w-[85%] p-4 rounded-2xl border ${msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-white rounded-br-none' : (msg.activeNode ? getColorClass(msg.activeNode) + ' rounded-bl-none' : 'bg-slate-800 border-slate-700 text-white rounded-bl-none')}`}>
                      <p className="text-[15px] leading-relaxed">{msg.content}</p>
                      
                      {msg.meta && msg.meta.results && msg.meta.results.length > 0 && (
                          <div className="mt-3 p-3 bg-black/30 rounded-lg text-sm">
                             <strong className="block mb-2 text-white/90 border-b border-white/20 pb-1">Data Returned:</strong>
                             <ul className="space-y-1">
                               {msg.meta.results.map((r: any, idx: number) => (
                                 <li key={idx} className="list-disc ml-4 opacity-90">
                                   {JSON.stringify(r).replace(/"/g, '').replace(/\{|\}/g, '')}
                                 </li>
                               ))}
                             </ul>
                          </div>
                      )}

                      {msg.meta && (
                          <div className="mt-3 pt-3 border-t border-white/20 text-xs font-mono whitespace-pre-wrap opacity-60 break-words">
                             [Query Generated]<br/>
                             {msg.meta.query_generated.trim()}
                          </div>
                      )}
                   </div>
                </div>
            ))}
            {isThinking && (
                 <div className="flex items-start">
                   <div className="bg-slate-800 border-slate-700 text-white p-4 rounded-2xl rounded-bl-none flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                   </div>
                </div>
            )}
            <div ref={endOfMessagesRef} />
         </div>

         <div className="flex flex-col gap-2 border-t border-slate-800 pt-4">
             <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Example Queries</span>
             <div className="flex flex-wrap gap-2">
                {examples.map((ex, i) => (
                   <button key={i} onClick={() => runQuery(ex.text)} className="flex items-center gap-2 px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm hover:bg-slate-800 transition-colors text-left">
                       {ex.icon} <span>{ex.text}</span>
                   </button>
                ))}
             </div>
         </div>

         <div className="flex items-center gap-2 mt-2">
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask the GraphRAG Orchestrator..."
              className="flex-1 bg-slate-950 border border-slate-800 p-4 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-slate-500"
            />
            <button onClick={handleSend} className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/20">
               <Send className="w-5 h-5" />
            </button>
         </div>
      </div>

      <div className="w-[55%] flex flex-col items-center justify-center border border-slate-800 bg-slate-900 rounded-2xl p-8 shadow-2xl relative">
          <div className="absolute top-8 left-8 z-10">
             <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-md">
               <ArrowRight className="text-purple-500" /> System Architecture
             </h2>
             <p className="text-slate-300 mt-2 text-sm max-w-md drop-shadow-md font-medium">
                The Vertex AI Orchestrator receives the natural language intent and dynamically routes execution to the specialized datastore. 
             </p>
          </div>
          
          <div className="mt-16 w-full flex justify-center">
              <ArchitectureDiagram activeNode={activeNode} isThinking={isThinking} />
          </div>
      </div>
    </div>
  );
}

export default App;
