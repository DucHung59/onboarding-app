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

- Frontend Dockerfile yêu cầu build-time ARG `REACT_APP_API_BASE_URL`.
- Thay thế `https://your-domain.com/api` bằng URL production của backend API.
- Environment variable này được embed vào JavaScript bundle khi build, không thể thay đổi sau khi build xong.

### 4. Attach ACR với AKS

```bash
# Attach ACR to AKS cluster
az aks update -n <your-aks-cluster-name> \
  -g <your-resource-group> \
  --attach-acr <your-acr-name>
```

Điều này cho phép AKS tự động pull images từ ACR mà không cần credentials.


