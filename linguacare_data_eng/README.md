# Linguacare Data Engineering

This folder contains the Python scripts required to bootstrap the Neo4j Knowledge Graph.

## Prerequisites
1. Ensure your Docker Desktop is running.
2. Ensure the `neo4j` and `postgres` containers are running.
```bash
cd ../linguacare_infrastructure
docker-compose up -d neo4j
```

## Running the Ingestion
1. Install dependencies:
```bash
pip install -r requirements.txt
```
2. Run the script:
```bash
python neo4j_ingestion.py
```

This script will read the raw CSVs from the `../../data` directory (which is securely mounted into the Neo4j container) and construct the Domain Graph via Cypher `LOAD CSV` transactions.
