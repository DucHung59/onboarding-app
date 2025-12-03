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

### 5. Tạo Kubernetes Secrets cho OIDC

```bash
kubectl create secret generic oidc-secret \
  --from-literal=CLIENT_SECRET="giá_trị_client_secret" \
  --from-literal=SESSION_SECRET="giá_trị_session_secret"
```

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

### 7. Deploy Backend & Frontend

```bash
# Backend
kubectl apply -f onboarding-app-be/k8s/backend-service.yaml
kubectl apply -f onboarding-app-be/k8s/backend-deployment.yaml

# Frontend
kubectl apply -f onboarding-app-fe/k8s/frontend-service.yaml
kubectl apply -f onboarding-app-fe/k8s/frontend-deployment.yaml
```

### 8. Deploy Ingress

Ingress được cấu hình để route:

- `/api/(.*)` → Backend service (onboarding-app-be-service).
- `/(.*)` → Frontend service (onboarding-app-fe-service).

```bash
# Lấy External IP của Ingress Controller
kubectl get service ingress-nginx-controller -n ingress-nginx

# Cập nhật host trong infra/k8s/ingress.yaml với IP hoặc domain của bạn
kubectl apply -f infra/k8s/ingress.yaml
```

### 9. Kiểm tra Deployment

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


