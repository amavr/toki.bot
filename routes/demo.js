'use strict';

const errors = require('restify-errors');
const test = require('../test');

module.exports = function (server, toolbox) {

    server.get('/api/v1/delay', function (req, res, next) {
        res.send({ msg: 'ok' });
        sleep(2000)
            .then(() => {
                console.log('hi!')
            })
            .finally(() => {
                console.log('finally')
            });
        next();
    });

    server.get('/api/v1/db/test', function(req, res, next){
        test.loadUsers(toolbox)
            .then(rows => {
                res.send(200, rows);
            })
            .catch(error => {
                console.log(error);
            });
        next();
    });
}

const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
}