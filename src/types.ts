export type SourceType = "conversation" | "markdown" | "report" | "web";

export type ThoughtNode = {
  id: string;
  title: string;
  summary: string;
  cluster: string;
  sourceType: SourceType;
  confidence: number;
  freshness: "new" | "active" | "settled";
  tags: string[];
  x: number;
  y: number;
  radius: number;
};

export type ThoughtEdge = {
  source: string;
  target: string;
  relation: "supports" | "contrasts" | "extends" | "depends-on";
  weight: number;
};

export type IdeaInboxItem = {
  id: string;
  title: string;
  source: string;
  capturedAt: string;
  excerpt: string;
  suggestedTags: string[];
  status: "queued" | "triaged" | "linked";
};

export type ClusterReport = {
  id: string;
  name: string;
  thesis: string;
  nodeIds: string[];
  openQuestions: string[];
  nextMoves: string[];
  color: string;
};
