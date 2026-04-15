import re

with open("frontend/src/App.tsx", "r") as f:
    content = f.read()

# Replace Quick Links
new_links = """<Info className="w-4 h-4" /> Product Documentation
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
                      </ul>"""

content = re.sub(r'<Info className="w-4 h-4" /> Quick Links\s*</h3>\s*<ul className="text-\[11px\] space-y-2 text-slate-400">.*?</ul>', new_links, content, flags=re.DOTALL)

with open("frontend/src/App.tsx", "w") as f:
    f.write(content)

