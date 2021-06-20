const redis = require('redis');
const client = redis.createClient({
    host: 'localhost',
    port: 6379,

});

// queues
const subscriber = redis.createClient({
    host: 'localhost',
    port: 6379,

});
const publisher = redis.createClient({
    host: 'localhost',
    port: 6379,

});
let messageCount = 0;

client.on('connect', err => {
    console.log(`client is connected`)

    console.log('---------------')

   

});
client.on('error', err => {
    console.log('Error ' + err);
});