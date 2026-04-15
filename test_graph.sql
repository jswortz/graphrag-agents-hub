CREATE OR REPLACE PROPERTY GRAPH `wortz-project-352116.graphrag_customers.CustomerGraph`
    NODE TABLES (
      `wortz-project-352116.graphrag_customers.Customers` as Customers KEY(id),
      `wortz-project-352116.graphrag_customers.Accounts` as Accounts KEY(id)
    )
    EDGE TABLES (
      `wortz-project-352116.graphrag_customers.Transfers` as TransfersTo
        KEY(src_id, dst_id)
        SOURCE KEY (src_id) REFERENCES Accounts (id)
        DESTINATION KEY (dst_id) REFERENCES Accounts (id)
    );
