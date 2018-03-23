'use strict';

const fetch = require('node-fetch');
const config = require('./config');

exports.handle_gcr_events = event => {
  /*
    https://cloud.google.com/functions/docs/writing/background

    `event`:

    ```js
    {
      context: {
        eventId: '78938124563234',
        timestamp: '2018-03-15T21:06:11.814Z',
        eventType: 'google.pubsub.topic.publish',
        resource: {
          service: 'pubsub.googleapis.com',
          name: 'projects/some-gke-project/topics/gcr',
          type: 'type.googleapis.com/google.pubsub.v1.PubsubMessage'
        }
      },
      data: {
        '@type': 'type.googleapis.com/google.pubsub.v1.PubsubMessage',
        attributes: {},
        data: 'yJhYp24isdkdksldkekdjffkdsQWeOiJJTlNFUlQiL='
      }
    }
    ```
  */

  const msg = event.data;

  console.log('raw data: ', msg.data);

  const dataJSON = Buffer.from(msg.data, 'base64').toString();

  /*
    https://cloud.google.com/container-registry/docs/configuring-notifications

    `dataJSON`:

    ```json
    {
      "action":"INSERT",
      "digest":"gcr.io/some-gke-project/some-image-named@sha256:some-hash",
      "tag":"gcr.io/some-gke-project/some-image-name:some-tag"
    }
    ```

    An action will either be "INSERT" or "DELETE".
  */

  const data = JSON.parse(dataJSON);
  const [imageName, imageTag] = data.tag.split(':');
  const [, , org, repo] = imageName.split('/');

  if (!imageName || !imageTag || !org || !repo) {
    throw new Error(
      'Invalid Docker Image Name Format. A valid format has the form "gcr.io/GKE_PROJECT/ORG/REPO:TAG"'
    );
  }

  const isProd = /\d.\d.\d/.test(imageTag);
  const env = isProd ? 'production' : 'staging';
  const infraRepo = `${repo}-infra-${env}`;

  console.log('infra repo: ', infraRepo);

  /*
    `commit` is the upstream VCS commit ID (revision). The Brigade GitHub Gateway for example,
    provides the Git commit ID using this property. If it is not provided, it may be interpreted as
    `master`, or the head of the main branch.
  */
  const commit = 'master';
  const url = `${config.brigade_gcr_gateway}/webhook/${org}/${infraRepo}/${commit}`;

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

        throw new Error(res.status === 404 ? 'Brigade Project Not Found' : res.statusText);
      }

      return res.json();
    })
    .then(json => {
      console.log('res json: ', json);
    });
};
