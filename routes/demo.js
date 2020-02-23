'use strict';

const errors = require('restify-errors');

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
}

const sleep = (time) => {
    return new Promise(resolve => {
        setTimeout(() => resolve(), time);
    });
}