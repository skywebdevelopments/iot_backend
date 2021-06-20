const redis = require('redis');
let conf = require('./conf/queue1.json')
fs = require('fs');
let logger = require('../../logger/logger.adapter')


const client = redis.createClient({
  host: conf.host,
  port: conf.port
});

// queues
const subscriber = client
const publisher = client
let messageCount = 0;

subscriber.on("message", function (channel, message) {
  console.log("getting for messages");
  messageCount += 1;

  // logger.log.trace("tracing")
  // logger.log.info("tracing")
  // logger.log.error("tracing")
  // logger.log.warn("tracing")

  console.log("a message recieved");


});
subscriber.subscribe(conf.q_name);