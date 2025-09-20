# blog-cms-platform

@startuml
skinparam nodesep 50
skinparam ranksep 50
skinparam componentStyle uml2
skinparam defaultFontName Arial

' Colors
skinparam backgroundColor #FFFFFF
skinparam component {
  BackgroundColor #E6F3FF
  BorderColor #4682B4
  FontColor #000000
}
skinparam actor {
  BackgroundColor #FFD700
  BorderColor #B8860B
}
skinparam database {
  BackgroundColor #98FB98
  BorderColor #228B22
}
skinparam cloud {
  BackgroundColor #F0E68C
  BorderColor #DAA520
}
skinparam folder {
  BackgroundColor #ADD8E6
  BorderColor #4682B4
}
skinparam note {
  BackgroundColor #FFFFE0
  BorderColor #FFD700
}

title Blog/CMS Management System Architecture

' Clients
actor "Users (Authors, Editors, Admins, Readers)" as User #FFD700
actor "Web Browser" as Browser #FFD700

' Frontend
component "Web Application Layer" as WebApp {
  note right: Scalable based on user traffic/load
}

' API Gateway
component "API Gateway / Load Balancer" as APIGateway {
  note right: Handles requests, authentication
}

' Microservices
folder "Microservices" #ADD8E6 {
  component "User Service" as UserSvc #E6F3FF {
    note bottom: Authentication, Profiles, Roles
  }
  component "Content Service" as ContentSvc #E6F3FF {
    note bottom: CRUD, Drafts, Scheduling, Versioning
  }
  component "Media Service" as MediaSvc #E6F3FF {
    note bottom: File Uploads (Images, Videos, Docs)
  }
  component "Category & Tag Service" as CatTagSvc #E6F3FF {
    note bottom: Organization, Browse/Search by Category/Tag/Author
  }
  component "Comment Service" as CommentSvc #E6F3FF {
    note bottom: Comments, Replies, Moderation
  }
}

' Databases
database "User DB" as UserDB #98FB98
database "Content DB" as ContentDB #98FB98
database "Media DB" as MediaDB #98FB98
database "Cat/Tag DB" as CatTagDB #98FB98
database "Comment DB" as CommentDB #98FB98

' Connections for Microservices
UserSvc --> UserDB #228B22
ContentSvc --> ContentDB #228B22
MediaSvc --> MediaDB #228B22
CatTagSvc --> CatTagDB #228B22
CommentSvc --> CommentDB #228B22

APIGateway --> UserSvc #4682B4
APIGateway --> ContentSvc #4682B4
APIGateway --> MediaSvc #4682B4
APIGateway --> CatTagSvc #4682B4
APIGateway --> CommentSvc #4682B4

WebApp --> APIGateway #4682B4
Browser --> WebApp #B8860B
User --> Browser #B8860B

' CI/CD Pipeline
folder "CI/CD Pipeline" #ADD8E6 {
  component "GitHub Repo" as GitRepo #E6F3FF {
    note right: Source Code (Python, Terraform, Ansible, etc.)
  }
  component "CI/CD Tool (e.g., Jenkins)" as CICDTools #E6F3FF

  component "Stage 1: Monitor & Trigger" as Stage1 #E6F3FF
  component "Stage 2: Build & Containerize" as Stage2 #E6F3FF {
    note bottom: Build Docker Images, Push to Registry
  }
  component "Stage 3: Security Scans" as Stage3 #E6F3FF {
    note bottom: Vulnerability Scans, Fail on Major Issues, Notify
  }
  component "Stage 4: Deploy to Staging" as Stage4 #E6F3FF {
    note bottom: Update Manifests/Helm, ArgoCD Sync, Smoke Tests
  }
  component "Stage 5: Manual Approval" as Stage5 #E6F3FF
  component "Stage 6: Production Deployment" as Stage6 #E6F3FF {
    note bottom: Canary/Blue-Green, Auto Rollback on Failure
  }

  GitRepo --> Stage1 : Pull Code on Change #4682B4
  Stage1 --> Stage2 #4682B4
  Stage2 --> Stage3 #4682B4
  Stage3 --> Stage4 : If Pass #4682B4
  Stage4 --> Stage5 : If Tests Pass #4682B4
  Stage5 --> Stage6 : On Approval #4682B4
}

' Kubernetes Infrastructure
folder "Kubernetes Infrastructure (Generic, Zero Trust)" #ADD8E6 {
  cloud "Staging Cluster" as StagingK8s #F0E68C {
    note right: ArgoCD for GitOps
    [Pods/Services] as StagingPods
  }
  cloud "Production Cluster" as ProdK8s #F0E68C {
    note right: Canary/Blue-Green, Zero Trust Security
    [Pods/Services] as ProdPods
  }
}

Stage4 --> StagingK8s : Deploy #DAA520
Stage6 --> ProdK8s : Deploy #DAA520

' Monitoring & Logging
component "Prometheus" as Prometheus #E6F3FF {
  note right: Monitor CMS System & K8s Infrastructure
}
component "OpenSearch Stack" as OpenSearch #E6F3FF {
  note right: Log Management for K8s & Apps
}

Prometheus <-- StagingK8s #DAA520
Prometheus <-- ProdK8s #DAA520
Prometheus <-- Microservices : Via Exporters #4682B4

OpenSearch <-- StagingK8s : Logs #DAA520
OpenSearch <-- ProdK8s : Logs #DAA520
OpenSearch <-- Microservices : App Logs #4682B4

' Deliverables
note bottom of GitRepo : Git Repos for Source Code #FFFFE0
note bottom of ProdK8s : Deployment Guide, Justification, Presentation/Demo #FFFFE0

' Security Note
note top of APIGateway : Zero Trust: AuthN/AuthZ, Least Privilege #FFFFE0

@enduml
