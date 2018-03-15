'use strict';

exports.handle_gcr_events = event => {
  console.log('event: ', event);

  /*
    event: {
      context: {
        eventId: '78938124563234',
        timestamp: '2018-03-15T21:06:11.814Z',
        eventType: 'google.pubsub.topic.publish',
        resource: {
          service: 'pubsub.googleapis.com',
          name: 'projects/some-project/topics/gcr',
          type: 'type.googleapis.com/google.pubsub.v1.PubsubMessage'
        }
      },
      data: {
        '@type': 'type.googleapis.com/google.pubsub.v1.PubsubMessage',
        attributes: {},
        data: 'yJhYp24isdkdksldkekdjffkdsQWeOiJJTlNFUlQiL='
      }
    }
  */

  const msg = event.data;

  console.log('msg: ', msg);

  /*
    msg: {
      '@type': 'type.googleapis.com/google.pubsub.v1.PubsubMessage',
      attributes: {},
      data: 'yJhYp24isdkdksldkekdjffkdsQWeOiJJTlNFUlQiL='
    }
  */

  const data = msg.data ? Buffer.from(msg.data, 'base64').toString() : '';

  console.log('data: ', data);

  /*
    data: {
      "action":"INSERT",
      "digest":"gcr.io/some-project/hello-world@sha256:a9666ju9c8c59d3eec4998740c4rt642672983c71b65ad5539828f4bfgt62823",
      "tag":"gcr.io/some-project/hello-world:s00vg6u"
    }
  */

  return Promise.resolve();
};
