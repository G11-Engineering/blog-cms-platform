# blog-cms-platform

graph TD
    %% Clients
    U[Users: Authors, Editors, Admins, Readers] --> B[Web Browser]
    B --> W[Web Application Layer]

    %% API Gateway
    W --> A[API Gateway / Load Balancer]

    %% Microservices
    subgraph Microservices
        US[User Service: Auth, Profiles, Roles]
        CS[Content Service: CRUD, Drafts, Scheduling, Versioning]
        MS[Media Service: File Uploads]
        CTS[Category & Tag Service: Organization, Browse/Search]
        CMS[Comment Service: Comments, Replies, Moderation]
    end

    %% Databases
    US --> UDB[(User DB)]
    CS --> CDB[(Content DB)]
    MS --> MDB[(Media DB)]
    CTS --> CTDB[(Cat/Tag DB)]
    CMS --> CMDB[(Comment DB)]

    %% Connections
    A --> US
    A --> CS
    A --> MS
    A --> CTS
    A --> CMS

    %% CI/CD Pipeline
    subgraph CI/CD Pipeline
        GR[GitHub Repo: Source Code]
        C1[Stage 1: Monitor & Trigger]
        C2[Stage 2: Build & Containerize]
        C3[Stage 3: Security Scans]
        C4[Stage 4: Deploy to Staging]
        C5[Stage 5: Manual Approval]
        C6[Stage 6: Production Deployment]
        GR --> C1 --> C2 --> C3 --> C4 --> C5 --> C6
    end

    %% Kubernetes Infrastructure
    subgraph Kubernetes Infrastructure
        SK[Staging Cluster]
        PK[Production Cluster]
    end
    C4 --> SK
    C6 --> PK

    %% Monitoring & Logging
    P[Prometheus: Monitor CMS & K8s]
    O[OpenSearch Stack: Log Management]
    P --> SK
    P --> PK
    P --> US
    P --> CS
    P --> MS
    P --> CTS
    P --> CMS

    O --> SK
    O --> PK
    O --> US
    O --> CS
    O --> MS
    O --> CTS
    O --> CMS

    %% Notes
    N1[Zero Trust: AuthN/AuthZ, Least Privilege] --> A
    N2[Git Repos for Source Code] --> GR
    N3[Deployment Guide, Presentation/Demo] --> PK
