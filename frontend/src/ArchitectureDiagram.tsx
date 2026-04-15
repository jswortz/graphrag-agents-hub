import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Node = ({ title, color, active, x, y }) => {
  return (
    <motion.div
      className={`absolute w-32 h-20 rounded-xl flex items-center justify-center text-sm font-bold text-center border-4 shadow-xl z-20 ${
        active ? color + " text-white border-white scale-110 shadow-2xl z-30" : "bg-slate-800 text-slate-300 border-slate-600"
      }`}
      style={{ left: x, top: y }}
      animate={{
        scale: active ? 1.05 : 1,
        boxShadow: active ? "0px 0px 20px 4px rgba(255,255,255,0.4)" : "0px 4px 6px -1px rgba(0,0,0,0.1)",
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      {title}
    </motion.div>
  );
};

const Connection = ({ from, to, active, color }) => {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const length = Math.sqrt(dx * dx + dy * dy);
  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  return (
    <motion.div
      className={`absolute h-2 origin-left z-10 ${active ? color : "bg-slate-700"}`}
      style={{
        left: from.x,
        top: from.y,
        width: length,
        transform: `rotate(${angle}deg)`,
      }}
      animate={{
        boxShadow: active ? "0px 0px 10px 2px currentColor" : "none",
        opacity: active ? 1 : 0.4
      }}
    >
        {active && (
            <motion.div 
               className="w-full h-full bg-white opacity-50"
               initial={{ x: "-100%" }}
               animate={{ x: "100%" }}
               transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            />
        )}
    </motion.div>
  );
};

export default function ArchitectureDiagram({ activeNode, isThinking }) {
  const nodes = {
    vertex: { x: 250, y: 50, title: "Vertex AI\nOrchestrator", color: "bg-purple-600", pathColor: "bg-purple-500" },
    spanner: { x: 50, y: 250, title: "Spanner Graph\n(Products)", color: "bg-blue-500", pathColor: "bg-blue-500" },
    neo4j: { x: 250, y: 350, title: "Neo4j\n(Brands)", color: "bg-orange-500", pathColor: "bg-orange-500" },
    bigquery: { x: 450, y: 250, title: "BigQuery Property Graph\n(Customers)", color: "bg-green-500", pathColor: "bg-green-500" }
  };
  
  // Center of nodes for connection ends
  const getCenter = (nodeProps) => ({ x: nodeProps.x + 64, y: nodeProps.y + 40 });

  return (
    <div className="relative w-full h-[500px] bg-slate-900 rounded-2xl overflow-hidden border border-slate-700 p-8 flex items-center justify-center">
       <div className="relative w-[600px] h-[450px]">
           {/* Vertice / Nodes */}
           <Node {...nodes.vertex} active={isThinking || activeNode !== null} />
           <Node {...nodes.spanner} active={activeNode === 'spanner'} />
           <Node {...nodes.neo4j} active={activeNode === 'neo4j'} />
           <Node {...nodes.bigquery} active={activeNode === 'bigquery'} />

           {/* Connections */}
           <Connection from={getCenter(nodes.vertex)} to={getCenter(nodes.spanner)} active={activeNode === 'spanner'} color={nodes.spanner.pathColor} />
           <Connection from={getCenter(nodes.vertex)} to={getCenter(nodes.neo4j)} active={activeNode === 'neo4j'} color={nodes.neo4j.pathColor} />
           <Connection from={getCenter(nodes.vertex)} to={getCenter(nodes.bigquery)} active={activeNode === 'bigquery'} color={nodes.bigquery.pathColor} />
       </div>
    </div>
  );
}
