# Onboarding App Backend

API backend cho ứng dụng Onboarding, được xây dựng với Node.js, TypeScript, và Express.

## 📋 Mục Lục

- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt Local Development](#cài-đặt-local-development)
- [Development Workflow](#development-workflow)
- [Build và Test](#build-và-test)
- [Docker Development](#docker-development)
- [Deployment Process](#deployment-process)
- [Kubernetes Deployment với Ingress](#-kubernetes-deployment-với-ingress)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu Cầu Hệ Thống

### Prerequisites
- **Node.js**: Version 20.x hoặc cao hơn
- **npm**: Version 9.x hoặc cao hơn (đi kèm với Node.js)
- **Git**: Để clone repository
- **Docker** (tùy chọn): Để chạy containerized development
- **Azure CLI** (cho Azure deployment): Version 2.50.0 hoặc cao hơn
- **kubectl** (cho Kubernetes deployment): Version 1.24.x hoặc cao hơn

### Kiểm Tra Versions
```bash
node --version    # Nên là v20.x.x
npm --version     # Nên là v9.x.x hoặc cao hơn
git --version
docker --version  # Nếu dùng Docker
az --version      # Nếu deploy lên Azure
kubectl version --client  # Nếu deploy lên Kubernetes
```

---

## 🚀 Cài Đặt Local Development

### 1. Clone Repository
```bash
git clone <repository-url>
cd onboarding-app-be
```

### 2. Cài Đặt Dependencies
```bash
npm install
```

Lệnh này sẽ cài đặt:
- **Dependencies**: `express` và các packages cần thiết cho production
- **DevDependencies**: `typescript`, `ts-node`, `nodemon`, `@types/*` cho development

### 3. Cấu Hình Environment Variables

Tạo file `.env` trong thư mục `onboarding-app-be`:

```bash
# .env
PORT=3000
NODE_ENV=development

# OIDC Configuration
OIDC_ISSUER=https://id-dev.mindx.edu.vn
CLIENT_ID=mindx-onboarding
CLIENT_SECRET=your-client-secret-here
REDIRECT_URI=http://localhost:3000/api/auth/callback
POST_LOGIN_REDIRECT=http://localhost:8080
SESSION_SECRET=your-session-secret-here

# Thêm các biến môi trường khác nếu cần
# DATABASE_URL=...
# API_KEY=...
```

**Lưu ý**: 
- File `.env` không nên được commit vào Git. Đảm bảo nó đã có trong `.gitignore`.
- Thay thế các giá trị OIDC bằng giá trị thực tế từ OIDC provider của bạn.
- `SESSION_SECRET` nên là một chuỗi ngẫu nhiên mạnh (ít nhất 32 ký tự).

### 4. Verify Installation
```bash
# Kiểm tra TypeScript compilation
npm run build

# Chạy ứng dụng
npm start
```

Mở browser và truy cập: `http://localhost:3000/health`

Bạn sẽ thấy response:
```json
{
  "status": "ok"
}
```

---

## 💻 Development Workflow

### Chạy Development Server

Sử dụng nodemon để tự động restart khi có thay đổi:

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:3000` và tự động reload khi bạn sửa code.

### Cấu Trúc Project

```
onboarding-app-be/
├── src/                          # Source code
│   ├── config/
│   │   └── oidc.ts              # OIDC client configuration
│   ├── routes/                   # API routes
│   │   ├── auth.route.ts        # OIDC authentication routes
│   │   └── hello.route.ts       # Example route
│   ├── types/                    # TypeScript type definitions
│   │   └── express-session.d.ts # Session type extensions
│   └── index.ts                  # Entry point của ứng dụng
├── k8s/                          # Kubernetes deployment manifests
│   ├── backend-deployment.yaml  # Deployment configuration
│   └── backend-service.yaml      # Service configuration
├── dist/                         # Compiled JavaScript (generated, không commit)
├── node_modules/                 # Dependencies (không commit)
├── .env                          # Environment variables (không commit)
├── .gitignore                    # Git ignore rules
├── .dockerignore                 # Docker ignore rules
├── package.json                  # Project configuration và dependencies
├── package-lock.json             # Locked dependency versions
├── tsconfig.json                 # TypeScript configuration
├── Dockerfile                    # Docker build configuration
└── README.md                     # Documentation này
```

#### Giải Thích Các Thư Mục và Files

- **`src/`**: Chứa toàn bộ source code TypeScript
  - `index.ts`: Entry point, khởi tạo Express server, cấu hình CORS, session, và routes
  - `config/oidc.ts`: Cấu hình OIDC client với `openid-client` library
  - `routes/`: Chứa các route handlers
    - `auth.route.ts`: OIDC authentication routes (login, callback, logout, me, check)
    - `hello.route.ts`: Example route
  - `types/`: TypeScript type definitions
    - `express-session.d.ts`: Extend Express session types với user info

- **`k8s/`**: Kubernetes manifests cho deployment
  - `backend-deployment.yaml`: Định nghĩa Deployment với pods, replicas, resources, và environment variables
  - `backend-service.yaml`: Định nghĩa Service để expose pods

- **`dist/`**: Thư mục chứa compiled JavaScript từ TypeScript (tự động generate khi chạy `npm run build`)

- **Configuration Files**:
  - `.env`: Environment variables (tạo local, không commit)
  - `.gitignore`: Các file/folder không được track bởi Git
  - `.dockerignore`: Các file/folder không được copy vào Docker image
  - `package.json`: Dependencies, scripts, và metadata của project
  - `tsconfig.json`: TypeScript compiler options
  - `Dockerfile`: Hướng dẫn build Docker image

### Thêm Routes Mới

1. Tạo file route trong `src/routes/`:
```typescript
// src/routes/example.ts
import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Example route' });
});

export default router;
```

2. Import và sử dụng trong `src/index.ts`:
```typescript
import exampleRouter from './routes/example.js';

app.use('/example', exampleRouter);
```

### Code Style và Linting

Project sử dụng TypeScript với strict mode. Đảm bảo:
- Sử dụng TypeScript types cho tất cả functions và variables
- Follow ESLint rules (nếu có)
- Format code với Prettier (nếu có)

---

## 🔐 OIDC Authentication

### Overview

Backend sử dụng OpenID Connect (OIDC) để xác thực users. Implementation sử dụng thư viện `openid-client` với PKCE (Proof Key for Code Exchange) flow.

### Authentication Flow

1. **User clicks login** → Frontend redirects đến `/api/auth/login`
2. **Backend generates OIDC authorization URL** với:
   - State (CSRF protection)
   - Nonce (replay attack protection)
   - Code challenge (PKCE)
3. **User authenticates** trên OIDC provider
4. **OIDC provider redirects** về `/api/auth/callback` với authorization code
5. **Backend exchanges code** cho access token và ID token
6. **Backend fetches user info** và lưu vào session
7. **User được redirect** về frontend

### API Endpoints

#### `GET /api/auth/login`
Bắt đầu OIDC login flow. Redirects user đến OIDC provider.

#### `GET /api/auth/callback`
OIDC callback handler. Xử lý authorization code và tạo session.

**Query Parameters:**
- `code`: Authorization code từ OIDC provider
- `state`: State parameter để verify CSRF

#### `GET /api/auth/me`
Lấy thông tin user hiện tại từ session.

**Response:**
```json
{
  "authenticated": true,
  "user": {
    "sub": "user-id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

#### `GET /api/auth/check`
Kiểm tra trạng thái đăng nhập.

**Response:**
```json
{
  "loggedIn": true,
  "user": { ... }
}
```

#### `GET /api/auth/logout`
Đăng xuất user và destroy session. Redirects về frontend.

### OIDC Configuration

File `src/config/oidc.ts` chứa cấu hình OIDC client:

```typescript
import { Issuer, Client } from "openid-client";

export async function createOidcClient(): Promise<Client> {
  const issuer = await Issuer.discover(process.env.OIDC_ISSUER!);
  
  client = new issuer.Client({
    client_id: process.env.CLIENT_ID!,
    client_secret: process.env.CLIENT_SECRET!,
    redirect_uris: [process.env.REDIRECT_URI!],
    response_types: ["code"]
  });
  
  return client;
}
```

### Session Management

Backend sử dụng `express-session` để quản lý sessions:

```typescript
app.use(session({
  secret: process.env.SESSION_SECRET!,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false, // Set true khi deploy với HTTPS
    httpOnly: true,
  }
}));
```

**Lưu ý**: 
- Trong production với HTTPS, set `secure: true`
- `SESSION_SECRET` nên là một chuỗi ngẫu nhiên mạnh
- Xem xét sử dụng Redis hoặc database-backed session store cho production

### Environment Variables

Các biến môi trường cần thiết cho OIDC:

```bash
OIDC_ISSUER=https://id-dev.mindx.edu.vn        # OIDC provider URL
CLIENT_ID=mindx-onboarding                     # Client ID từ OIDC provider
CLIENT_SECRET=your-client-secret               # Client secret từ OIDC provider
REDIRECT_URI=http://localhost:3000/api/auth/callback  # Callback URL
POST_LOGIN_REDIRECT=http://localhost:8080      # Frontend URL sau khi login
SESSION_SECRET=your-session-secret             # Secret để encrypt session
```

### CORS Configuration

Backend cấu hình CORS để cho phép frontend gọi API:

```typescript
app.use(cors({
  origin: "http://localhost:8080", // Frontend URL
  credentials: true, // Cho phép gửi cookies
}));
```

**Lưu ý**: Cập nhật `origin` trong production để match với frontend domain.

### Security Features

- **PKCE**: Sử dụng code challenge để tăng cường bảo mật
- **State Parameter**: CSRF protection
- **Nonce**: Replay attack protection
- **HttpOnly Cookies**: Session cookies không thể truy cập từ JavaScript
- **Secure Cookies**: (Trong production) Chỉ gửi cookies qua HTTPS

---

## 🔨 Build và Test

### Build Production

Compile TypeScript sang JavaScript:

```bash
npm run build
```

Output sẽ được tạo trong thư mục `dist/`:
```
dist/
├── index.js
└── routes/
    └── hello.js
```

### Chạy Production Build Locally

```bash
# Build trước
npm run build

# Chạy compiled code
node dist/index.js
```

### Testing

Hiện tại project chưa có test setup. Để thêm testing:

```bash
# Cài đặt testing framework (ví dụ: Jest)
npm install --save-dev jest @types/jest ts-jest

# Tạo file jest.config.js
# Thêm script vào package.json: "test": "jest"
```

---

## 🐳 Docker Development

### Build Docker Image

```bash
# Build image
docker build -t onboarding-app-be:latest .

# Hoặc với tag cụ thể
docker build -t onboarding-app-be:v1.0.0 .
```

### Chạy Container Locally

```bash
# Chạy container với port mapping
docker run -p 3000:3000 \
  --env-file .env \
  --name onboarding-api \
  onboarding-app-be:latest

# Hoặc với environment variables trực tiếp
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e NODE_ENV=production \
  --name onboarding-api \
  onboarding-app-be:latest
```

### Docker Development với Volume Mounting

Để development với hot-reload trong Docker:

```bash
# Chạy với volume mount (chỉ dùng cho development)
docker run -p 3000:3000 \
  -v $(pwd):/app \
  -v /app/node_modules \
  --env-file .env \
  --name onboarding-api-dev \
  node:20-alpine sh -c "npm install && npm run dev"
```

### Xem Logs

```bash
# Xem logs của container đang chạy
docker logs onboarding-api

# Follow logs (real-time)
docker logs -f onboarding-api
```

### Stop và Remove Container

```bash
# Stop container
docker stop onboarding-api

# Remove container
docker rm onboarding-api

# Hoặc force remove
docker rm -f onboarding-api
```

---

## 🚢 Deployment Process

### Prerequisites cho Azure Deployment

1. **Azure Account**: Có Azure subscription
2. **Azure CLI**: Đã cài đặt và login
3. **Resource Group**: Đã tạo resource group trên Azure
4. **ACR**: Azure Container Registry đã được tạo

### Step 1: Login Azure và Setup

```bash
# Login vào Azure
az login

# Set subscription (nếu có nhiều subscriptions)
az account set --subscription "<subscription-id>"

# Tạo resource group (nếu chưa có)
az group create --name <resource-group-name> --location eastus
```

### Step 2: Tạo Azure Container Registry (ACR)

```bash
# Tạo ACR
az acr create \
  --resource-group <resource-group-name> \
  --name <acr-name> \
  --sku Basic

# Login vào ACR
az acr login --name <acr-name>
```

### Step 3: Build và Push Image lên ACR

```bash
# Build image với ACR tag
docker build -t <acr-name>.azurecr.io/onboarding-app-be:latest .

# Push image lên ACR
docker push <acr-name>.azurecr.io/onboarding-app-be:latest

# Hoặc sử dụng ACR Tasks để build trực tiếp trên Azure
az acr build \
  --registry <acr-name> \
  --image onboarding-app-be:latest \
  --file Dockerfile .
```

### Step 4: Tạo App Service Plan

```bash
# Tạo App Service Plan (Linux)
az appservice plan create \
  --name <plan-name> \
  --resource-group <resource-group-name> \
  --is-linux \
  --sku B1
```

### Step 5: Tạo Web App

```bash
# Tạo Web App
az webapp create \
  --resource-group <resource-group-name> \
  --plan <plan-name> \
  --name <app-name> \
  --deployment-container-image-name <acr-name>.azurecr.io/onboarding-app-be:latest
```

### Step 6: Configure ACR Integration

```bash
# Enable Managed Identity cho Web App
az webapp identity assign \
  --resource-group <resource-group-name> \
  --name <app-name>

# Grant ACR pull permissions
az role assignment create \
  --assignee <principal-id> \
  --scope /subscriptions/<subscription-id>/resourceGroups/<resource-group-name>/providers/Microsoft.ContainerRegistry/registries/<acr-name> \
  --role AcrPull

# Configure container settings
az webapp config container set \
  --name <app-name> \
  --resource-group <resource-group-name> \
  --docker-custom-image-name <acr-name>.azurecr.io/onboarding-app-be:latest \
  --docker-registry-server-url https://<acr-name>.azurecr.io
```

### Step 7: Configure Environment Variables

```bash
# Set environment variables
az webapp config appsettings set \
  --resource-group <resource-group-name> \
  --name <app-name> \
  --settings \
    PORT=3000 \
    NODE_ENV=production \
    # Thêm các biến môi trường khác
```

### Step 8: Configure Port

```bash
# Set port cho container
az webapp config set \
  --resource-group <resource-group-name> \
  --name <app-name> \
  --linux-fx-version "DOCKER|<acr-name>.azurecr.io/onboarding-app-be:latest"

# Hoặc trong Azure Portal:
# Settings > Configuration > General settings > Always On = On
```

### Step 9: Verify Deployment

```bash
# Xem logs
az webapp log tail \
  --resource-group <resource-group-name> \
  --name <app-name>

# Test health endpoint
curl https://<app-name>.azurewebsites.net/health
```

### Continuous Deployment với GitHub Actions

Tạo file `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy to Azure

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Azure Login
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Build and push to ACR
        run: |
          az acr build \
            --registry ${{ secrets.ACR_NAME }} \
            --image onboarding-app-be:${{ github.sha }} \
            --file onboarding-app-be/Dockerfile \
            onboarding-app-be/
      
      - name: Deploy to Azure Web App
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ secrets.AZURE_WEBAPP_NAME }}
          images: ${{ secrets.ACR_NAME }}.azurecr.io/onboarding-app-be:${{ github.sha }}
```

---

## ☸️ Kubernetes Deployment với Ingress

### Prerequisites cho Kubernetes Deployment

1. **Kubernetes Cluster**: Đã có Kubernetes cluster đang chạy (AKS, EKS, GKE, hoặc local cluster)
2. **kubectl**: Đã cài đặt và cấu hình để kết nối với cluster
3. **NGINX Ingress Controller**: Đã cài đặt trong cluster
4. **Container Image**: Image đã được build và push lên container registry (ACR, Docker Hub, etc.)

### Kiểm Tra Prerequisites

```bash
# Kiểm tra kết nối cluster
kubectl cluster-info

# Kiểm tra NGINX Ingress Controller đã được cài đặt
kubectl get pods -n ingress-nginx

# Kiểm tra ingress class
kubectl get ingressclass
```

### Cấu Trúc Kubernetes Manifests

Xem chi tiết cấu trúc project ở [phần trên](#cấu-trúc-project). Các file Kubernetes manifests nằm trong thư mục `k8s/`:

### Step 1: Cập Nhật Image trong Deployment

Trước khi deploy, cập nhật image trong `backend-deployment.yaml`:

```yaml
# k8s/backend-deployment.yaml
spec:
  template:
    spec:
      containers:
      - name: onboarding-app-be
        image: <your-registry>/onboarding-app-be:latest  # Cập nhật image này
```

### Step 2: Apply Kubernetes Manifests

Deploy các resources theo thứ tự: Deployment → Service → Ingress

```bash
# Apply deployment
kubectl apply -f k8s/backend-deployment.yaml

# Apply service
kubectl apply -f k8s/backend-service.yaml

# Apply ingress
kubectl apply -f k8s/backend-ingress.yaml
```

Hoặc apply tất cả cùng lúc:

```bash
kubectl apply -f k8s/
```

### Step 3: Kiểm Tra Deployment Status

```bash
# Kiểm tra deployment
kubectl get deployment onboarding-app-be

# Kiểm tra pods
kubectl get pods -l app=onboarding-app-be

# Kiểm tra service
kubectl get service onboarding-app-be-service

# Kiểm tra ingress
kubectl get ingress onboarding-app-be-ingress

# Xem chi tiết ingress
kubectl describe ingress onboarding-app-be-ingress
```

### Step 4: Cấu Hình Ingress

#### Ingress Configuration Overview

File `backend-ingress.yaml` cấu hình ingress với các đặc điểm sau:

- **Ingress Class**: Sử dụng NGINX Ingress Controller (`ingressClassName: nginx`)
- **Path Routing**: Route tất cả requests từ `/api/(.*)` đến backend service
- **Path Rewrite**: Sử dụng annotation `nginx.ingress.kubernetes.io/rewrite-target: /$1` để rewrite path
- **Backend Service**: Trỏ đến `onboarding-app-be-service` trên port 80

#### Chi Tiết Cấu Hình Ingress

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: onboarding-app-be-ingress
  namespace: default
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$1
spec:
  ingressClassName: nginx
  rules:
    - http:
        paths:
          - path: /api/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: onboarding-app-be-service
                port:
                  number: 80
```

#### Giải Thích Cấu Hình

1. **Path Pattern**: `/api/(.*)` - Match tất cả requests bắt đầu với `/api/`
2. **Rewrite Target**: `/$1` - Rewrite path bằng cách lấy phần sau `/api/` (capture group `$1`)
   - Ví dụ: Request đến `/api/health` sẽ được forward đến backend như `/health`
3. **Service Port**: Port 80 của service (service này forward đến container port 3000)

#### Tùy Chỉnh Ingress

**Thêm TLS/SSL Certificate:**

```yaml
spec:
  tls:
    - hosts:
        - api.example.com
      secretName: tls-secret
  rules:
    - host: api.example.com
      http:
        paths:
          - path: /api/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: onboarding-app-be-service
                port:
                  number: 80
```

**Thêm Multiple Paths:**

```yaml
spec:
  rules:
    - http:
        paths:
          - path: /api/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: onboarding-app-be-service
                port:
                  number: 80
          - path: /v2/api/(.*)
            pathType: ImplementationSpecific
            backend:
              service:
                name: onboarding-app-be-service
                port:
                  number: 80
```

### Step 5: Truy Cập Application

#### Lấy Ingress IP hoặc Hostname

```bash
# Xem ingress address
kubectl get ingress onboarding-app-be-ingress

# Output sẽ hiển thị ADDRESS (IP hoặc hostname)
# NAME                          CLASS   HOSTS   ADDRESS          PORTS   AGE
# onboarding-app-be-ingress     nginx   *       <IP-ADDRESS>    80      5m
```

#### Test Health Endpoint

```bash
# Nếu ingress có IP address
curl http://<INGRESS-IP>/api/health

# Nếu ingress có hostname
curl http://<INGRESS-HOSTNAME>/api/health

# Hoặc với domain đã cấu hình
curl https://api.example.com/api/health
```

#### Test từ Browser

Mở browser và truy cập:
- `http://<INGRESS-IP>/api/health`
- Hoặc `https://api.example.com/api/health` (nếu có TLS)

### Step 6: Xem Logs và Debug

```bash
# Xem logs của pods
kubectl logs -l app=onboarding-app-be

# Xem logs của ingress controller
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

# Xem events
kubectl get events --sort-by='.lastTimestamp'

# Describe pod để debug
kubectl describe pod <pod-name>
```

### Troubleshooting Kubernetes Deployment

#### Pod không start

```bash
# Kiểm tra pod status
kubectl get pods -l app=onboarding-app-be

# Xem pod logs
kubectl logs <pod-name>

# Xem pod events
kubectl describe pod <pod-name>
```

#### Service không kết nối được

```bash
# Kiểm tra service endpoints
kubectl get endpoints onboarding-app-be-service

# Test service từ trong cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- curl http://onboarding-app-be-service/health
```

#### Ingress không hoạt động

```bash
# Kiểm tra ingress controller
kubectl get pods -n ingress-nginx

# Xem ingress controller logs
kubectl logs -n ingress-nginx -l app.kubernetes.io/component=controller

# Kiểm tra ingress configuration
kubectl describe ingress onboarding-app-be-ingress

# Test ingress từ trong cluster
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- curl http://<INGRESS-IP>/api/health
```

### Update Deployment

```bash
# Update image
kubectl set image deployment/onboarding-app-be onboarding-app-be=<new-image>:<tag>

# Hoặc edit deployment
kubectl edit deployment onboarding-app-be

# Hoặc apply lại file đã cập nhật
kubectl apply -f k8s/backend-deployment.yaml

# Xem rollout status
kubectl rollout status deployment/onboarding-app-be
```

### Rollback Deployment

```bash
# Xem rollout history
kubectl rollout history deployment/onboarding-app-be

# Rollback về version trước
kubectl rollout undo deployment/onboarding-app-be

# Rollback về version cụ thể
kubectl rollout undo deployment/onboarding-app-be --to-revision=<revision-number>
```

### Xóa Resources

```bash
# Xóa tất cả resources
kubectl delete -f k8s/

# Hoặc xóa từng resource
kubectl delete deployment onboarding-app-be
kubectl delete service onboarding-app-be-service
kubectl delete ingress onboarding-app-be-ingress
```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module" khi chạy `npm start`

**Nguyên nhân**: Dependencies chưa được cài đặt hoặc TypeScript chưa compile.

**Giải pháp**:
```bash
# Cài lại dependencies
rm -rf node_modules package-lock.json
npm install

# Build lại
npm run build
```

### Lỗi: "tsc: command not found" hoặc tsc hiển thị help

**Nguyên nhân**: TypeScript không được cài đặt hoặc `tsconfig.json` không được tìm thấy.

**Giải pháp**:
```bash
# Kiểm tra TypeScript đã được cài
npm list typescript

# Nếu chưa có, cài lại
npm install --save-dev typescript

# Kiểm tra tsconfig.json tồn tại
ls -la tsconfig.json

# Chạy tsc với đường dẫn đầy đủ
npx tsc
```

### Lỗi: Port 3000 đã được sử dụng

**Nguyên nhân**: Port 3000 đang được process khác sử dụng.

**Giải pháp**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Hoặc đổi port trong .env
PORT=3001
```

### Lỗi Docker Build: "npm run build" fails

**Nguyên nhân**: `tsconfig.json` không được copy vào container hoặc có lỗi TypeScript.

**Giải pháp**:
1. Kiểm tra `.dockerignore` không loại trừ `tsconfig.json`
2. Kiểm tra `tsconfig.json` có trong build context:
```bash
docker build --no-cache -t test-build .
```

3. Build với verbose output:
```bash
docker build --progress=plain -t test-build .
```

### Lỗi Azure: "Failed to pull image"

**Nguyên nhân**: ACR credentials không đúng hoặc Managed Identity chưa được cấu hình.

**Giải pháp**:
```bash
# Kiểm tra ACR credentials
az acr credential show --name <acr-name>

# Re-configure container settings
az webapp config container set \
  --name <app-name> \
  --resource-group <resource-group-name> \
  --docker-custom-image-name <acr-name>.azurecr.io/onboarding-app-be:latest \
  --docker-registry-server-url https://<acr-name>.azurecr.io \
  --docker-registry-server-user <username> \
  --docker-registry-server-password <password>
```

### Lỗi Azure: Container không start

**Nguyên nhân**: Port không đúng hoặc health check fail.

**Giải pháp**:
1. Kiểm tra port trong Dockerfile: `EXPOSE 3000`
2. Set `WEBSITES_PORT=3000` trong App Settings
3. Kiểm tra logs:
```bash
az webapp log tail --resource-group <rg-name> --name <app-name>
```

### Debug Docker Container

```bash
# Chạy container với interactive shell
docker run -it --entrypoint /bin/sh onboarding-app-be:latest

# Inspect container đang chạy
docker exec -it <container-id> /bin/sh

# Xem container logs
docker logs <container-id>
```

### Xóa và Rebuild Docker Image

```bash
# Xóa image cũ
docker rmi onboarding-app-be:latest

# Rebuild không dùng cache
docker build --no-cache -t onboarding-app-be:latest .

# Xóa tất cả unused images
docker image prune -a
```

---

## 📚 Tài Liệu Tham Khảo

- [Express.js Documentation](https://expressjs.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Docker Documentation](https://docs.docker.com/)
- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/azure/container-registry/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)

---

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📝 License

ISC

