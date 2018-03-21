# Google Cloud Function Pub/Sub

In order to be able to send Google Container Registry (GCR) events to the Brigade GCR Gateway, we
need to set up a Pub/Sub topic which will get messages delivered when Docker Images are pushed to and
deleted from the GCR. Additionally we have to deploy a Google Cloud Function (GCF) which is
subscribed to the GCR Pub/Sub topic. The GCF will make an HTTP request to the Brigade GCR Gateway
when a Docker Image is pushed/deleted, which will trigger a Brigade worker that executes a Brigade
Project with the sent payload (`gcrContext` and `imageData`).

Follow the following steps to implement the mentioned workflow:

## 1. Create a GCR Pub/Sub Topic

```
$ gcloud pubsub topics create projects/[PROJECT_ID]/topics/gcr
```

See [configuring notifications](https://cloud.google.com/container-registry/docs/configuring-notifications)
for more information.

## 2. Create a Background Function

Navigate to `gcf-pubsub`:

```
$ cd gcf-pubsub
```

Create a config file:

```
$ touch config.json
```

The config file must contain the following values:

```json
{
  "brigade_gcr_gateway": "https://my-brigade-gcr-gateway.com"
}
```

_Note that it's recommended to NOT store the `config.json` in VCS._

Implement a cloud function in `./index.js`. See [writing background functions](https://cloud.google.com/functions/docs/writing/background) for more information.

## 3. Deploy the Background Function

From the `gcf_pubsub` directory run:

```
$ gcloud beta functions deploy [FUNCTION_NAME] --trigger-resource [PUBSUB_TOPIC_NAME] --trigger-event google.pubsub.topic.publish
```

Where `[FUNCTION_NAME]` is the name of the exported cloud function in `./index.js`, i.e. `exports.handle_gcr_events`.

For example:

```
$ gcloud beta functions deploy handle_gcr_events --trigger-resource gcr --trigger-event google.pubsub.topic.publish
```

See the [pubsub tutorial](https://cloud.google.com/functions/docs/tutorials/pubsub) for more
information.

## Triggering Cloud Functions

The GCF will now trigger when a Docker Image is pushed or deleted, but it can also be triggered
manually:

```
$ gcloud beta pubsub topics publish [PUBSUB_TOPIC_NAME] --message [PAYLOAD]
```

For example:

```
$ gcloud beta pubsub topics publish gcr --message "daniel"
```

_Note that usually the cloud function will expect the message to be `Bas64` encoded._

## Viewing Cloud Function Logs

```
$ gcloud beta functions logs read --limit 50
```

## Deleting Cloud Functions

```
$ gcloud beta functions delete [FUNCTION_NAME]
```

Example:

```
$ gcloud beta functions delete handle_gcr_events
```
