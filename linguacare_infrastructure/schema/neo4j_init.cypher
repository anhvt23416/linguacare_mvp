// --------------------------------------------------------
// Neo4j Graph Database Initialization Constraints & Indexes
// --------------------------------------------------------

// 1. Uniqueness Constraints
// Ensure that every core entity has a unique identifier
CREATE CONSTRAINT vocab_uuid IF NOT EXISTS FOR (n:VocabularyNode) REQUIRE n.uuid IS UNIQUE;
CREATE CONSTRAINT grammar_uuid IF NOT EXISTS FOR (n:GrammarNode) REQUIRE n.uuid IS UNIQUE;
CREATE CONSTRAINT student_uuid IF NOT EXISTS FOR (n:Student) REQUIRE n.uuid IS UNIQUE;
CREATE CONSTRAINT topic_uuid IF NOT EXISTS FOR (n:Topic) REQUIRE n.uuid IS UNIQUE;

// 2. Performance Indexes
// Indexes for fast lookup during scaffolding graph traversals
CREATE INDEX vocab_form IF NOT EXISTS FOR (n:VocabularyNode) ON (n.canonical_form);
CREATE INDEX vocab_cefr IF NOT EXISTS FOR (n:VocabularyNode) ON (n.cefr_level);
CREATE INDEX grammar_cefr IF NOT EXISTS FOR (n:GrammarNode) ON (n.cefr_level);

// 3. Vector Index for Semantic Graph Search (GDS compatible)
// Used when the ML Sidecar uploads a new word and needs to dynamically draw SEMANTIC_SIMILAR edges
CALL db.index.vector.createNodeIndex(
  'vocab_embeddings_index',
  'VocabularyNode',
  'embedding',
  768, // Sentence Transformer dimension
  'cosine'
);

// Note: Bootstrapping data (CSV imports for cefrj-grammar-profile-20180315.csv) 
// will be handled via dedicated Python ingestion scripts running post-initialization.
