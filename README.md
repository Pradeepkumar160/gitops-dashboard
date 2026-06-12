# 🚀 GitOps Dashboard 

<div align="center">

![GitOps Dashboard](https://img.shields.io/badge/GitOps-Dashboard-00b8d4?style=for-the-badge&logo=kubernetes&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![MySQL](https://img.shields.io/badge/MySQL-4479A1?style=for-the-badge&logo=mysql&logoColor=white)

**A production-grade GitOps & DevOps observability platform with a dark cyberpunk UI.**  
Monitor CI/CD pipelines, Kubernetes deployments, Helm releases, secrets, and metrics — all in one place.

[Features](#-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Screenshots](#-screenshots) • [Project Structure](#-project-structure)

</div>

---

## ✨ Features

| Page | Description |
|------|-------------|
| 📊 **Dashboard** | Real-time summary — pipeline stats, environment health, recent activity |
| ⎇ **CI/CD Pipeline** | GitHub Actions pipeline runs with per-stage status (Build → Test → Dockerize → Push → Deploy) |
| ⊞ **Environments** | Kubernetes namespace view — Dev / Staging / Production with replica & sync status |
| ⎈ **Helm Charts** | Helm release management across namespaces with version & revision tracking |
| 🔒 **Secrets** | Sealed Secrets metadata viewer with rotation age warnings (never shows raw values) |
| 📈 **Monitoring** | CPU, memory, request rate & error rate metrics per namespace |
| 📋 **Config Viewer** | Split-pane YAML viewer for Kubernetes manifests (ConfigMaps, Ingress, HPA) |
| ⟳ **Pipeline History** | Full tabular history of all pipeline executions with stats |

---

## 🛠 Tech Stack

**Frontend**
- React 18 + TypeScript
- Vite (dev server + build)
- Tailwind CSS + shadcn/ui
- tRPC client (type-safe API calls)
- Wouter (lightweight routing)
- Recharts (monitoring graphs)

**Backend**
- Node.js + TypeScript
- tRPC server (end-to-end type safety)
- Drizzle ORM
- MySQL (via Docker or local)
- tsx (TypeScript execution)

**Infrastructure**
- Docker + Docker Compose
- Drizzle Kit (schema migrations)
- Monorepo structure (client / server / shared)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm
- (Optional) Docker — for the MySQL database

### 1. Clone the repo

```bash
git clone https://github.com/Pradeepkumar160/gitops-dashboard.git
cd gitops-dashboard
```

### 2. Install dependencies

```bash
# Root dependencies (includes drizzle-orm)
npm install

# Server dependencies
cd server && npm install && cd ..

# Client dependencies
cd client && npm install && cd ..
```

### 3. Start the backend

```bash
cd server
npx tsx watch src/index.ts
```

Server runs at **http://localhost:3001** in demo mode (no database required).

### 4. Start the frontend (new terminal)

```bash
cd client
npx vite
```

Frontend runs at **http://localhost:5173**

---

## 🗄 Database Setup (Optional)

The app works in **demo mode** without a database. To connect a real MySQL database:

**Using Docker:**
```bash
docker run -d \
  -p 3306:3306 \
  -e MYSQL_ROOT_PASSWORD=pass \
  -e MYSQL_DATABASE=gitops \
  mysql:8
```

**Configure the server:**

Edit `server/.env`:
```env
DATABASE_URL=mysql://root:pass@localhost:3306/gitops
```

**Run migrations:**
```bash
cd server
npx drizzle-kit push
```

Restart the server — real data will now flow through all pages.

---

## 📁 Project Structure

```
gitops-dashboard/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   └── ui/          # shadcn/ui base components
│   │   ├── pages/           # 8 dashboard pages
│   │   ├── hooks/           # Auth & custom hooks
│   │   ├── lib/             # tRPC client config
│   │   └── contexts/        # Theme context
│   ├── tailwind.config.js
│   └── vite.config.ts
│
├── server/                  # Node.js backend (tRPC)
│   └── src/
│       ├── _core/           # tRPC setup, env, cookies
│       ├── routers.ts       # All tRPC routers
│       ├── db.ts            # Drizzle ORM config
│       └── index.ts         # Express server entry
│
├── drizzle/                 # DB schema & migrations
│   ├── schema.ts
│   └── migrations/
│
├── shared/                  # Shared constants
└── package.json             # Root workspace
```

---

## 🔐 Demo Mode

When no database is configured, the server starts in **demo mode**:
- All tRPC endpoints return empty arrays
- The full UI is navigable with no errors
- Perfect for UI development or portfolio demos

---

## 🤝 Contributing

Pull requests are welcome! For major changes, open an issue first.

1. Fork the repo
2. Create your branch: `git checkout -b feat/your-feature`
3. Commit: `git commit -m "feat: add your feature"`
4. Push: `git push origin feat/your-feature`
5. Open a Pull Request

---

## 📄 License

MIT © [Pradeep Kumar](https://github.com/Pradeepkumar160)

---

<div align="center">
  <b>⭐ Star this repo if you found it useful!</b><br/>
  Made with 💙 by <a href="https://github.com/Pradeepkumar160">Pradeep Kumar</a>
</div>
