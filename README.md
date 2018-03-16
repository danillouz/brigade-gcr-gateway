# Brigade GCR Gateway

Brigade Gateway for Google Container Registry.

## Running Locally

```
$ KUBECONFIG="$HOME/.kube/config" NAMESPACE=default go run server.go
```

### Using Helm

```
$ helm install ./charts/brigade-gcr-gateway --set brigade.namespace=staging -n brigade-gcr-gateway
```

Then run:

```
$ minikube service brigade-gcr-gateway
```

This will open the browser, now navigate to `/health` to see if the service is running.

## Endpoints

See the [Service API Blueprint](./service.api) for more information.
