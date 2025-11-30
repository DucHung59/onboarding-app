# Challenger Onboarding App

Ứng dụng onboarding với xác thực OpenID Connect (OIDC), được triển khai trên Azure Kubernetes Service (AKS) với Azure Container Registry (ACR).

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Quick Start - Setup Sau Khi Pull Từ Git](#quick-start---setup-sau-khi-pull-từ-git)
- [Setup Local Development](#setup-local-development)
- [Docker Build](#docker-build)
- [Azure Container Registry (ACR) Setup](#azure-container-registry-acr-setup)
- [Azure Kubernetes Service (AKS) Setup](#azure-kubernetes-service-aks-setup)
- [OpenID Connect (OIDC) Setup](#openid-connect-oidc-setup)
- [Deployment](#deployment)

## 🎯 Tổng quan

Dự án bao gồm:
- **Backend API**: Node.js/Express với TypeScript, xử lý xác thực OIDC qua OpenID Connect
- **Frontend**: React với TypeScript, giao diện người dùng với tích hợp OIDC authentication
- **Infrastructure**: Kubernetes manifests cho deployment trên AKS với Ingress routing
- **CI/CD**: Docker images được lưu trữ trên ACR, hỗ trợ multi-stage build

## 📁 Cấu trúc dự án

```
challenger-onboarding-app/
├── onboarding-app-be/          # Backend API
│   ├── src/
│   │   ├── config/
│   │   │   └── oidc.ts        # OIDC client configuration
│   │   ├── routes/
│   │   │   ├── auth.route.ts  # Authentication routes
│   │   │   └── hello.route.ts
│   │   └── index.ts           # Express app entry point
│   ├── k8s/
│   │   ├── backend-deployment.yaml
│   │   └── backend-service.yaml
│   ├── Dockerfile
│   └── package.json
│
├── onboarding-app-fe/          # Frontend React App
│   ├── src/
│   │   ├── api/
│   │   │   └── api.ts         # API client configuration
│   │   ├── components/
│   │   │   ├── btnLoginOID.tsx
│   │   │   └── protectedRoute.tsx
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Login.tsx
│   │   │   └── About.tsx
│   │   └── index.tsx
│   ├── k8s/
│   │   ├── frontend-deployment.yaml
│   │   └── frontend-service.yaml
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
└── infra/
    └── k8s/
        ├── cluster-issuer.yaml  # Cert-manager ClusterIssuer
        └── ingress.yaml         # Ingress configuration
```

## ⚡ Quick Start - Setup Sau Khi Pull Từ Git

Sau khi clone hoặc pull code từ Git, thực hiện các bước sau để setup môi trường local:

### Backend

```bash
cd onboarding-app-be

# 1. Cài đặt dependencies
npm install

# 2. Copy file mẫu và tạo .env
cp env.example .env
# Windows: copy env.example .env

# 3. Chỉnh sửa .env với các giá trị thực tế
# Đặc biệt chú ý: CLIENT_SECRET, SESSION_SECRET, OIDC_ISSUER

# 4. Build và chạy
npm run build
npm run dev
```

### Frontend

```bash
cd onboarding-app-fe

# 1. Cài đặt dependencies
npm install

# 2. Copy file mẫu và tạo .env.local
cp env.example .env.local
# Windows: copy env.example .env.local

# 3. Chỉnh sửa .env.local với API base URL
# REACT_APP_API_BASE_URL=http://localhost:3000/api

# 4. Chạy development server
npm start
```

**Lưu ý quan trọng:**
- File `.env` và `.env.local` **KHÔNG** được commit vào Git (đã có trong `.gitignore`)
- File `env.example` là template, **CÓ THỂ** commit vào Git
- Mỗi developer cần tạo file `.env` riêng với giá trị phù hợp với môi trường của họ
- Production sử dụng environment variables từ Kubernetes secrets, không dùng file `.env`

## 🚀 Setup Local Development

### Yêu cầu

- Node.js 20+
- npm hoặc yarn
- TypeScript

### Backend Setup

1. **Di chuyển vào thư mục backend:**
```bash
cd onboarding-app-be
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Copy file mẫu và tạo file `.env`:**
```bash
cd onboarding-app-be
cp env.example .env
# Hoặc trên Windows: copy env.example .env
```

Sau đó chỉnh sửa file `.env` với các giá trị thực tế:
```env
PORT=3000
OIDC_ISSUER=https://id-dev.mindx.edu.vn
CLIENT_ID=mindx-onboarding
CLIENT_SECRET=your-client-secret-here
REDIRECT_URI=http://localhost:3000/api/auth/callback
POST_LOGIN_REDIRECT=http://localhost:8080
SESSION_SECRET=your-session-secret-here
CORS_ORIGIN=http://localhost:8080
```

4. **Build TypeScript:**
```bash
npm run build
```

5. **Chạy backend (development mode):**
```bash
npm run dev
```

Backend sẽ chạy tại `http://localhost:3000`

### Frontend Setup

1. **Di chuyển vào thư mục frontend:**
```bash
cd onboarding-app-fe
```

2. **Cài đặt dependencies:**
```bash
npm install
```

3. **Copy file mẫu và tạo file `.env.local`:**
```bash
cd onboarding-app-fe
cp env.example .env.local
# Hoặc trên Windows: copy env.example .env.local
```

Sau đó chỉnh sửa file `.env.local` với API base URL:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/
```

**Lưu ý**: URL phải kết thúc bằng dấu `/` để axios hoạt động đúng.

**Lưu ý**: Create React App sử dụng prefix `REACT_APP_` cho environment variables. Code đã tự động đọc từ biến môi trường này.

4. **Chạy frontend:**
```bash
npm start
```

Frontend sẽ chạy tại `http://localhost:8080` (hoặc port khác nếu 8080 đã được sử dụng)

## 🐳 Docker Build

### Backend Docker Build

1. **Build Docker image:**
```bash
cd onboarding-app-be
docker build -t onboarding-app-be:latest .
```

2. **Chạy container:**
```bash
docker run -p 3000:3000 \
  -e PORT=3000 \
  -e OIDC_ISSUER=https://id-dev.mindx.edu.vn \
  -e CLIENT_ID=mindx-onboarding \
  -e CLIENT_SECRET=your-client-secret \
  -e REDIRECT_URI=http://localhost:3000/api/auth/callback \
  -e POST_LOGIN_REDIRECT=http://localhost:8080 \
  -e SESSION_SECRET=your-session-secret \
  onboarding-app-be:latest
```

### Frontend Docker Build

Frontend Dockerfile sử dụng build-time ARG để inject `REACT_APP_API_BASE_URL` vào build process.

1. **Build Docker image với build-time ARG:**
```bash
cd onboarding-app-fe

# Build với API URL cho local development
docker build --build-arg REACT_APP_API_BASE_URL=http://localhost:3000/ -t onboarding-app-fe:latest .

# Hoặc build với API URL cho production
docker build --build-arg REACT_APP_API_BASE_URL=https://your-domain.com/api -t onboarding-app-fe:latest .
```

2. **Chạy container:**
```bash
docker run -p 80:80 onboarding-app-fe:latest
```

Frontend sẽ chạy tại `http://localhost`

**Lưu ý quan trọng**: 
- `REACT_APP_API_BASE_URL` phải được set tại build-time (qua `--build-arg`)
- Environment variable này được embed vào JavaScript bundle khi build
- Không thể thay đổi sau khi build xong

### Multi-stage Build

Cả hai Dockerfile đều sử dụng multi-stage build để tối ưu kích thước image:
- **Backend**: Build TypeScript → Production image với chỉ runtime dependencies
- **Frontend**: Build React app → Nginx image để serve static files

## ☁️ Azure Container Registry (ACR) Setup

### 1. Tạo Azure Container Registry

```bash
# Đăng nhập Azure
az login

# Tạo resource group (nếu chưa có)
az group create --name myResourceGroup --location eastus

# Tạo ACR
az acr create --resource-group myResourceGroup \
  --name <your-acr-name> \
  --sku Basic \
  --admin-enabled true
```

### 2. Đăng nhập vào ACR

```bash
# Đăng nhập vào ACR
az acr login --name <your-acr-name>

# Hoặc sử dụng admin credentials
az acr credential show --name <your-acr-name> --query "passwords[0].value" --output tsv
docker login <your-acr-name>.azurecr.io -u <your-acr-name> -p <password>
```

### 3. Build và Push Images

**Backend:**
```bash
cd onboarding-app-be

# Build image với tag ACR
docker build -t <your-acr-name>.azurecr.io/my-api:latest .

# Push image lên ACR
docker push <your-acr-name>.azurecr.io/my-api:latest
```

**Frontend:**
```bash
cd onboarding-app-fe

# Build image với tag ACR và build-time ARG cho REACT_APP_API_BASE_URL
docker build --build-arg REACT_APP_API_BASE_URL=https://your-domain.com/api -t <your-acr-name>.azurecr.io/my-frontend:latest .

# Push image lên ACR
docker push <your-acr-name>.azurecr.io/my-frontend:latest
```

**Lưu ý quan trọng**: 
- Frontend Dockerfile yêu cầu build-time ARG `REACT_APP_API_BASE_URL`
- Thay thế `https://your-domain.com/api` bằng URL production của backend API
- Environment variable này được embed vào JavaScript bundle khi build, không thể thay đổi sau khi build xong

### 4. Cấu hình ACR với AKS (Attach ACR to AKS)

```bash
# Attach ACR to AKS cluster
az aks update -n <your-aks-cluster-name> \
  -g <your-resource-group> \
  --attach-acr <your-acr-name>
```

Điều này cho phép AKS tự động pull images từ ACR mà không cần credentials.

## ☸️ Azure Kubernetes Service (AKS) Setup

### 1. Tạo AKS Cluster

```bash
# Tạo AKS cluster
az aks create \
  --resource-group myResourceGroup \
  --name myAKSCluster \
  --node-count 2 \
  --enable-addons monitoring \
  --generate-ssh-keys \
  --attach-acr <your-acr-name>
```

### 2. Cài đặt kubectl và kết nối

```bash
# Cài đặt kubectl (nếu chưa có)
az aks install-cli

# Lấy credentials để kết nối với cluster
az aks get-credentials --resource-group myResourceGroup --name myAKSCluster
```

### 3. Cài đặt Ingress Controller (NGINX)

```bash
# Thêm Helm repo
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

# Cài đặt NGINX Ingress Controller
helm install ingress-nginx ingress-nginx/ingress-nginx \
  --namespace ingress-nginx \
  --create-namespace \
  --set controller.service.type=LoadBalancer
```

### 4. Cài đặt Cert-Manager (cho SSL/TLS)

```bash
# Cài đặt cert-manager
kubectl apply -f https://github.com/cert-manager/cert-manager/releases/download/v1.13.0/cert-manager.yaml

# Đợi cert-manager sẵn sàng
kubectl wait --for=condition=ready pod \
  -l app.kubernetes.io/instance=cert-manager \
  -n cert-manager \
  --timeout=300s
```

### 5. Tạo Kubernetes Secrets

Tạo secret sử dụng lệnh `kubectl create secret generic`:

```bash
kubectl create secret generic oidc-secret \
  --from-literal=CLIENT_SECRET="giá_trị_client_secret" \
  --from-literal=SESSION_SECRET="giá_trị_session_secret"
```

**Lưu ý:** Thay thế `giá_trị_client_secret` và `giá_trị_session_secret` bằng các giá trị thực tế của bạn.

Để cập nhật secret sau này:
```bash
kubectl delete secret oidc-secret
kubectl create secret generic oidc-secret \
  --from-literal=CLIENT_SECRET="giá_trị_mới" \
  --from-literal=SESSION_SECRET="giá_trị_mới"
```

### 6. Deploy ClusterIssuer

```bash
kubectl apply -f infra/k8s/cluster-issuer.yaml
```

### 7. Deploy Backend

```bash
# Cập nhật image trong backend-deployment.yaml nếu cần
kubectl apply -f onboarding-app-be/k8s/backend-service.yaml
kubectl apply -f onboarding-app-be/k8s/backend-deployment.yaml
```

### 8. Deploy Frontend

```bash
# Cập nhật image trong frontend-deployment.yaml nếu cần
kubectl apply -f onboarding-app-fe/k8s/frontend-service.yaml
kubectl apply -f onboarding-app-fe/k8s/frontend-deployment.yaml
```

### 9. Deploy Ingress

Ingress được cấu hình để route:
- `/api/(.*)` → Backend service (onboarding-app-be-service)
- `/(.*)` → Frontend service (onboarding-app-fe-service)

```bash
# Lấy External IP của Ingress Controller
kubectl get service ingress-nginx-controller -n ingress-nginx

# Cập nhật host trong ingress.yaml với IP của bạn (hoặc domain)
# File: infra/k8s/ingress.yaml
kubectl apply -f infra/k8s/ingress.yaml
```

**Lưu ý**: 
- Ingress sử dụng path rewrite: `/api/(.*)` được rewrite thành `/$1` khi forward đến backend
- Ví dụ: Request đến `/api/health` sẽ được forward đến backend như `/health`
- Frontend được serve từ root path `/(.*)` để support React Router

### 10. Kiểm tra Deployment

```bash
# Kiểm tra pods
kubectl get pods

# Kiểm tra services
kubectl get services

# Kiểm tra ingress
kubectl get ingress

# Xem logs
kubectl logs -f deployment/onboarding-app-be
kubectl logs -f deployment/onboarding-app-fe
```

## 🔐 OpenID Connect (OIDC) Setup

### 1. Cấu hình OIDC Provider

Ứng dụng sử dụng OIDC provider tại `https://id-dev.mindx.edu.vn`. Bạn cần:

1. **Đăng ký Client Application** trên OIDC provider với:
   - **Client ID**: `mindx-onboarding`
   - **Client Secret**: (lấy từ OIDC provider)
   - **Redirect URI**: `https://your-domain.com/api/auth/callback`
   - **Response Type**: `code`
   - **Grant Type**: `authorization_code`
   - **PKCE**: Enabled (code_challenge_method: S256)

2. **Scopes**: `openid profile email`

### 2. Cấu hình Backend

Các biến môi trường cần thiết trong backend:

```env
OIDC_ISSUER=https://id-dev.mindx.edu.vn
CLIENT_ID=mindx-onboarding
CLIENT_SECRET=<your-client-secret>
REDIRECT_URI=https://your-domain.com/api/auth/callback
POST_LOGIN_REDIRECT=https://your-domain.com/
SESSION_SECRET=<random-secret-for-session-encryption>
```

### 3. Authentication Flow

1. **User clicks login** → Frontend redirects to `/api/auth/login`
2. **Backend generates OIDC authorization URL** với:
   - State (CSRF protection)
   - Nonce (replay attack protection)
   - Code challenge (PKCE)
3. **User authenticates** trên OIDC provider
4. **OIDC provider redirects** về `/api/auth/callback` với authorization code
5. **Backend exchanges code** cho access token và ID token
6. **Backend fetches user info** và lưu vào session
7. **User được redirect** về frontend

### 4. API Endpoints

Backend cung cấp các endpoints sau:

- `GET /health` - Health check endpoint (dùng cho Kubernetes probes)
- `GET /api/auth/login` - Bắt đầu OIDC login flow, redirect đến OIDC provider
- `GET /api/auth/callback` - OIDC callback handler, xử lý authorization code
- `GET /api/auth/me` - Lấy thông tin user hiện tại từ session
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập
- `GET /api/auth/logout` - Đăng xuất và destroy session
- `GET /api/hello` - Example route (có thể xóa trong production)

### 5. Frontend Integration

Frontend sử dụng Axios để gọi API backend. Các component và pages chính:

- **Pages**:
  - `Home.tsx` - Trang chủ, hiển thị trạng thái authentication và nút login/logout
  - `Login.tsx` - Trang đăng nhập
  - `About.tsx` - Trang về (protected route, yêu cầu authentication)

- **Components**:
  - `btnLoginOID.tsx` - Component xử lý login/logout với OIDC
  - `protectedRoute.tsx` - Higher-order component để bảo vệ routes

- **API Client**:
  - `api.ts` - Axios instance được cấu hình với `baseURL` từ `REACT_APP_API_BASE_URL`

## 📦 Deployment

### Workflow Deployment

1. **Build và Push Images:**
```bash
# Backend
cd onboarding-app-be
docker build -t <acr-name>.azurecr.io/my-api:latest .
docker push <acr-name>.azurecr.io/my-api:latest

# Frontend
cd onboarding-app-fe
docker build --build-arg REACT_APP_API_BASE_URL=https://your-domain.com/api -t <acr-name>.azurecr.io/my-frontend:latest .
docker push <acr-name>.azurecr.io/my-frontend:latest
```

**Lưu ý**: Thay thế `https://your-domain.com/api` bằng URL production của backend API.
```

2. **Update Kubernetes Manifests:**
   - Cập nhật image tags trong deployment files nếu cần
   - Cập nhật environment variables nếu cần

3. **Apply Kubernetes Resources:**
```bash
# Secrets (nếu có thay đổi hoặc tạo mới)
kubectl create secret generic oidc-secret \
  --from-literal=CLIENT_SECRET="giá_trị_client_secret" \
  --from-literal=SESSION_SECRET="giá_trị_session_secret" \
  --dry-run=client -o yaml | kubectl apply -f -

# Backend
kubectl apply -f onboarding-app-be/k8s/backend-service.yaml
kubectl apply -f onboarding-app-be/k8s/backend-deployment.yaml

# Frontend
kubectl apply -f onboarding-app-fe/k8s/frontend-service.yaml
kubectl apply -f onboarding-app-fe/k8s/frontend-deployment.yaml

# Ingress
kubectl apply -f infra/k8s/ingress.yaml
```

4. **Rolling Update (nếu cần):**
```bash
kubectl rollout restart deployment/onboarding-app-be
kubectl rollout restart deployment/onboarding-app-fe
```

### Health Checks

Backend có health check endpoint tại `/health` được sử dụng cho:
- **Readiness Probe**: Kiểm tra khi pod sẵn sàng nhận traffic
- **Liveness Probe**: Kiểm tra khi pod còn hoạt động

## 🔧 Troubleshooting

### Backend không kết nối được OIDC

- Kiểm tra biến môi trường `OIDC_ISSUER`, `CLIENT_ID`, `CLIENT_SECRET`
- Kiểm tra `REDIRECT_URI` khớp với cấu hình trên OIDC provider
- Xem logs: `kubectl logs -f deployment/onboarding-app-be`

### Frontend không gọi được API

- Kiểm tra `baseURL` trong `src/api/api.ts`
- Kiểm tra CORS configuration trong backend
- Kiểm tra Ingress routing

### SSL Certificate không được tạo

- Kiểm tra cert-manager đã được cài đặt
- Kiểm tra ClusterIssuer configuration
- Xem cert-manager logs: `kubectl logs -n cert-manager -l app=cert-manager`

### Pods không start

- Kiểm tra image pull: `kubectl describe pod <pod-name>`
- Kiểm tra secrets: `kubectl get secrets`
- Kiểm tra resource limits

## 📝 Notes

- **Session Storage**: Backend sử dụng in-memory session (express-session). Trong production, nên sử dụng Redis hoặc database-backed session store.
- **HTTPS**: Đảm bảo `secure: true` trong session cookie khi deploy production với HTTPS.
- **Secrets**: Không commit secrets vào git. Sử dụng Kubernetes Secrets hoặc Azure Key Vault.

## 📚 Tài liệu tham khảo

- [OpenID Connect Specification](https://openid.net/specs/openid-connect-core-1_0.html)
- [Azure Kubernetes Service Documentation](https://docs.microsoft.com/azure/aks/)
- [Azure Container Registry Documentation](https://docs.microsoft.com/azure/container-registry/)
- [NGINX Ingress Controller](https://kubernetes.github.io/ingress-nginx/)
- [Cert-Manager Documentation](https://cert-manager.io/docs/)

