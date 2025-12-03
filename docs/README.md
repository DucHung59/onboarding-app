# 📚 Tài liệu Hướng dẫn

Thư mục này chứa các tài liệu hướng dẫn setup và cấu hình cho Challenger Onboarding App.

## 📋 Danh sách Tài liệu

### 🐳 Container & Deployment

- **[Docker Setup](docker-setup.md)** - Hướng dẫn build và chạy Docker containers cho backend và frontend
- **[Azure Container Registry (ACR) Setup](acr-setup.md)** - Hướng dẫn tạo và sử dụng ACR để lưu trữ Docker images
- **[Azure Kubernetes Service (AKS) Setup](aks-setup.md)** - Hướng dẫn deploy ứng dụng lên AKS cluster

### 🔐 Authentication

- **[OIDC Authentication Setup](oidc-authentication.md)** - Hướng dẫn cấu hình OpenID Connect authentication với MindX Identity Provider

### 📊 Monitoring & Analytics

- **[App Insights Setup](app-insights-setup.md)** - Hướng dẫn thiết lập Azure Application Insights cho backend monitoring
- **[Google Analytics Setup](google-analytics-setup.md)** - Hướng dẫn thiết lập Google Analytics 4 cho frontend tracking

---

## 🚀 Quick Start

### 1. Local Development

1. Xem [Docker Setup](docker-setup.md) để build và chạy containers
2. Xem [OIDC Authentication Setup](oidc-authentication.md) để cấu hình authentication

### 2. Production Deployment

1. Xem [ACR Setup](acr-setup.md) để push images lên Azure Container Registry
2. Xem [AKS Setup](aks-setup.md) để deploy lên Kubernetes cluster
3. Xem [App Insights Setup](app-insights-setup.md) để thiết lập monitoring
4. Xem [Google Analytics Setup](google-analytics-setup.md) để thiết lập analytics

---

## 📝 Ghi chú

- Tất cả các file `.env` đều có file `.env.example` tương ứng để tham khảo
- Các secrets và credentials nên được lưu trữ an toàn (Kubernetes Secrets, Azure Key Vault, etc.)
- Đảm bảo kiểm tra các environment variables trước khi deploy

---

## 🔗 Liên kết hữu ích

- [Azure Portal](https://portal.azure.com)
- [Google Analytics](https://analytics.google.com/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- [Docker Documentation](https://docs.docker.com/)

