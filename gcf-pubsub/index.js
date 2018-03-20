'use strict';

const fetch = require('node-fetch');
const config = require('./config');

exports.handle_gcr_events = event => {
  /*
    https://cloud.google.com/functions/docs/writing/background

    ```json
    {
      "event": {
        "context": {
          "eventId": "78938124563234",
          "timestamp": "2018-03-15T21:06:11.814Z",
          "eventType": "google.pubsub.topic.publish",
          "resource": {
            "service": "pubsub.googleapis.com",
            "name": "projects/some-gke-project/topics/gcr",
            "type": "type.googleapis.com/google.pubsub.v1.PubsubMessage"
          }
        },
        "data": {
          "@type": "type.googleapis.com/google.pubsub.v1.PubsubMessage",
          "attributes": {},
          "data": "yJhYp24isdkdksldkekdjffkdsQWeOiJJTlNFUlQiL="
        }
      }
    }
    ```
  */

  const msg = event.data;
  const data = Buffer.from(msg.data, 'base64').toString();

  /*
    https://cloud.google.com/container-registry/docs/configuring-notifications

    ```json
    {
      "data": {
        "action":"INSERT",
        "digest":"gcr.io/some-gke-project/some-image-named@sha256:some-hash",
        "tag":"gcr.io/some-gke-project/some-image-name:some-tag"
      }
    }
    ```

    An action will either be "INSERT" or "DELETE".
  */

  // FIXME
  const url = `${config.brigade_gcr_gateway}/webhook/${config.org}/${config.repo}/${config.commit}`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      gcrContext: event.context,
      imageData: data
    })
  };

  return fetch(url, options)
    .then(res => {
      if (!res.ok) {
        console.error('res status code: ', res.status);
        console.error('res status text: ', res.statusText);

        throw new Error(res.statusText);
      }

      return res.json();
    })
    .then(json => {
      console.log('res json: ', json);
    });
};
