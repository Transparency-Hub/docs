# Transparency Hub Network — Documentation

Built with [Mintlify](https://mintlify.com).

## Local Development

```bash
npm install
npx mintlify dev
```

Opens at `http://localhost:3000`.

## Docker Build (Azure Container Service)

```bash
docker build -t thub-docs .
docker run -p 3000:3000 thub-docs
```

## Deployment

This project is deployed on **Azure Container Apps**. The CI/CD pipeline builds the Docker image and pushes it to Azure Container Registry.

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 3000) |

### Azure CLI Deployment

```bash
# Build and push to ACR
az acr build --registry <acr-name> --image thub-docs:latest .

# Deploy to Container Apps
az containerapp update \
  --name thub-docs \
  --resource-group <resource-group> \
  --image <acr-name>.azurecr.io/thub-docs:latest
```
