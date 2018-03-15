# Create Pub/Sub Topic

https://cloud.google.com/container-registry/docs/configuring-notifications

```
$ gcloud pubsub topics create projects/[PROJECT_ID]/topics/gcr
```

# Create Background Function

https://cloud.google.com/functions/docs/writing/background

Implement a cloud function in `./index.js`.

# Deploy Function

https://cloud.google.com/functions/docs/tutorials/pubsub

From the `gcf_pubsub` directory run:

```
$ gcloud beta functions deploy [FUNCTION_NAME] --trigger-resource [PUBSUB_TOPIC_NAME] --trigger-event google.pubsub.topic.publish
```

Where `[FUNCTION_NAME]` is the name of the exported cloud function in `./index.js`, i.e. `exports.handle_gcr_events`.

Example:

```
$ gcloud beta functions deploy handle_gcr_events --trigger-resource gcr --trigger-event google.pubsub.topic.publish
```

# Manual Trigger

```
$ gcloud beta pubsub topics publish [PUBSUB_TOPIC_NAME] --message [PAYLOAD]
```

Example:

```
$ gcloud beta pubsub topics publish gcr --message "daniel"
```

# Logs

```
$ gcloud beta functions logs read --limit 50
```

# Delete

```
$ gcloud beta functions delete [FUNCTION_NAME]
```

Example:

```
$ gcloud beta functions delete handle_gcr_events
```
