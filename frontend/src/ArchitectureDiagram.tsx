import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExternalLink, ArrowRight, Database, Search, Cpu, Share2 } from 'lucide-react';

const Node = ({ title, color, active, x, y, icon: Icon }: any) => {
  return (
    <motion.div
      className={`absolute w-36 h-20 rounded-xl flex flex-col items-center justify-center text-[13px] leading-tight font-bold text-center border-4 shadow-xl z-20 transition-colors duration-300 ${
        active ? color + " text-white border-white scale-110 shadow-2xl z-30" : "bg-slate-800 text-slate-300 border-slate-600"
      }`}
      style={{ left: x, top: y }}
      animate={{
        scale: active ? 1.1 : 1,
        boxShadow: active ? "0px 0px 20px 4px rgba(255,255,255,0.4)" : "0px 4px 6px -1px rgba(0,0,0,0.1)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {Icon && <Icon className={`w-4 h-4 mb-1 ${active ? "text-white" : "text-slate-500"}`} />}
      <div className="whitespace-pre-wrap">{title}</div>
    </motion.div>
  );
};

const Connection = ({ from, to, active, color }: any) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <motion.div
      className={`absolute h-2 origin-left z-10 rounded-full transition-colors duration-300 ${active ? color : "bg-slate-700"}`}
      style={{
        left: from.x,
        top: from.y,
        width: length,
        transform: `rotate(${angle}deg)`,
      }}
      animate={{
        boxShadow: active ? "0px 0px 15px 3px currentColor" : "none",
        opacity: active ? 1 : 0.4
      }}
    >
        {active && (
            <motion.div 
               className="w-full h-full bg-white opacity-60 rounded-full"
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
            />
        )}
    </motion.div>
  );
};

export default function ArchitectureDiagram({ activeNode, isThinking, lastQuery }: any) {
  const nodes = {
    vertex: { x: 230, y: 30, title: "Cloud Run +\nVertex AI", color: "bg-purple-600", pathColor: "bg-purple-500", icon: Cpu },
    spanner: { x: 30, y: 220, title: "Spanner Graph\n(Products)", color: "bg-blue-500", pathColor: "bg-blue-500", icon: Database },
    neo4j: { x: 230, y: 280, title: "Neo4j\n(Brands)", color: "bg-orange-500", pathColor: "bg-orange-500", icon: Share2 },
    bigquery: { x: 430, y: 220, title: "BigQuery Property Graph\n(Customers)", color: "bg-green-500", pathColor: "bg-green-500", icon: Search }
  };
  
  const getCenter = (nodeProps: any) => ({ x: nodeProps.x + 72, y: nodeProps.y + 40 });

  const patternDetails = useMemo(() => {
    if (activeNode === 'spanner') {
      return {
        title: "E-Commerce Pattern (Spanner GQL)",
        input: lastQuery || "Find similar products...",
        process: "text-embedding-004 ➔ ML.DISTANCE ➔ Graph Join",
        output: "Product + Category Tuples",
        code: `GRAPH ProductsGraph\nMATCH (p:Product)-[:BELONGS_TO]->(c:Category)\nWHERE p.description LIKE '%...%'\nRETURN p.name, c.name`
      };
    }
    if (activeNode === 'bigquery') {
      return {
        title: "FSI Pattern (BigQuery Graph)",
        input: lastQuery || "Show customer network...",
        process: "Native BQ Vector Search ➔ GRAPH_TABLE Traversal",
        output: "Transaction Network Nodes",
        code: `SELECT * FROM GRAPH_TABLE(\n  CustomerGraph\n  MATCH (a1:Accounts)-[t:TransfersTo]->(a2:Accounts)\n  COLUMNS (a1.id, a2.id, t.amount)\n)`
      };
    }
    if (activeNode === 'neo4j') {
      return {
        title: "Marketing Pattern (Neo4j Cypher)",
        input: lastQuery || "Campaigns for brand...",
        process: "Entity Extraction ➔ Cypher MATCH ➔ Multi-hop Join",
        output: "Brand-Influencer Relationship Path",
        code: `MATCH (b:Brand)-[:RUNS]->(c:Campaign)-[:FEATURES]->(i:Influencer)\nWHERE b.name = $brand\nRETURN c.name, i.name`
      };
    }
    return null;
  }, [activeNode, lastQuery]);

  const getConsoleLink = () => {
    if (activeNode === 'spanner') return "https://console.cloud.google.com/spanner/instances";
    if (activeNode === 'bigquery') return "https://console.cloud.google.com/bigquery";
    if (activeNode === 'neo4j') return "https://neo4j.com/product/neo4j-graph-database/";
    return null;
  };

  const getStyleClass = () => {
    if (activeNode === 'spanner') return 'border-blue-500/50 bg-blue-950/30 text-blue-200';
    if (activeNode === 'bigquery') return 'border-green-500/50 bg-green-950/30 text-green-200';
    if (activeNode === 'neo4j') return 'border-orange-500/50 bg-orange-950/30 text-orange-200';
    return 'border-purple-500/50 bg-purple-950/30 text-purple-200';
  };

  return (
    <div className="flex flex-col w-full h-full justify-between items-center z-10 gap-8">
      <div className="relative w-[600px] h-[380px] shrink-0">
          <Node {...nodes.vertex} active={isThinking} />
          <Node {...nodes.spanner} active={isThinking && activeNode === 'spanner'} />
          <Node {...nodes.neo4j} active={isThinking && activeNode === 'neo4j'} />
          <Node {...nodes.bigquery} active={isThinking && activeNode === 'bigquery'} />

          <Connection from={getCenter(nodes.vertex)} to={getCenter(nodes.spanner)} active={isThinking && activeNode === 'spanner'} color={nodes.spanner.pathColor} />
          <Connection from={getCenter(nodes.vertex)} to={getCenter(nodes.neo4j)} active={isThinking && activeNode === 'neo4j'} color={nodes.neo4j.pathColor} />
          <Connection from={getCenter(nodes.vertex)} to={getCenter(nodes.bigquery)} active={isThinking && activeNode === 'bigquery'} color={nodes.bigquery.pathColor} />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
           key={activeNode || 'idle'}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
           className={`w-full max-w-2xl p-6 rounded-xl border font-mono text-sm shadow-inner transition-colors duration-500 relative ${getStyleClass()}`}
        >
           <div className="flex justify-between items-center mb-4 pb-2 border-b border-white/20">
              <h3 className="font-bold uppercase tracking-wider text-xs">
                 {patternDetails ? patternDetails.title : 'Orchestration Pattern'}
              </h3>
              {getConsoleLink() && (
                <a 
                  href={getConsoleLink()!} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-[10px] bg-white/10 hover:bg-white/20 px-2 py-1 rounded transition-colors"
                >
                  <ExternalLink className="w-3 h-3" /> Console
                </a>
              )}
           </div>
           
           {patternDetails ? (
             <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                   <div className="text-[10px] text-white/40 uppercase mb-1">Input (NL Query)</div>
                   <div className="text-xs italic truncate">"{patternDetails.input}"</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                   <div className="text-[10px] text-white/40 uppercase mb-1">Execution Pipeline</div>
                   <div className="text-xs">{patternDetails.process}</div>
                </div>
                <div className="bg-black/20 p-3 rounded-lg border border-white/5 col-span-2">
                   <div className="text-[10px] text-white/40 uppercase mb-1">Output (Graph Tuples)</div>
                   <div className="text-xs">{patternDetails.output}</div>
                </div>
             </div>
           ) : null}

           <pre className="whitespace-pre-wrap text-[11px] leading-relaxed bg-black/40 p-4 rounded-lg border border-white/5">
             {patternDetails ? patternDetails.code : `/* Cloud Run + Vertex AI Agent */\n1. Receive NL Intent via Cloud Run API\n2. Extract Entity & Intent via Vertex\n3. Determine optimal Graph Database Route\n4. Synthesize underlying Graph Query Language\n5. Return natural response generated from Graph tuples`}
           </pre>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
