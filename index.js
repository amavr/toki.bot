/**
 * Module Dependencies
 */
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