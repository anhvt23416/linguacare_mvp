# Linguacare Infrastructure

This directory contains the database initialization schemas and configurations for the Linguacare platform, including PostgreSQL (operational DB) and Neo4j (knowledge graph).

## Visualizing Neo4j with Cypher Queries

Once the `linguacare_graph` database is initialized and populated with data (using `neo4j_ingestion.py`), you can use the Neo4j Browser to visualize the graph. Open the Neo4j Browser (usually at `http://localhost:7474`) and try the following queries:

### 1. Visualize the Overall Schema (Meta-Graph)
This built-in query visualizes how different node labels are connected in the database:
```cypher
CALL db.schema.visualization()
```

### 2. View a Topic and its Associated Vocabulary
Replace `topic_id` with a specific topic (e.g., `topic_1`) to see how words cluster around a specific subject:
```cypher
MATCH (t:Topic)-[r:BELONGS_TO]-(v:VocabularyNode)
RETURN t, r, v 
LIMIT 50
```

### 3. Explore Vocabulary by CEFR Level
Visualize vocabulary nodes that belong to a specific CEFR level (e.g., A1):
```cypher
MATCH (v:VocabularyNode {cefr_level: 'A1'})-[r:BELONGS_TO]->(t:Topic)
RETURN v, r, t 
LIMIT 50
```

### 4. Random Sampling of the Graph
A quick way to get a feel for the data structure by pulling a random cluster of nodes and relationships:
```cypher
MATCH (n)-[r]->(m) 
RETURN n, r, m 
LIMIT 100
```

### 5. Check Grammar Nodes
Visualize the imported CEFR-J grammar profile nodes:
```cypher
MATCH (g:GrammarNode) 
RETURN g 
LIMIT 25
```
