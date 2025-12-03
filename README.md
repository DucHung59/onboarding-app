# Challenger Onboarding App

Ứng dụng onboarding với xác thực OpenID Connect (OIDC), được triển khai trên Azure Kubernetes Service (AKS) với Azure Container Registry (ACR).

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Cấu trúc dự án](#cấu-trúc-dự-án)
- [Quick Start - Setup Sau Khi Pull Từ Git](#quick-start---setup-sau-khi-pull-từ-git)
- [Setup Local Development](#setup-local-development)
- [Tài liệu triển khai chi tiết](#tài-liệu-triển-khai-chi-tiết)
- [Deployment tổng quan](#deployment-tổng-quan)

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

## 📚 Tài liệu triển khai chi tiết

Để giữ README gọn và dễ đọc, các hướng dẫn chi tiết đã được tách sang thư mục `docs/`. Xem [docs/README.md](docs/README.md) để có danh sách đầy đủ các tài liệu.

### 🐳 Container & Deployment

- **[Docker Setup](docs/docker-setup.md)** – Build & run container cho backend/frontend, multi-stage build
- **[Azure Container Registry (ACR) Setup](docs/acr-setup.md)** – Tạo ACR, login, build/push image, attach ACR vào AKS
- **[Azure Kubernetes Service (AKS) Setup](docs/aks-setup.md)** – Tạo cluster, cài kubectl, ingress, cert-manager, deploy BE/FE & ingress

### 🔐 Authentication

- **[OIDC Authentication Setup](docs/oidc-authentication.md)** – Cấu hình provider, biến môi trường backend, auth flow, các endpoint liên quan

### 📊 Monitoring & Analytics

- **[App Insights Setup](docs/app-insights-setup.md)** – Thiết lập Azure Application Insights cho backend monitoring
- **[Google Analytics Setup](docs/google-analytics-setup.md)** – Thiết lập Google Analytics 4 cho frontend tracking

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

## 📦 Deployment tổng quan

Chiến lược deployment tổng quát:

1. **Build & Push images lên registry (ACR)**:

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

4. **Rolling Update (nếu cần)**:

```bash
kubectl rollout restart deployment/onboarding-app-be
kubectl rollout restart deployment/onboarding-app-fe
```

Chi tiết hơn cho từng bước (Docker, ACR, AKS, Auth) xem trong thư mục `docs/`.

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

