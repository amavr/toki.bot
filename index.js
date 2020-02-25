/**
 * Module Dependencies
 */
const https = require('https');
const config = require('./config');
const promise = require('bluebird');
const restify = require('restify');
const restifyPlugins = require('restify-plugins');

/**
  * Initialize Server
  */
const server = restify.createServer({
    name: config.name,
    version: config.version,
});
/**
  * Middleware
  */
server.use(restifyPlugins.jsonBodyParser({ mapParams: true }));
server.use(restifyPlugins.acceptParser(server.acceptable));
server.use(restifyPlugins.queryParser({ mapParams: true }));
server.use(restifyPlugins.fullResponse());


const initOptions = {
    promiseLib: promise // overriding the default (ES6 Promise);
};

const pgp = require('pg-promise')(initOptions);
const toolbox = {
    db: pgp(config.db.uri),
    cfg: config
}


const tools = require('./helpers/any_tools');
const data = {
    chat_id: -461166012
}

tools.postToFunc('sendComplaintToTelegram', data)
    .then(data => {
        console.log(data);
    })
    .catch(error => {
        console.log(error);
    });




// const data = {
//     "actor_id": "5cd109d8-93d3-44c2-a65e-1215c678ddab",
//     "clip_id": "5314eebe-d137-4d43-9283-8c6141ef1e49",
//     "chat_id": 236112196
// };

// const jsonData = JSON.stringify(data);

// const options = {
//     hostname: 'europe-west3-geotalki.cloudfunctions.net',
//     port: 443,
//     path: '/sendComplaintToTelegram',
//     method: 'POST',
//     headers: {
//         'Content-Type': 'application/json',
//         'Content-Length': jsonData.length
//     }
// }

// const req = https.request(options, (res) => {
//     console.log(`statusCode: ${res.statusCode}`);

//     res.on('data', (data) => {
//         process.stdout.write(data);
//     })
// });

// req.on('error', (error) => {console.error(error);});
// req.write(jsonData);
// req.end();


// https://europe-west3-geotalki.cloudfunctions.net/function-1

// const test = require('./test');
// test.loadUsers(toolbox);


/**
  * Start Server, Connect to DB & Require Routes
  */
server.listen(config.port, () => {
    // establish connection to mongodb
    require('./routes')(server, toolbox);
    console.log("Server is listening on port " + config.port);
});