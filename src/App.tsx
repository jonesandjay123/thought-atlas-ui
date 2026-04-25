import { useMemo, useState } from "react";
import { clusters, edges, inboxItems, nodes } from "./data/mockThoughtAtlas";
import type { ClusterReport, ThoughtNode } from "./types";

const relationLabels = {
  supports: "supports",
  contrasts: "contrasts",
  extends: "extends",
  "depends-on": "depends on",
};

const sourceLabels = {
  conversation: "AI conversation",
  markdown: "Markdown note",
  report: "Research report",
  web: "Web source",
};

function App() {
  const [selectedNodeId, setSelectedNodeId] = useState(nodes[0].id);
  const [activeClusterId, setActiveClusterId] = useState(clusters[0].id);

  const selectedNode = useMemo(
    () => nodes.find((node) => node.id === selectedNodeId) ?? nodes[0],
    [selectedNodeId],
  );
  const activeCluster = useMemo(
    () => clusters.find((cluster) => cluster.id === activeClusterId) ?? clusters[0],
    [activeClusterId],
  );
  const clusterById = useMemo(
    () => new Map(clusters.map((cluster) => [cluster.id, cluster])),
    [],
  );
  const nodeById = useMemo(() => new Map(nodes.map((node) => [node.id, node])), []);

  const selectedEdges = edges.filter(
    (edge) => edge.source === selectedNode.id || edge.target === selectedNode.id,
  );

  return (
    <main className="app-shell">
      <section className="topbar" aria-label="Thought Atlas overview">
        <div>
          <p className="eyebrow">Hosted UI shell · mock data</p>
          <h1>Thought Atlas</h1>
          <p className="topbar-subtitle">
            UI-only atlas client for the Thought Atlas engine. Firestore and exported graph clients
            are intentionally not connected yet.
          </p>
        </div>
        <div className="metrics" aria-label="Atlas metrics">
          <Metric value={nodes.length.toString()} label="nodes" />
          <Metric value={edges.length.toString()} label="edges" />
          <Metric value={clusters.length.toString()} label="clusters" />
          <Metric value={inboxItems.length.toString()} label="inbox" />
        </div>
      </section>

      <section className="workspace">
        <aside className="inbox-panel" aria-label="Idea inbox">
          <div className="panel-heading">
            <p className="eyebrow">Mock capture queue</p>
            <h2>Idea inbox preview</h2>
          </div>
          <div className="inbox-list">
            {inboxItems.map((item) => (
              <article className={`inbox-item ${item.status}`} key={item.id}>
                <div className="item-row">
                  <strong>{item.title}</strong>
                  <span>{item.status}</span>
                </div>
                <p>{item.excerpt}</p>
                <div className="tag-row">
                  {item.suggestedTags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
                <small>{item.source}</small>
              </article>
            ))}
          </div>
        </aside>

        <section className="atlas-panel" aria-label="Thought graph">
          <div className="atlas-toolbar">
            <div>
              <p className="eyebrow">Mock atlas view</p>
              <h2>Static graph preview</h2>
            </div>
            <div className="cluster-tabs" role="tablist" aria-label="Cluster filter">
              {clusters.map((cluster) => (
                <button
                  key={cluster.id}
                  className={activeClusterId === cluster.id ? "active" : ""}
                  onClick={() => setActiveClusterId(cluster.id)}
                  style={{ "--cluster": cluster.color } as React.CSSProperties}
                >
                  {cluster.name}
                </button>
              ))}
            </div>
          </div>
          <GraphView
            activeCluster={activeCluster}
            clusterById={clusterById}
            nodeById={nodeById}
            selectedNode={selectedNode}
            onSelectNode={(node) => {
              setSelectedNodeId(node.id);
              setActiveClusterId(node.cluster);
            }}
          />
        </section>

        <aside className="inspector-panel" aria-label="Mock inspector and reports">
          <Inspector node={selectedNode} relatedEdges={selectedEdges} nodeById={nodeById} />
          <ClusterReportPanel cluster={activeCluster} nodeById={nodeById} />
        </aside>
      </section>
    </main>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <div className="metric">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function GraphView({
  activeCluster,
  clusterById,
  nodeById,
  selectedNode,
  onSelectNode,
}: {
  activeCluster: ClusterReport;
  clusterById: Map<string, ClusterReport>;
  nodeById: Map<string, ThoughtNode>;
  selectedNode: ThoughtNode;
  onSelectNode: (node: ThoughtNode) => void;
}) {
  return (
    <div className="graph-frame">
      <svg viewBox="0 0 1000 720" role="img" aria-label="Thought graph visualization">
        <defs>
          <radialGradient id="atlasGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fffaf0" />
            <stop offset="100%" stopColor="#e7dfd0" />
          </radialGradient>
          <filter id="softShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="8" stdDeviation="10" floodColor="#1b1d1f" floodOpacity="0.12" />
          </filter>
        </defs>
        <rect width="1000" height="720" rx="28" fill="url(#atlasGlow)" />
        <g opacity="0.42">
          {Array.from({ length: 9 }).map((_, index) => (
            <circle
              key={index}
              cx="500"
              cy="360"
              r={80 + index * 54}
              fill="none"
              stroke="#b7ad9a"
              strokeWidth="1"
            />
          ))}
        </g>
        <g>
          {edges.map((edge) => {
            const source = nodeById.get(edge.source);
            const target = nodeById.get(edge.target);
            if (!source || !target) return null;
            const isSelected = source.id === selectedNode.id || target.id === selectedNode.id;
            return (
              <line
                key={`${edge.source}-${edge.target}`}
                x1={source.x * 10}
                y1={source.y * 7.2}
                x2={target.x * 10}
                y2={target.y * 7.2}
                stroke={isSelected ? "#111827" : "#8d8677"}
                strokeWidth={isSelected ? 4 : Math.max(1.4, edge.weight * 3)}
                strokeDasharray={edge.relation === "contrasts" ? "8 8" : undefined}
                opacity={isSelected ? 0.76 : 0.34}
              />
            );
          })}
        </g>
        <g>
          {clusters.map((cluster) => {
            const clusterNodes = nodes.filter((node) => node.cluster === cluster.id);
            const cx =
              clusterNodes.reduce((sum, node) => sum + node.x * 10, 0) / clusterNodes.length;
            const cy =
              clusterNodes.reduce((sum, node) => sum + node.y * 7.2, 0) / clusterNodes.length;
            return (
              <text key={cluster.id} x={cx - 72} y={cy - 72} className="cluster-label">
                {cluster.name}
              </text>
            );
          })}
        </g>
        <g>
          {nodes.map((node) => {
            const cluster = clusterById.get(node.cluster);
            const isSelected = node.id === selectedNode.id;
            const isActiveCluster = node.cluster === activeCluster.id;
            return (
              <g
                key={node.id}
                className="graph-node"
                filter={isSelected ? "url(#softShadow)" : undefined}
                opacity={isActiveCluster || isSelected ? 1 : 0.4}
                onClick={() => onSelectNode(node)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") onSelectNode(node);
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${node.title}`}
              >
                <circle
                  cx={node.x * 10}
                  cy={node.y * 7.2}
                  r={node.radius}
                  fill={cluster?.color ?? "#4b5563"}
                  stroke={isSelected ? "#111827" : "#fffaf0"}
                  strokeWidth={isSelected ? 5 : 3}
                />
                <circle
                  cx={node.x * 10 - node.radius * 0.26}
                  cy={node.y * 7.2 - node.radius * 0.26}
                  r={node.radius * 0.34}
                  fill="#ffffff"
                  opacity="0.18"
                />
                <text x={node.x * 10} y={node.y * 7.2 + node.radius + 19} className="node-label">
                  {node.title}
                </text>
              </g>
            );
          })}
        </g>
      </svg>
    </div>
  );
}

function Inspector({
  node,
  relatedEdges,
  nodeById,
}: {
  node: ThoughtNode;
  relatedEdges: typeof edges;
  nodeById: Map<string, ThoughtNode>;
}) {
  return (
    <section className="detail-card">
      <div className="panel-heading">
        <p className="eyebrow">Mock inspector</p>
        <h2>{node.title}</h2>
      </div>
      <p className="summary">{node.summary}</p>
      <dl className="property-grid">
        <div>
          <dt>Source</dt>
          <dd>{sourceLabels[node.sourceType]}</dd>
        </div>
        <div>
          <dt>Confidence</dt>
          <dd>{Math.round(node.confidence * 100)}%</dd>
        </div>
        <div>
          <dt>State</dt>
          <dd>{node.freshness}</dd>
        </div>
      </dl>
      <div className="tag-row">
        {node.tags.map((tag) => (
          <span key={tag}>{tag}</span>
        ))}
      </div>
      <div className="relations">
        <h3>Nearby relations</h3>
        {relatedEdges.map((edge) => {
          const otherId = edge.source === node.id ? edge.target : edge.source;
          const otherNode = nodeById.get(otherId);
          return (
            <div className="relation-row" key={`${edge.source}-${edge.target}`}>
              <span>{relationLabels[edge.relation]}</span>
              <strong>{otherNode?.title}</strong>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function ClusterReportPanel({
  cluster,
  nodeById,
}: {
  cluster: ClusterReport;
  nodeById: Map<string, ThoughtNode>;
}) {
  return (
    <section className="detail-card cluster-report">
      <div className="panel-heading">
        <p className="eyebrow">Mock cluster report</p>
        <h2>{cluster.name}</h2>
      </div>
      <p className="summary">{cluster.thesis}</p>
      <div className="mini-node-list">
        {cluster.nodeIds.map((nodeId) => {
          const node = nodeById.get(nodeId);
          return node ? <span key={node.id}>{node.title}</span> : null;
        })}
      </div>
      <h3>Open questions</h3>
      <ul>
        {cluster.openQuestions.map((question) => (
          <li key={question}>{question}</li>
        ))}
      </ul>
      <h3>Next moves</h3>
      <ul>
        {cluster.nextMoves.map((move) => (
          <li key={move}>{move}</li>
        ))}
      </ul>
    </section>
  );
}

export default App;
