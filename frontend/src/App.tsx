import React, { useState, useRef, useEffect } from 'react';
import ArchitectureDiagram from './ArchitectureDiagram';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Database, 
  Sparkles, 
  User, 
  Box, 
  ArrowRight, 
  MessageSquare, 
  Layout, 
  FileText, 
  Info,
  ExternalLink
} from 'lucide-react';

// Helper to truncate long numeric arrays (embeddings) in strings
const truncateEmbeddings = (str: string) => {
  return str.replace(/\[([\d\.-]+,\s*){5,}([\d\.-]+)\]/g, (match) => {
    const parts = match.slice(1, -1).split(',');
    if (parts.length <= 10) return match;
    const first4 = parts.slice(0, 4).map(p => p.trim()).join(', ');
    const last3 = parts.slice(-3).map(p => p.trim()).join(', ');
    return `[${first4}, ..., ${last3}]`;
  });
};

function App() {
  const [activeTab, setActiveTab] = useState("chat");
  const [messages, setMessages] = useState<any[]>([{ role: "agent", content: "Welcome to the GraphRAG Multi-Agent Hub. Try a query below!", activeNode: null, meta: null }]);
  const [inputValue, setInputValue] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [activeNode, setActiveNode] = useState(null);
  const [lastQuery, setLastQuery] = useState("");
  const [readme, setReadme] = useState("Loading README...");
  
  const endOfMessagesRef = useRef<any>(null);

  useEffect(() => {
     if (activeTab === 'chat') {
       endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
     }
  }, [messages, isThinking, activeTab]);

  useEffect(() => {
    fetch("/api/readme")
      .then(res => res.json())
      .then(data => setReadme(data.content))
      .catch(err => setReadme("Failed to load README.md: " + err));
  }, []);

  const runQuery = async (query: string) => {
    if (!query.trim()) return;
    setMessages(prev => [...prev, { role: "user", content: query }]);
    setLastQuery(query);
    setInputValue("");
    setIsThinking(true);
    setActiveNode(null);
    
    setActiveTab("chat");

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query })
      });
      
      if (!res.ok) throw new Error(`Server returned ${res.status}: ${await res.text()}`);
      
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

  const TabButton = ({ id, label, icon: Icon }: { id: string, label: string, icon: any }) => (
    <button 
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-6 py-3 font-bold transition-all border-b-2 whitespace-nowrap ${
        activeTab === id 
          ? 'border-purple-500 text-white bg-purple-500/10' 
          : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-slate-800'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 flex flex-col font-sans">
      <nav className="border-b border-slate-800 bg-slate-900 px-6 pt-4 flex flex-col gap-4 sticky top-0 z-50 shadow-lg">
        <div className="flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
              <Database className="text-purple-500 w-8 h-8" />
              <h1 className="text-xl font-black text-white tracking-wide uppercase">GraphRAG Agent Hub</h1>
          </motion.div>
          <div className="hidden md:flex items-center gap-4 text-xs font-mono text-slate-500">
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Vertex AI Active</span>
             <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> Multi-Modal Route</span>
          </div>
        </div>
        
        <div className="flex gap-1 overflow-x-auto no-scrollbar">
          <TabButton id="chat" label="Chat Interface" icon={MessageSquare} />
          <TabButton id="arch" label="System Architecture" icon={Layout} />
          <TabButton id="readme" label="Documentation" icon={FileText} />
        </div>
      </nav>

      <main className="flex-1 flex flex-col p-4 md:p-6 max-w-7xl mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'chat' && (
            <motion.div 
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col gap-6 min-h-0"
            >
              <div className="flex-1 overflow-y-auto flex flex-col gap-4 pr-2 bg-slate-900/50 rounded-2xl border border-slate-800 p-6 shadow-inner">
                  {messages.map((msg, i) => (
                      <motion.div 
                        key={i} 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] p-4 rounded-2xl border ${msg.role === 'user' ? 'bg-slate-800 border-slate-700 text-white rounded-br-none' : (msg.activeNode ? getColorClass(msg.activeNode) + ' rounded-bl-none' : 'bg-slate-800 border-slate-700 text-white rounded-bl-none')}`}>
                            <p className="text-[15px] leading-relaxed">{msg.content}</p>
                            
                            {msg.meta && msg.meta.results && msg.meta.results.length > 0 && (
                                <div className="mt-3 p-3 bg-black/30 rounded-lg text-sm">
                                  <strong className="block mb-2 text-white/90 border-b border-white/20 pb-1">Data Returned:</strong>
                                  <ul className="space-y-1">
                                    {msg.meta.results.map((r: any, idx: number) => (
                                      <li key={idx} className="list-disc ml-4 opacity-90 font-mono text-[11px]">
                                        {truncateEmbeddings(JSON.stringify(r).replace(/"/g, '').replace(/\{|\}/g, ''))}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                            )}

                            {msg.meta && (
                                <div className="mt-3 pt-3 border-t border-white/20 text-xs font-mono whitespace-pre-wrap opacity-60 break-words">
                                  [Query Generated]<br/>
                                  {truncateEmbeddings(msg.meta.query_generated.trim())}
                                </div>
                            )}
                        </div>
                      </motion.div>
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

              <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Example Queries</span>
                      <div className="flex flex-wrap gap-2">
                          {examples.map((ex, i) => (
                            <button key={i} onClick={() => runQuery(ex.text)} className="flex items-center gap-2 px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-sm hover:bg-slate-800 transition-colors text-left text-slate-300">
                                {ex.icon} <span>{ex.text}</span>
                            </button>
                          ))}
                      </div>
                  </div>

                  <div className="flex items-center gap-2">
                      <input 
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask the GraphRAG Orchestrator..."
                        className="flex-1 bg-slate-900 border border-slate-800 p-4 rounded-xl focus:outline-none focus:border-purple-500 transition-colors text-white placeholder-slate-500 shadow-xl"
                      />
                      <button onClick={handleSend} className="bg-purple-600 hover:bg-purple-500 text-white p-4 rounded-xl transition-all hover:scale-105 shadow-lg shadow-purple-500/20">
                        <Send className="w-5 h-5" />
                      </button>
                  </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'arch' && (
            <motion.div 
              key="arch"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex-1 flex flex-col gap-8 overflow-y-auto pr-2"
            >
              <div className="w-full flex flex-col lg:flex-row gap-8 items-start">
                <div className="flex-1 border border-slate-800 bg-slate-900 rounded-2xl p-8 shadow-2xl overflow-hidden min-h-[500px] flex flex-col items-center w-full">
                  <div className="w-full mb-8">
                    <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3 drop-shadow-md">
                      <ArrowRight className="text-purple-500" /> Architecture Blueprint
                    </h2>
                    <p className="text-slate-400 mt-2 text-sm max-w-2xl drop-shadow-md font-medium leading-relaxed">
                        A containerized FastAPI orchestrator deployed on <span className="text-blue-400 font-bold underline decoration-blue-500/30">Cloud Run</span>. It leverages Vertex AI to process natural language intent and dynamically route execution to specialized datastores.
                    </p>
                  </div>
                  
                  <div className="flex-1 w-full flex justify-center overflow-x-auto no-scrollbar">
                      <ArchitectureDiagram activeNode={activeNode} isThinking={isThinking} lastQuery={lastQuery} />
                  </div>
                </div>

                <div className="w-full lg:w-80 flex flex-col gap-6">
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                      <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Sparkles className="w-4 h-4" /> Graph Embeddings
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                          Used for <strong>Semantic Search</strong>. Vertex AI (text-embedding-004) converts NL into vectors. The DB uses <code>ML.DISTANCE</code> or <code>VECTOR_SEARCH</code> to find nodes with high conceptual similarity.
                      </p>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                      <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Database className="w-4 h-4" /> Graph Traversal
                      </h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                          Used for <strong>Structural Logic</strong>. Once a node is found, Graph Query Languages (GQL/Cypher) traverse relationships to find hidden patterns.
                      </p>
                  </div>
                  <div className="bg-slate-900 p-5 rounded-2xl border border-slate-800 shadow-xl">
                      <h3 className="text-purple-400 font-bold text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                          <Info className="w-4 h-4" /> Product Documentation
                      </h3>
                      <ul className="text-[11px] space-y-2 text-slate-400">
                        <li>
                          <a href="https://cloud.google.com/spanner/docs/graph" target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 flex items-center gap-1 transition-colors">
                            <ExternalLink className="w-3 h-3" /> Spanner Graph Docs
                          </a>
                        </li>
                        <li>
                          <a href="https://cloud.google.com/bigquery/docs/property-graph-overview" target="_blank" rel="noopener noreferrer" className="hover:text-green-400 flex items-center gap-1 transition-colors">
                            <ExternalLink className="w-3 h-3" /> BigQuery Graph Docs
                          </a>
                        </li>
                        <li>
                          <a href="https://neo4j.com/docs/cypher-manual/current/" target="_blank" rel="noopener noreferrer" className="hover:text-orange-400 flex items-center gap-1 transition-colors">
                            <ExternalLink className="w-3 h-3" /> Neo4j Cypher Docs
                          </a>
                        </li>
                        <li>
                          <a href="https://cloud.google.com/vertex-ai/docs" target="_blank" rel="noopener noreferrer" className="hover:text-purple-400 flex items-center gap-1 transition-colors">
                            <ExternalLink className="w-3 h-3" /> Vertex AI Docs
                          </a>
                        </li>
                        <li>
                          <a href="https://cloud.google.com/blog/products/databases/using-spanner-graph-with-langchain-for-graphrag" target="_blank" rel="noopener noreferrer" className="hover:text-yellow-400 flex items-center gap-1 transition-colors">
                            <ExternalLink className="w-3 h-3" /> Google Cloud GraphRAG Blog
                          </a>
                        </li>
                      </ul>
                  </div>
                </div>
              </div>

              <div className="w-full">
                  <h3 className="text-white font-bold text-sm mb-4 uppercase tracking-wider flex items-center gap-2">
                    <Layout className="w-4 h-4 text-purple-500" /> Technology & Pattern Matrix
                  </h3>
                  <div className="w-full overflow-hidden rounded-xl border border-slate-800 shadow-2xl overflow-x-auto">
                      <table className="w-full text-left text-xs border-collapse min-w-[600px]">
                          <thead className="bg-slate-800 text-slate-300 uppercase font-bold">
                              <tr>
                                  <th className="p-4 border-b border-slate-700">Domain</th>
                                  <th className="p-4 border-b border-slate-700">Database</th>
                                  <th className="p-4 border-b border-slate-700">Query Language</th>
                                  <th className="p-4 border-b border-slate-700">Vector Integration</th>
                              </tr>
                          </thead>
                          <tbody className="bg-slate-900/50 text-slate-400">
                              <tr className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4 font-bold text-blue-400">E-Commerce</td>
                                  <td className="p-4 text-slate-200">Cloud Spanner</td>
                                  <td className="p-4 font-mono">GQL</td>
                                  <td className="p-4">ML.DISTANCE</td>
                              </tr>
                              <tr className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4 font-bold text-green-400">FSI & Risk</td>
                                  <td className="p-4 text-slate-200">BigQuery</td>
                                  <td className="p-4 font-mono">SQL + Graph</td>
                                  <td className="p-4">VECTOR_SEARCH</td>
                              </tr>
                              <tr className="border-t border-slate-800 hover:bg-slate-800/30 transition-colors">
                                  <td className="p-4 font-bold text-orange-400">Marketing</td>
                                  <td className="p-4 text-slate-200">Neo4j</td>
                                  <td className="p-4 font-mono">Cypher</td>
                                  <td className="p-4">Vector Index</td>
                              </tr>
                          </tbody>
                      </table>
                  </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'readme' && (
            <motion.div 
              key="readme"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 border border-slate-800 bg-slate-900 rounded-2xl p-6 md:p-10 shadow-2xl overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
                <div className="flex items-center gap-3">
                  <FileText className="text-purple-500 w-8 h-8" />
                  <h2 className="text-2xl font-black text-white uppercase tracking-tight">Project Documentation</h2>
                </div>
                <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">README.md</div>
              </div>
              <div className="prose prose-invert max-w-none space-y-4">
                 {readme.split('\n').map((line, i) => {
                   if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white mb-6 border-b border-slate-800 pb-4">{line.slice(2)}</h1>;
                   if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-purple-400 mt-8 mb-4 flex items-center gap-2"><Sparkles className="w-5 h-5" /> {line.slice(3)}</h2>;
                   if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-bold text-white mt-6 mb-2">{line.slice(4)}</h3>;
                   if (line.startsWith('![')) return <div key={i} className="my-8 p-2 bg-slate-950 rounded-xl border border-slate-800 shadow-2xl"><img src="architecture_diagram.png" alt="Architecture" className="rounded-lg w-full" /></div>;
                   if (line.startsWith('- ')) return <li key={i} className="ml-4 text-slate-300 list-disc">{line.slice(2)}</li>;
                   if (line.startsWith('```')) return null;
                   if (line.trim() === '') return <div key={i} className="h-2" />;
                   return <p key={i} className="text-slate-400 leading-relaxed">{line}</p>;
                 })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default App;
