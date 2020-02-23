'use strict';

module.exports = function(server, toolbox){

    require('./demo')(server, toolbox);
    require('./telegram')(server, toolbox);
}