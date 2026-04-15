import os
from google.cloud import bigquery

PROJECT_ID = os.getenv("PROJECT_ID", "wortz-project-352116")
DATASET_ID = os.getenv("DATASET_ID", "graphrag_customers")
REGION = "US"

def provision_bigquery():
    client = bigquery.Client(project=PROJECT_ID)
    
    # 1. Create Dataset
    dataset_ref = f"{PROJECT_ID}.{DATASET_ID}"
    dataset = bigquery.Dataset(dataset_ref)
    dataset.location = REGION
    try:
        dataset = client.create_dataset(dataset, exists_ok=True)
        print(f"Dataset {dataset.dataset_id} created/exists.")
    except Exception as e:
        print(f"Error creating dataset: {e}")

    # 2. Create foundational tables and populate
    queries = [
        f"""
        CREATE OR REPLACE TABLE `{dataset_ref}.Customers` AS
        SELECT 'U1' as id, 'Alice' as name, [0.1, 0.2, 0.3] as embedding UNION ALL
        SELECT 'U2' as id, 'Bob' as name, [0.4, 0.5, 0.6] as embedding UNION ALL
        SELECT 'U3' as id, 'Charlie' as name, [0.7, 0.8, 0.9] as embedding
        """,
        f"""
        CREATE OR REPLACE TABLE `{dataset_ref}.Accounts` AS
        SELECT 'A_U1' as id, 1500.0 as balance, 'U1' as customer_id UNION ALL
        SELECT 'A_U2' as id, 300.0 as balance, 'U2' as customer_id UNION ALL
        SELECT 'A_U3' as id, 12000.0 as balance, 'U3' as customer_id
        """,
        f"""
        CREATE OR REPLACE TABLE `{dataset_ref}.Transfers` AS
        SELECT 'A_U1' as src_id, 'A_U3' as dst_id, 500.0 as amount UNION ALL
        SELECT 'A_U2' as src_id, 'A_U3' as dst_id, 150.0 as amount
        """
    ]
    
    print("Populating BigQuery base tables...")
    for q in queries:
        client.query(q).result()

    # 3. Create Property Graph
    pg_query = f"""
    CREATE OR REPLACE PROPERTY GRAPH `{dataset_ref}.CustomerGraph`
    NODE TABLES (
      `{dataset_ref}.Customers` as Customers KEY(id),
      `{dataset_ref}.Accounts` as Accounts KEY(id)
    )
    EDGE TABLES (
      `{dataset_ref}.Transfers` as TransfersTo
        KEY(src_id, dst_id)
        SOURCE KEY (src_id) REFERENCES Accounts (id)
        DESTINATION KEY (dst_id) REFERENCES Accounts (id)
    )
    """
    
    print("Creating native BigQuery Property Graph...")
    client.query(pg_query).result()
    print("BigQuery provisioning complete!")

if __name__ == "__main__":
    provision_bigquery()
