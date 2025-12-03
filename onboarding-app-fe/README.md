# Onboarding App Frontend

Frontend React application cho ứng dụng Onboarding với tích hợp OpenID Connect (OIDC) authentication.

## 📋 Mục Lục

- [Yêu Cầu Hệ Thống](#yêu-cầu-hệ-thống)
- [Cài Đặt Local Development](#cài-đặt-local-development)
- [Development Workflow](#development-workflow)
- [Cấu Trúc Project](#cấu-trúc-project)
- [OIDC Authentication](#oidc-authentication)
- [Build Production](#build-production)
- [Docker & Deployment (tham khảo docs chung)](#docker--deployment-tham-khảo-docs-chung)
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

### 3. Cấu Hình Environment Variables

**Copy file mẫu và tạo file `.env.local`:**

```bash
# Copy file mẫu
cp env.example .env.local

# Hoặc trên Windows
copy env.example .env.local
```

Sau đó chỉnh sửa file `.env.local` với API base URL của bạn:

```bash
# .env.local
REACT_APP_API_BASE_URL=http://localhost:3000
```

**Lưu ý quan trọng**: 
- Create React App sử dụng prefix `REACT_APP_` cho environment variables.
- URL phải kết thúc bằng dấu `/` để axios hoạt động đúng với baseURL.
- File `.env.local` không được commit vào Git (đã có trong `.gitignore`).
- File `env.example` là template, có thể commit vào Git.
- Trong production, `REACT_APP_API_BASE_URL` phải được set tại build-time qua Docker build ARG (xem phần Docker Build).

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
│   │   └── api.ts           # Axios instance với baseURL từ REACT_APP_API_BASE_URL
│   ├── components/
│   │   ├── btnLoginOID.tsx  # OIDC Login/Logout button component
│   │   └── protectedRoute.tsx # Route protection HOC (Higher-Order Component)
│   ├── pages/
│   │   ├── Home.tsx         # Trang chủ, hiển thị authentication status
│   │   ├── Login.tsx         # Trang đăng nhập
│   │   └── About.tsx         # Trang về (protected route, yêu cầu authentication)
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

1. **User clicks Login** → Frontend redirects đến `/api/auth/login` (backend endpoint)
2. **Backend generates OIDC authorization URL** với PKCE, state, nonce và redirects đến OIDC provider
3. **User authenticates** trên OIDC provider
4. **OIDC provider redirects** về `/api/auth/callback` với authorization code
5. **Backend exchanges code** cho tokens, lấy user info và lưu vào session
6. **Backend redirects** về frontend (POST_LOGIN_REDIRECT)
7. **Frontend checks authentication** status bằng cách gọi `/api/auth/me`

### Components

#### `Home.tsx`
Trang chủ hiển thị trạng thái authentication và nút login/logout. Component này:
- Gọi `/api/auth/me` để kiểm tra authentication status
- Hiển thị thông tin user nếu đã đăng nhập
- Có nút để navigate đến trang About (protected route)

#### `About.tsx`
Trang về hiển thị thông tin user. Trang này:
- Là protected route, chỉ accessible khi đã authenticated
- Lấy thông tin user từ localStorage hoặc gọi API
- Hiển thị email, username, displayName

#### `protectedRoute.tsx`
Higher-Order Component (HOC) bảo vệ routes, chỉ cho phép authenticated users truy cập.

```typescript
// Kiểm tra authentication bằng cách gọi /api/auth/me
api.get("/auth/me", { withCredentials: true })
  .then((res) => {
    if (res.data.authenticated) {
      setAuthenticated(true);
    }
  });

// Redirect đến login nếu chưa authenticated
if (!authenticated) return <Navigate to="/login" replace />;
```

### API Endpoints

Frontend sử dụng Axios instance từ `api.ts` để gọi các endpoints sau từ backend:

- `GET /api/auth/me` - Lấy thông tin user hiện tại từ session
  - Response: `{ authenticated: boolean, user: { email, username, displayName, ... } }`
- `GET /api/auth/check` - Kiểm tra trạng thái đăng nhập
  - Response: `{ loggedIn: boolean, user?: {...} }`
- `GET /api/auth/login` - Bắt đầu OIDC login flow (redirect đến OIDC provider)
- `GET /api/auth/logout` - Đăng xuất và destroy session (redirect về frontend)

**Lưu ý**: 
- Tất cả API calls sử dụng `withCredentials: true` để gửi session cookies
- Base URL được cấu hình trong `api.ts` từ `REACT_APP_API_BASE_URL`

### CORS Configuration

Đảm bảo backend đã cấu hình CORS để cho phép frontend gọi API:

```typescript
// Backend CORS config
app.use(cors({
  origin: process.env.CORS_ORIGIN || "http://localhost:8080", // Frontend URL
  credentials: true, // Cho phép gửi cookies (session)
}));
```

**Lưu ý**: 
- `CORS_ORIGIN` trong backend phải match với frontend URL
- `credentials: true` là bắt buộc để gửi session cookies

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

## 🐳 Docker & Deployment (tham khảo docs chung)

README frontend chỉ tập trung vào cách **phát triển và build FE**; các bước build container, cấu hình ACR/AKS và OIDC chi tiết đã được gom về docs chung ở thư mục root:

- **Docker build & run** (FE/BE): xem `docs/docker-setup.md`.
- **Azure Container Registry (ACR)**: xem `docs/acr-setup.md`.
- **Azure Kubernetes Service (AKS) + Ingress**: xem `docs/aks-setup.md`.
- **OpenID Connect (OIDC) / Authentication**: xem `docs/oidc-authentication.md`.

Khi triển khai thực tế, chỉ cần:

1. Đảm bảo build FE thành công (`npm run build`) và cấu hình `REACT_APP_API_BASE_URL` đúng (local `.env.local` hoặc Docker build arg).
2. Làm theo hướng dẫn Docker + ACR trong docs để build/push image.
3. Deploy manifests trong `onboarding-app-fe/k8s` kết hợp với `infra/k8s` như hướng dẫn trong docs AKS.

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
