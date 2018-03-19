# Brigade GCR Gateway

Brigade Gateway for Google Container Registry.

## Running Locally

```
$ KUBECONFIG="$HOME/.kube/config" NAMESPACE=default go run server.go
```

### Using Helm

_It's recommended that Brigade is installed in it's own namespace, see the [Brigade Security Guide](https://github.com/Azure/brigade/blob/master/docs/topics/security.md) for more information._

```
$ helm install ./charts/brigade-gcr-gateway --namespace brigade --set brigade.namespace=brigade --set rbac.enabled=true -n brigade-gcr-gateway
```

### Minikube

```
$ minikube service brigade-gcr-gateway
```

This will open the browser, now navigate to `/health` to see if the service is running.

## Endpoints

See the [Service API Blueprint](./service.api) for more information.
