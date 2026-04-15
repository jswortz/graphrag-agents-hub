import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Node = ({ title, color, active, x, y }: any) => {
  return (
    <motion.div
      className={`absolute w-36 h-20 rounded-xl flex items-center justify-center text-[13px] leading-tight font-bold text-center border-4 shadow-xl z-20 transition-colors duration-300 ${
        active ? color + " text-white border-white scale-110 shadow-2xl z-30" : "bg-slate-800 text-slate-300 border-slate-600"
      }`}
      style={{ left: x, top: y }}
      animate={{
        scale: active ? 1.1 : 1,
        boxShadow: active ? "0px 0px 20px 4px rgba(255,255,255,0.4)" : "0px 4px 6px -1px rgba(0,0,0,0.1)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
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

export default function ArchitectureDiagram({ activeNode, isThinking }: any) {
  const nodes = {
    vertex: { x: 230, y: 30, title: "Vertex AI\nOrchestrator", color: "bg-purple-600", pathColor: "bg-purple-500" },
    spanner: { x: 30, y: 220, title: "Spanner Graph\n(Products)", color: "bg-blue-500", pathColor: "bg-blue-500" },
    neo4j: { x: 230, y: 280, title: "Neo4j\n(Brands)", color: "bg-orange-500", pathColor: "bg-orange-500" },
    bigquery: { x: 430, y: 220, title: "BigQuery Property Graph\n(Customers)", color: "bg-green-500", pathColor: "bg-green-500" }
  };
  
  const getCenter = (nodeProps: any) => ({ x: nodeProps.x + 72, y: nodeProps.y + 40 });

  const getCodeSnippet = () => {
    if (activeNode === 'spanner') {
      return `/* Spanner GQL Pattern */\nGRAPH ProductsGraph\nMATCH (p:Product)-[:BELONGS_TO]->(c:Category)\n/* Using Vertex Embeddings for vector distance */\nWHERE p.description LIKE '%query%'\nRETURN p.name, c.name\n\n// Backend: google-cloud-spanner`;
    }
    if (activeNode === 'bigquery') {
      return `/* BigQuery Native Property Graph */\nSELECT * FROM GRAPH_TABLE(\n  \`project.dataset.CustomerGraph\`\n  MATCH (a1:Accounts)-[t:TransfersTo]->(a2:Accounts)\n  COLUMNS (a1.id, a2.id, t.amount)\n)\n\n// Backend: google-cloud-bigquery`;
    }
    if (activeNode === 'neo4j') {
      return `/* Neo4j Cypher Pattern */\nMATCH (b:Brand)-[:RUNS]->(c:Campaign)-[:FEATURES]->(i:Influencer)\nWHERE b.name = $brand\nRETURN c.name, i.name\n\n// Backend: neo4j python driver`;
    }
    return `/* Vertex AI Langchain Agent */\n1. Receive NL Intent\n2. Extract Entity & Intent\n3. Determine optimal Graph Database Route\n4. Synthesize underlying Graph Query Language (GQL / Cypher / SQL)\n5. Return natural response generated from Graph tuples`;
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
           className={`w-full max-w-lg p-5 rounded-xl border font-mono text-sm shadow-inner transition-colors duration-500 ${getStyleClass()}`}
        >
           <h3 className="font-bold mb-3 pb-2 border-b border-white/20 uppercase tracking-wider text-xs">
              {activeNode ? `${activeNode} Execution Pattern` : 'Orchestration Pattern'}
           </h3>
           <pre className="whitespace-pre-wrap">{getCodeSnippet()}</pre>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
