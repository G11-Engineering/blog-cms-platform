# blog-cms-platform
graph TD
    %% Title
    classDef title fill:#FFFFFF,stroke:#000000;
    T[Blog/CMS Management System Architecture]:::title

    %% Clients
    U[Users<br>Authors, Editors, Admins, Readers] --> B[Web Browser]
    B --> W[Web Application Layer<br>Scalable based on user traffic/load]

    %% API Gateway
    W --> A[API Gateway / Load Balancer<br>Handles requests, authentication]

    %% Microservices
    subgraph Microservices
        US[User Service<br>Authentication, Profiles, Roles]
        CS[Content Service<br>CRUD, Drafts, Scheduling, Versioning]
        MS[Media Service<br>File Uploads (Images, Videos, Docs)]
        CTS[Category & Tag Service<br>Organization, Browse/Search]
        CMS[Comment Service<br>Comments, Replies, Moderation]
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
        GR[GitHub Repo<br>Source Code]
        CT[CI/CD Tool<br>e.g., Jenkins]
        C1[Stage 1: Monitor & Trigger]
        C2[Stage 2: Build & Containerize<br>Build Docker Images]
        C3[Stage 3: Security Scans<br>Vulnerability Scans]
        C4[Stage 4: Deploy to Staging<br>ArgoCD, Smoke Tests]
        C5[Stage 5: Manual Approval]
        C6[Stage 6: Production Deployment<br>Canary/Blue-Green]
        GR --> C1 --> C2 --> C3 --> C4 --> C5 --> C6
        C3 --> C4 : If Pass
        C4 --> C5 : If Tests Pass
        C5 --> C6 : On Approval
    end

    %% Kubernetes Infrastructure
    subgraph Kubernetes Infrastructure
        SK[Staging Cluster<br>ArgoCD for GitOps]
        PK[Production Cluster<br>Canary/Blue-Green, Zero Trust]
    end
    C4 --> SK : Deploy
    C6 --> PK : Deploy

    %% Monitoring & Logging
    P[Prometheus<br>Monitor CMS & K8s]
    O[OpenSearch Stack<br>Log Management]
    P --> SK
    P --> PK
    P --> Microservices : Via Exporters
    O --> SK : Logs
    O --> PK : Logs
    O --> Microservices : App Logs

    %% Styling
    classDef default fill:#E6F3FF,stroke:#4682B4;
    classDef actor fill:#FFD700,stroke:#B8860B;
    classDef db fill:#98FB98,stroke:#228B22;
    classDef k8s fill:#F0E68C,stroke:#DAA520;

    class U,B actor;
    class UDB,CDB,MDB,CTDB,CMDB db;
    class SK,PK k8s;
