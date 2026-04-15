import os
from google.cloud import spanner
from google.cloud.spanner_admin_database_v1.types import spanner_database_admin

PROJECT_ID = os.getenv("PROJECT_ID", "wortz-project-352116")
INSTANCE_ID = os.getenv("INSTANCE_ID", "graphrag-demo-instance")
DATABASE_ID = os.getenv("DATABASE_ID", "products-db")

def provision_spanner():
    spanner_client = spanner.Client(project=PROJECT_ID)
    instance = spanner_client.instance(INSTANCE_ID)
    
    # 1. Create Instance if not exists
    if not instance.exists():
        print(f"Creating Spanner instance {INSTANCE_ID}...")
        config_name = f"{spanner_client.project_name}/instanceConfigs/regional-us-east1"
        op = instance.create(
            config_name=config_name,
            node_count=1,
            display_name="GraphRAG Demo Instance"
        )
        op.result(120)
        print("Instance created.")
    
    database = instance.database(DATABASE_ID)
    
    # 2. Create Database & Schema
    ddl = [
        """CREATE TABLE Products (
            id STRING(MAX),
            name STRING(MAX),
            description STRING(MAX),
            embedding ARRAY<FLOAT64>
        ) PRIMARY KEY (id)""",
        """CREATE TABLE Categories (
            id STRING(MAX),
            name STRING(MAX)
        ) PRIMARY KEY (id)""",
        """CREATE TABLE BelongsTo (
            product_id STRING(MAX),
            category_id STRING(MAX)
        ) PRIMARY KEY (product_id, category_id)""",
        """CREATE PROPERTY GRAPH ProductsGraph
           NODE TABLES (
             Products,
             Categories
           )
           EDGE TABLES (
             BelongsTo
               SOURCE KEY(product_id) REFERENCES Products(id)
               DESTINATION KEY(category_id) REFERENCES Categories(id)
           )"""
    ]
    
    if not database.exists():
        print(f"Creating database {DATABASE_ID} and Property Graph...")
        op = database.create(extra_statements=ddl)
        op.result(120)
        print("Database created with Property Graph.")
    else:
        print("Database already exists. Skipping DDL.")

    # 3. Populate Data
    print("Populating data with vector embeddings...")
    # Generate mock embeddings
    import numpy as np
    def get_vec(): return [float(x) for x in np.random.randn(128)]

    with database.batch() as batch:
        batch.insert_or_update(
            table='Categories',
            columns=('id', 'name'),
            values=[
                ('C1', 'High-End Electronics'),
                ('C2', 'Mobile Devices')
            ]
        )
        batch.insert_or_update(
            table='Products',
            columns=('id', 'name', 'description', 'embedding'),
            values=[
                ('P1', 'Alpha Laptop', 'High-end laptop.', get_vec()),
                ('P2', 'Gamma Phone', 'Great smartphone.', get_vec())
            ]
        )
        batch.insert_or_update(
            table='BelongsTo',
            columns=('product_id', 'category_id'),
            values=[
                ('P1', 'C1'),
                ('P2', 'C2')
            ]
        )
    print("Spanner data populated successfully!")

if __name__ == "__main__":
    provision_spanner()
