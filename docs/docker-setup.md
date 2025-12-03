## 🐳 Docker Setup

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

Frontend sẽ chạy tại `http://localhost`.

### Lưu ý & Multi-stage Build

- `REACT_APP_API_BASE_URL` phải được set tại build-time (qua `--build-arg`).
- Environment variable này được embed vào JavaScript bundle khi build và **không thể thay đổi sau khi build xong**.
- Cả hai Dockerfile đều sử dụng multi-stage build để tối ưu kích thước image:
  - **Backend**: Build TypeScript → Production image với chỉ runtime dependencies.
  - **Frontend**: Build React app → Nginx image để serve static files.


