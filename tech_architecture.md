## 1. 架构设计

```mermaid
flowchart TB
    subgraph Frontend["前端层"]
        A[React Components] --> B[Pages/Routes]
        B --> C[Redux Store]
        C --> D[API Client]
    end
    
    subgraph Backend["后端层"]
        E[Express API] --> F[Controllers]
        F --> G[Services]
        G --> H[Repositories]
    end
    
    subgraph Data["数据层"]
        I[(SQLite)] --> J[Auth DB]
        I --> K[Projects DB]
        I --> L[Community DB]
        I --> M[Achievements DB]
        N[Local Storage] --> O[User Preferences]
    end
    
    subgraph External["外部服务"]
        P[AI API Mock] --> Q[角色锻造]
        P --> R[冲突实验室]
        P --> S[对话润色]
        P --> T[氛围描摹]
    end
    
    D --> E
    H --> I
    G --> P
```

## 2. 技术选型

- **前端框架**: React@18 + TypeScript
- **构建工具**: Vite@6
- **样式**: TailwindCSS@3 + Lucide React Icons
- **状态管理**: Redux Toolkit + Redux Persist
- **路由**: React Router DOM@6
- **图表**: Chart.js + react-chartjs-2
- **动画**: Framer Motion
- **后端**: Express@4 + TypeScript
- **数据库**: SQLite (本地开发) + Prisma ORM
- **认证**: JWT + bcryptjs
- **Mock AI服务**: 本地模拟API

## 3. 路由定义

| 路由 | 用途 | 组件 |
|------|------|------|
| / | 首页仪表盘 | Dashboard |
| /editor/:id | 剧本编辑器 | Editor |
| /characters/:id | 角色锻造室 | CharacterStudio |
| /conflict/:id | 冲突实验室 | ConflictLab |
| /analytics/:id | 数据分析中心 | Analytics |
| /community | 社区广场 | Community |
| /achievements | 成就中心 | Achievements |
| /profile | 用户中心 | Profile |
| /login | 登录页面 | Login |
| /register | 注册页面 | Register |

## 4. API定义

### 4.1 认证接口

```typescript
interface AuthResponse {
  accessToken: string;
  user: User;
}

interface LoginRequest {
  email: string;
  password: string;
}

interface RegisterRequest {
  email: string;
  password: string;
  nickname: string;
}
```

### 4.2 项目接口

```typescript
interface Project {
  id: string;
  title: string;
  genre: 'commercial' | 'artistic' | 'short';
  structure: 'three_act' | 'five_act' | 'save_the_cat' | 'multi_line' | 'short_video';
  status: 'draft' | 'in_progress' | 'completed';
  createdAt: Date;
  updatedAt: Date;
}

interface Scene {
  id: string;
  projectId: string;
  title: string;
  location: 'interior' | 'exterior';
  timeOfDay: string;
  characters: string[];
  content: string;
  order: number;
}
```

### 4.3 角色接口

```typescript
interface Character {
  id: string;
  projectId: string;
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
  backstory: string;
  motivation: string;
  arc: string;
  catchphrase: string;
}

interface CharacterRelationship {
  id: string;
  characterId1: string;
  characterId2: string;
  type: 'friend' | 'enemy' | 'family' | 'lover' | 'colleague';
}
```

### 4.4 AI服务接口

```typescript
interface AICharacterRequest {
  name: string;
  age: number;
  gender: string;
  occupation: string;
  personality: string;
}

interface AICharacterResponse {
  backstory: string;
  motivation: string;
  arc: string;
  catchphrase: string;
}

interface AIDialogRequest {
  text: string;
  style: 'humorous' | 'subtle' | 'powerful' | 'professional';
}

interface AIDialogResponse {
  rewrittenText: string;
}

interface AIAtmosphereRequest {
  keywords: string[];
}

interface AIAtmosphereResponse {
  description: string;
  visualMetaphor: string;
}

interface AIConflictRequest {
  characterIds: string[];
}

interface AIConflictResponse {
  conflicts: string[];
  escalationPath: string[];
}
```

### 4.5 社区接口

```typescript
interface Post {
  id: string;
  userId: string;
  projectId: string;
  title: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}

interface Comment {
  id: string;
  postId: string;
  userId: string;
  content: string;
  isAnonymous: boolean;
  createdAt: Date;
}
```

### 4.6 成就接口

```typescript
interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  condition: string;
  points: number;
}

interface UserAchievement {
  id: string;
  userId: string;
  achievementId: string;
  unlockedAt: Date;
  progress: number;
}
```

## 5. 服务器架构

```mermaid
flowchart LR
    A[Client] --> B[API Gateway]
    B --> C[Auth Controller]
    B --> D[Project Controller]
    B --> E[Character Controller]
    B --> F[AI Controller]
    B --> G[Community Controller]
    B --> H[Achievement Controller]
    
    C --> I[Auth Service]
    D --> J[Project Service]
    E --> K[Character Service]
    F --> L[AI Service]
    G --> M[Community Service]
    H --> N[Achievement Service]
    
    I --> O[User Repository]
    J --> P[Project Repository]
    K --> Q[Character Repository]
    L --> R[AI Mock API]
    M --> S[Post Repository]
    N --> T[Achievement Repository]
    
    O --> U[(Database)]
    P --> U
    Q --> U
    S --> U
    T --> U
```

## 6. 数据模型

### 6.1 ER图

```mermaid
erDiagram
    USER ||--o{ PROJECT : creates
    USER ||--o{ POST : publishes
    USER ||--o{ COMMENT : writes
    USER ||--o{ USER_ACHIEVEMENT : earns
    PROJECT ||--o{ SCENE : contains
    PROJECT ||--o{ CHARACTER : has
    CHARACTER ||--o{ CHARACTER_RELATIONSHIP : relates
    POST ||--o{ COMMENT : has
    ACHIEVEMENT ||--o{ USER_ACHIEVEMENT : unlocked_by
    
    USER {
        string id PK
        string email UK
        string password
        string nickname
        string avatar
        integer points
        datetime createdAt
        datetime updatedAt
    }
    
    PROJECT {
        string id PK
        string userId FK
        string title
        string genre
        string structure
        string status
        integer wordCount
        datetime createdAt
        datetime updatedAt
    }
    
    SCENE {
        string id PK
        string projectId FK
        string title
        string location
        string timeOfDay
        string characters
        string content
        integer order
        datetime createdAt
        datetime updatedAt
    }
    
    CHARACTER {
        string id PK
        string projectId FK
        string name
        integer age
        string gender
        string occupation
        string personality
        string backstory
        string motivation
        string arc
        string catchphrase
        datetime createdAt
        datetime updatedAt
    }
    
    CHARACTER_RELATIONSHIP {
        string id PK
        string characterId1 FK
        string characterId2 FK
        string type
        datetime createdAt
    }
    
    POST {
        string id PK
        string userId FK
        string projectId FK
        string title
        string content
        boolean isAnonymous
        datetime createdAt
        datetime updatedAt
    }
    
    COMMENT {
        string id PK
        string postId FK
        string userId FK
        string content
        boolean isAnonymous
        datetime createdAt
        datetime updatedAt
    }
    
    ACHIEVEMENT {
        string id PK
        string name
        string description
        string icon
        string condition
        integer points
    }
    
    USER_ACHIEVEMENT {
        string id PK
        string userId FK
        string achievementId FK
        datetime unlockedAt
        integer progress
    }
```

## 7. 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   ├── editor/
│   │   ├── dashboard/
│   │   ├── character/
│   │   ├── conflict/
│   │   ├── analytics/
│   │   ├── community/
│   │   └── achievement/
│   ├── pages/
│   ├── store/
│   ├── api/
│   ├── types/
│   ├── utils/
│   └── assets/
├── public/
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
└── tailwind.config.js

backend/
├── src/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── models/
│   ├── middleware/
│   ├── routes/
│   ├── utils/
│   └── server.ts
├── prisma/
├── package.json
├── tsconfig.json
└── .env
```
