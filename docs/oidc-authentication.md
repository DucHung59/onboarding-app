## 🔐 OpenID Connect (OIDC) / Authentication Setup

### 1. Cấu hình OIDC Provider

Ứng dụng sử dụng OIDC provider tại `https://id-dev.mindx.edu.vn`. Bạn cần:

1. **Đăng ký Client Application** trên OIDC provider với:
   - **Client ID**: `mindx-onboarding`
   - **Client Secret**: (lấy từ OIDC provider)
   - **Redirect URI**: `https://your-domain.com/api/auth/callback`
   - **Response Type**: `code`
   - **Grant Type**: `authorization_code`
   - **PKCE**: Enabled (code_challenge_method: S256)

2. **Scopes**: `openid profile email`.

### 2. Backend Environment Variables

Các biến môi trường cần thiết trong backend:

```env
OIDC_ISSUER=https://id-dev.mindx.edu.vn
CLIENT_ID=mindx-onboarding
CLIENT_SECRET=<your-client-secret>
REDIRECT_URI=https://your-domain.com/api/auth/callback
POST_LOGIN_REDIRECT=https://your-domain.com/
SESSION_SECRET=<random-secret-for-session-encryption>
CORS_ORIGIN=https://your-frontend-domain.com
```

### 3. Authentication Flow (High-level)

1. User bấm **Login** trên frontend → redirect tới `/api/auth/login`.
2. Backend tạo OIDC authorization URL với state, nonce, code challenge (PKCE) → redirect user đến OIDC provider.
3. User đăng nhập trên OIDC provider → redirect về `/api/auth/callback` với authorization code.
4. Backend đổi code lấy tokens, verify nonce, fetch user info và lưu vào session.
5. Backend redirect về frontend (theo `POST_LOGIN_REDIRECT`).
6. Frontend gọi `/api/auth/me` để kiểm tra trạng thái đăng nhập và lấy thông tin user.

### 4. Các API Authentication chính

- `GET /api/auth/login` – Bắt đầu OIDC login flow.
- `GET /api/auth/callback` – Xử lý callback từ OIDC provider.
- `GET /api/auth/me` – Lấy thông tin user hiện tại từ session.
- `GET /api/auth/check` – Kiểm tra trạng thái đăng nhập.
- `GET /api/auth/logout` – Đăng xuất và destroy session.

### 5. Frontend Integration

- Sử dụng Axios (`src/api/api.ts`) với `baseURL` từ `REACT_APP_API_BASE_URL`.
- Gọi các endpoint `/api/auth/*` với `withCredentials: true` để gửi session cookies.
- Sử dụng `btnLoginOID.tsx` để handle login/logout và `protectedRoute.tsx` để bảo vệ các route cần authentication.


