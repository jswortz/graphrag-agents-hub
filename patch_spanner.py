import os
import numpy as np
from google.cloud import spanner

PROJECT_ID = "wortz-project-352116"
INSTANCE_ID = "graphrag-demo-instance"
DATABASE_ID = "products-db"

def provision_spanner():
    spanner_client = spanner.Client(project=PROJECT_ID)
    config_name = f"{spanner_client.project_name}/instanceConfigs/regional-us-east1"
    
    instance = spanner_client.instance(
        INSTANCE_ID,
        configuration_name=config_name,
        display_name="GraphRAG Demo Instance",
        node_count=1
    )
    
    # 1. Create Instance if not exists
    if not instance.exists():
        print(f"Creating Spanner instance {INSTANCE_ID}...")
        try:
            op = instance.create()
            op.result(120)
            print("Instance created.")
        except Exception as e:
            print(f"Instance create error: {e}")
    
    database = instance.database(DATABASE_ID)
    
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
        op = database.create()
        op.result(120)
        op = database.update_ddl(ddl)
        op.result(120)
        print("Database created with Property Graph.")
    else:
        print("Database already exists. Skipping DDL.")

    def get_vec(): return [float(x) for x in np.random.randn(128)]

    with database.batch() as batch:
        batch.insert_or_update(table='Categories', columns=('id', 'name'), values=[('C1', 'High-End Electronics'), ('C2', 'Mobile Devices'), ('C3', 'Footwear')])
        batch.insert_or_update(table='Products', columns=('id', 'name', 'description', 'embedding'), values=[('P1', 'Alpha Laptop', 'High-end laptop.', get_vec()), ('P2', 'Gamma Phone', 'Great smartphone.', get_vec()), ('P3', 'Speed Runner', 'The best running shoe fast', get_vec())])
        batch.insert_or_update(table='BelongsTo', columns=('product_id', 'category_id'), values=[('P1', 'C1'), ('P2', 'C2'), ('P3', 'C3')])
    print("Spanner data populated successfully!")

if __name__ == "__main__":
    provision_spanner()
