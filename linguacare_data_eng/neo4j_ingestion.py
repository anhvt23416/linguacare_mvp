import os
import time
from neo4j import GraphDatabase
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s [%(levelname)s] %(message)s')
logger = logging.getLogger(__name__)

NEO4J_URI = os.getenv("NEO4J_URI", "bolt://localhost:7687")
NEO4J_USER = os.getenv("NEO4J_USER", "neo4j")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD", "linguacare_graph")

def wait_for_neo4j(driver, max_retries=30):
    logger.info(f"Attempting to connect to Neo4j at {NEO4J_URI}...")
    for i in range(max_retries):
        try:
            with driver.session() as session:
                session.run("RETURN 1")
            logger.info("Successfully connected to Neo4j.")
            return True
        except Exception as e:
            logger.warning(f"Neo4j not ready. Retrying in 2 seconds... ({i+1}/{max_retries})")
            time.sleep(2)
    
    logger.error("Failed to connect to Neo4j after maximum retries.")
    return False

def run_ingestion():
    driver = GraphDatabase.driver(NEO4J_URI, auth=(NEO4J_USER, NEO4J_PASSWORD))
    
    if not wait_for_neo4j(driver):
        return

    logger.info("Applying core constraints and indexes (idempotent)...")
    with driver.session() as session:
        # We ensure constraints exist first so loads are fast
        session.run("CREATE CONSTRAINT vocab_uuid IF NOT EXISTS FOR (n:VocabularyNode) REQUIRE n.uuid IS UNIQUE;")
        session.run("CREATE CONSTRAINT grammar_uuid IF NOT EXISTS FOR (n:GrammarNode) REQUIRE n.uuid IS UNIQUE;")
        session.run("CREATE CONSTRAINT topic_uuid IF NOT EXISTS FOR (n:Topic) REQUIRE n.uuid IS UNIQUE;")
        session.run("CREATE INDEX vocab_form IF NOT EXISTS FOR (n:VocabularyNode) ON (n.canonical_form);")
        
    logger.info("Ingesting Categories (Topics)...")
    with driver.session() as session:
        session.run("""
        LOAD CSV WITH HEADERS FROM 'file:///data/categories.csv' AS row
        MERGE (t:Topic {uuid: 'topic_' + row.category_id})
        SET t.title = row.category_title
        """)
        
    logger.info("Ingesting Words (VocabularyNodes)...")
    with driver.session() as session:
        # Note: Using periodic commit logic via apoc or basic MERGE since we have ~170k rows
        # We'll use a basic CALL {} IN TRANSACTIONS for Neo4j 5.x
        session.run("""
        LOAD CSV WITH HEADERS FROM 'file:///data/words.csv' AS row
        CALL {
            WITH row
            MERGE (v:VocabularyNode {uuid: 'word_' + row.word_id})
            SET v.canonical_form = row.word,
                v.stem_word_id = row.stem_word_id
        } IN TRANSACTIONS OF 5000 ROWS;
        """)

    logger.info("Ingesting Word POS and attaching to Categories...")
    with driver.session() as session:
        session.run("""
        LOAD CSV WITH HEADERS FROM 'file:///data/word_pos.csv' AS row
        CALL {
            WITH row
            MATCH (v:VocabularyNode {uuid: 'word_' + row.word_id})
            SET v.cefr_level = row.level,
                v.frequency_count = toInteger(row.frequency_count)
        } IN TRANSACTIONS OF 5000 ROWS;
        """)
        
        session.run("CREATE CONSTRAINT wordpos_id IF NOT EXISTS FOR (p:WordPos) REQUIRE p.word_pos_id IS UNIQUE;")
        
        session.run("""
        LOAD CSV WITH HEADERS FROM 'file:///data/word_pos.csv' AS row
        CALL {
            WITH row
            MATCH (v:VocabularyNode {uuid: 'word_' + row.word_id})
            MERGE (p:WordPos {word_pos_id: row.word_pos_id})
            MERGE (v)-[:HAS_POS]->(p)
            SET v.cefr_level = row.level,
                v.frequency_count = toInteger(row.frequency_count)
        } IN TRANSACTIONS OF 5000 ROWS;
        """)

        session.run("""
        LOAD CSV WITH HEADERS FROM 'file:///data/word_categories.csv' AS row
        CALL {
            WITH row
            MATCH (p:WordPos {word_pos_id: row.word_pos_id})
            MATCH (t:Topic {uuid: 'topic_' + row.category_id})
            MATCH (v:VocabularyNode)-[:HAS_POS]->(p)
            MERGE (v)-[:BELONGS_TO]->(t)
        } IN TRANSACTIONS OF 5000 ROWS;
        """)
        
        session.run("""
        // Step 3: Remove the temporary nodes to keep graph clean
        MATCH (p:WordPos)
        CALL {
            WITH p
            DETACH DELETE p
        } IN TRANSACTIONS OF 5000 ROWS;
        """)
        session.run("DROP CONSTRAINT wordpos_id IF EXISTS;")

    logger.info("Ingesting Grammar Profile...")
    with driver.session() as session:
        session.run("""
        LOAD CSV WITH HEADERS FROM 'file:///data/cefrj-grammar-profile-20180315.csv' AS row
        CALL {
            WITH row
            MERGE (g:GrammarNode {uuid: 'grammar_' + row.ID})
            SET g.item = row.`Grammatical Item`,
                g.cefr_level = row.`CEFR-J Level`,
                g.sentence_type = row.`Sentence Type`
        } IN TRANSACTIONS OF 1000 ROWS;
        """)

    logger.info("Data Ingestion Complete.")
    driver.close()

if __name__ == "__main__":
    run_ingestion()
