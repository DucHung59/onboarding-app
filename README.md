# Challenger Onboarding App

Ứng dụng onboarding với xác thực OpenID Connect (OIDC), được triển khai trên Azure Kubernetes Service (AKS) với Azure Container Registry (ACR).

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Setup Local Development](#setup-local-development)
- [Docker Build](#docker-build)
- [Azure Container Registry (ACR) Setup](#azure-container-registry-acr-setup)
- [Azure Kubernetes Service (AKS) Setup](#azure-kubernetes-service-aks-setup)
- [OpenID Connect (OIDC) Setup](#openid-connect-oidc-setup)
- [Deployment](#deployment)

## 🎯 Tổng quan

Dự án bao gồm:
- **Backend API**: Node.js/Express với TypeScript, xử lý xác thực OIDC
- **Frontend**: React với TypeScript, giao diện người dùng
- **Infrastructure**: Kubernetes manifests cho deployment trên AKS
- **CI/CD**: Docker images được lưu trữ trên ACR

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

3. **Tạo file `.env` trong thư mục `onboarding-app-be/`:**
```env
PORT=3000
OIDC_ISSUER=https://id-dev.mindx.edu.vn
CLIENT_ID=mindx-onboarding
CLIENT_SECRET=your-client-secret-here
REDIRECT_URI=http://localhost:3000/api/auth/callback
POST_LOGIN_REDIRECT=http://localhost:8080
SESSION_SECRET=your-session-secret-here
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

3. **Cập nhật API base URL trong `src/api/api.ts`** (nếu cần):
```typescript
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // hoặc URL backend của bạn
});
```

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

1. **Build Docker image:**
```bash
cd onboarding-app-fe
docker build -t onboarding-app-fe:latest .
```

2. **Chạy container:**
```bash
docker run -p 80:80 onboarding-app-fe:latest
```

Frontend sẽ chạy tại `http://localhost`

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

# Build image với tag ACR
docker build -t <your-acr-name>.azurecr.io/my-frontend:latest .

# Push image lên ACR
docker push <your-acr-name>.azurecr.io/my-frontend:latest
```

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

```bash
# Lấy External IP của Ingress Controller
kubectl get service ingress-nginx-controller -n ingress-nginx

# Cập nhật host trong ingress.yaml với IP của bạn (hoặc domain)
kubectl apply -f infra/k8s/ingress.yaml
```

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

- `GET /api/auth/login` - Bắt đầu OIDC login flow
- `GET /api/auth/callback` - OIDC callback handler
- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập
- `GET /api/auth/logout` - Đăng xuất

### 5. Frontend Integration

Frontend sử dụng `oidc-client-ts` để tích hợp với OIDC. Các component chính:

- `btnLoginOID.tsx` - Nút đăng nhập
- `protectedRoute.tsx` - Route protection middleware

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
docker build -t <acr-name>.azurecr.io/my-frontend:latest .
docker push <acr-name>.azurecr.io/my-frontend:latest
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

