# Onboarding App Frontend

Frontend React application cho ứng dụng Onboarding với tích hợp OpenID Connect (OIDC) authentication.

## 📋 Mục Lục

- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt Local Development](#cài-đặt-local-development)
- [Development Workflow](#development-workflow)
- [Cấu Trúc Project](#cấu-trúc-project)
- [OIDC Authentication](#oidc-authentication)
- [Build Production](#build-production)
- [Docker Build](#docker-build)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Troubleshooting](#troubleshooting)

---

## 🖥️ Yêu Cầu Hệ Thống

### Prerequisites
- **Node.js**: Version 20.x hoặc cao hơn
- **npm**: Version 9.x hoặc cao hơn
- **Git**: Để clone repository
- **Docker** (tùy chọn): Để build và chạy container

### Kiểm Tra Versions
```bash
node --version    # Nên là v20.x.x
npm --version     # Nên là v9.x.x hoặc cao hơn
```

---

## 🚀 Cài Đặt Local Development

### 1. Clone Repository và Di Chuyển vào Thư Mục

```bash
git clone <repository-url>
cd onboarding-app-fe
```

### 2. Cài Đặt Dependencies

```bash
npm install
```

Lệnh này sẽ cài đặt các dependencies:
- **React 19.x**: UI framework
- **React Router DOM**: Routing
- **Axios**: HTTP client cho API calls
- **Bootstrap & React Bootstrap**: UI components
- **oidc-client-ts**: OpenID Connect client library
- **TypeScript**: Type safety

### 3. Cấu Hình API Base URL

Cập nhật API base URL trong `src/api/api.ts`:

```typescript
const api = axios.create({
  baseURL: 'http://localhost:3000/api', // Development
  // baseURL: 'https://your-domain.com/api', // Production
});
```

### 4. Chạy Development Server

```bash
npm start
```

Ứng dụng sẽ mở tại `http://localhost:3000` (hoặc port khác nếu 3000 đã được sử dụng).

Browser sẽ tự động mở và reload khi bạn thay đổi code.

---

## 💻 Development Workflow

### Available Scripts

#### `npm start`
Chạy ứng dụng ở development mode với hot-reload.
- Mở tại `http://localhost:3000`
- Tự động reload khi có thay đổi
- Hiển thị lỗi lint trong console

#### `npm run build`
Build ứng dụng cho production.
- Tối ưu hóa và minify code
- Tạo thư mục `build/` với static files
- Sẵn sàng để deploy

#### `npm test`
Chạy test suite (nếu có).

#### `npm run eject`
**⚠️ Cảnh báo**: Đây là thao tác một chiều, không thể hoàn tác!

Eject khỏi Create React App để có full control over configuration.

---

## 📁 Cấu Trúc Project

```
onboarding-app-fe/
├── public/                    # Static files
│   ├── index.html            # HTML template
│   └── ...
│
├── src/                      # Source code
│   ├── api/
│   │   └── api.ts           # Axios instance configuration
│   ├── components/
│   │   ├── btnLoginOID.tsx  # OIDC Login/Logout button
│   │   └── protectedRoute.tsx # Route protection component
│   ├── pages/
│   │   ├── Home.tsx         # Home page
│   │   ├── Login.tsx        # Login page
│   │   └── About.tsx        # About page (protected)
│   ├── styles/              # CSS files
│   ├── utils/               # Utility functions
│   ├── App.tsx              # Main App component
│   ├── App.css              # App styles
│   ├── index.tsx            # Entry point
│   └── index.css            # Global styles
│
├── k8s/                     # Kubernetes manifests
│   ├── frontend-deployment.yaml
│   └── frontend-service.yaml
│
├── Dockerfile               # Docker build configuration
├── nginx.conf               # Nginx configuration for SPA
├── package.json             # Dependencies và scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # Documentation này
```

### Giải Thích Các Thư Mục

- **`src/api/`**: Cấu hình Axios client với base URL và interceptors
- **`src/components/`**: Reusable React components
  - `btnLoginOID.tsx`: Component xử lý login/logout với OIDC
  - `protectedRoute.tsx`: Higher-order component để protect routes
- **`src/pages/`**: Page components
  - `Home.tsx`: Trang chủ công khai
  - `Login.tsx`: Trang đăng nhập
  - `About.tsx`: Trang về (yêu cầu authentication)
- **`k8s/`**: Kubernetes deployment manifests
- **`nginx.conf`**: Nginx config để serve React SPA với routing support

---

## 🔐 OIDC Authentication

### Authentication Flow

1. **User clicks Login** → Frontend redirects đến `/api/auth/login`
2. **Backend redirects** đến OIDC provider
3. **User authenticates** trên OIDC provider
4. **OIDC provider redirects** về `/api/auth/callback`
5. **Backend sets session** và redirects về frontend
6. **Frontend checks authentication** status

### Components

#### `btnLoginOID.tsx`
Component hiển thị nút Login/Logout dựa trên authentication status.

```typescript
// Kiểm tra authentication status
api.get("/auth/me", { withCredentials: true })
  .then((res) => {
    setUser(res.data);
  });

// Login: Redirect đến backend OIDC endpoint
const login = () => {
  window.location.href = "api/auth/login";
};

// Logout: Redirect đến backend logout endpoint
const logout = () => {
  window.location.href = "api/auth/logout";
};
```

#### `protectedRoute.tsx`
Component bảo vệ routes, chỉ cho phép authenticated users truy cập.

```typescript
// Kiểm tra authentication
api.get('/auth/check')
  .then(res => {
    setAuthenticated(res.data.loggedIn);
  });

// Redirect đến login nếu chưa authenticated
if (!authenticated) return <Navigate to="/login" replace />;
```

### API Endpoints

Frontend gọi các endpoints sau từ backend:

- `GET /api/auth/me` - Lấy thông tin user hiện tại
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập
- `GET /api/auth/login` - Bắt đầu OIDC login flow
- `GET /api/auth/logout` - Đăng xuất

### CORS Configuration

Đảm bảo backend đã cấu hình CORS để cho phép frontend gọi API:

```typescript
// Backend CORS config
app.use(cors({
  origin: "http://localhost:3000", // Frontend URL
  credentials: true, // Cho phép gửi cookies
}));
```

---

## 🔨 Build Production

### Build Static Files

```bash
npm run build
```

Lệnh này sẽ:
- Compile TypeScript sang JavaScript
- Bundle và minify code
- Optimize assets
- Tạo thư mục `build/` với production-ready files

### Kiểm Tra Build

```bash
# Serve build files locally với serve
npx serve -s build -l 3000
```

Truy cập `http://localhost:3000` để kiểm tra production build.

### Build Output

```
build/
├── static/
│   ├── css/
│   │   └── main.[hash].css
│   └── js/
│       └── main.[hash].js
├── index.html
└── ...
```

---

## 🐳 Docker Build

### Build Docker Image

```bash
docker build -t onboarding-app-fe:latest .
```

### Multi-stage Build

Dockerfile sử dụng multi-stage build:
1. **Stage 1 (build)**: Build React app với Node.js
2. **Stage 2 (production)**: Serve static files với Nginx

### Chạy Container Locally

```bash
docker run -p 80:80 onboarding-app-fe:latest
```

Truy cập `http://localhost` để xem ứng dụng.

### Build với Tag Cụ Thể

```bash
docker build -t onboarding-app-fe:v1.0.0 .
docker build -t onboarding-app-fe:latest .
```

### Nginx Configuration

File `nginx.conf` cấu hình Nginx để:
- Serve static files từ `/usr/share/nginx/html`
- Support React Router với `try_files` directive
- Enable gzip compression
- Cache static assets

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA routing support
    location / {
        try_files $uri /index.html;
    }

    # Cache static assets
    location /static/ {
        expires 1y;
        add_header Cache-Control "public";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/javascript;
}
```

---

## ☸️ Kubernetes Deployment

### Prerequisites

- Kubernetes cluster đang chạy
- `kubectl` đã cấu hình
- Container image đã được build và push lên registry

### 1. Build và Push Image

```bash
# Build image với registry tag
docker build -t <registry>/my-frontend:latest .

# Push image
docker push <registry>/my-frontend:latest
```

### 2. Cập Nhật Deployment

Cập nhật image trong `k8s/frontend-deployment.yaml`:

```yaml
spec:
  template:
    spec:
      containers:
      - name: onboarding-app-fe
        image: <registry>/my-frontend:latest
```

### 3. Deploy

```bash
# Deploy service
kubectl apply -f k8s/frontend-service.yaml

# Deploy deployment
kubectl apply -f k8s/frontend-deployment.yaml
```

### 4. Kiểm Tra Deployment

```bash
# Kiểm tra pods
kubectl get pods -l app=onboarding-app-fe

# Kiểm tra service
kubectl get service onboarding-app-fe-service

# Xem logs
kubectl logs -f deployment/onboarding-app-fe
```

### 5. Update Deployment

```bash
# Update image
kubectl set image deployment/onboarding-app-fe \
  onboarding-app-fe=<new-image>:<tag>

# Hoặc apply lại file đã cập nhật
kubectl apply -f k8s/frontend-deployment.yaml

# Xem rollout status
kubectl rollout status deployment/onboarding-app-fe
```

### Ingress Configuration

Frontend được expose qua Ingress (xem `infra/k8s/ingress.yaml`):

```yaml
# Frontend route
- path: /(.*)
  pathType: ImplementationSpecific
  backend:
    service:
      name: onboarding-app-fe-service
      port:
        number: 80
```

---

## 🔧 Troubleshooting

### Lỗi: "Cannot find module" khi chạy `npm start`

**Nguyên nhân**: Dependencies chưa được cài đặt.

**Giải pháp**:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Lỗi: "Module not found" cho các imports

**Nguyên nhân**: Đường dẫn import không đúng hoặc file không tồn tại.

**Giải pháp**:
- Kiểm tra đường dẫn import
- Đảm bảo file tồn tại
- Kiểm tra `tsconfig.json` paths configuration

### Lỗi: API calls fail với CORS error

**Nguyên nhân**: Backend chưa cấu hình CORS hoặc origin không đúng.

**Giải pháp**:
1. Kiểm tra backend CORS configuration
2. Đảm bảo `credentials: true` trong Axios config
3. Kiểm tra `baseURL` trong `src/api/api.ts`

### Lỗi: "404 Not Found" khi refresh page trong production

**Nguyên nhân**: Server không được cấu hình để support SPA routing.

**Giải pháp**:
- Đảm bảo Nginx config có `try_files $uri /index.html;`
- Kiểm tra `nginx.conf` đã được copy vào Docker image

### Lỗi: Docker build fails ở stage build

**Nguyên nhân**: Node modules không được cài đặt đúng hoặc có lỗi trong code.

**Giải pháp**:
```bash
# Build với verbose output
docker build --progress=plain -t test-build .

# Kiểm tra lỗi TypeScript
npm run build
```

### Lỗi: Pod không start trong Kubernetes

**Nguyên nhân**: Image không tồn tại hoặc pull failed.

**Giải pháp**:
```bash
# Kiểm tra pod events
kubectl describe pod <pod-name>

# Kiểm tra image pull
kubectl get events --sort-by='.lastTimestamp'
```

### Debug Container

```bash
# Chạy container với interactive shell
docker run -it --entrypoint /bin/sh onboarding-app-fe:latest

# Inspect running container
docker exec -it <container-id> /bin/sh

# Xem logs
docker logs <container-id>
```

---

## 📚 Tài Liệu Tham Khảo

- [React Documentation](https://react.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Create React App Documentation](https://create-react-app.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)

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
