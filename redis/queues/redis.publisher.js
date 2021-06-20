const redis = require("redis");
let conf = require('./conf/queue1.json')

const subscriber =redis.createClient({
  host: conf.host,
  port: conf.port,

});

const publisher = redis.createClient({
  host: conf.host,
  port: conf.port,

});


subscriber.on("subscribe", function (channel, count) {
  console.log("sending messages.");


  setInterval(() => {
    publisher.publish(conf.q_name, `message from the publisher...`);
  }, 3000);

});


subscriber.subscribe(conf.q_name);