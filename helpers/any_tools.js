'use strict';

const https = require('https');

const re = new RegExp('^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$', 'i');

module.exports = {

    postToFunc: function(functionId, data){
        return new Promise((resolve, reject) => {
            const jsonData = JSON.stringify(data);

            const options = {
                hostname: 'europe-west3-geotalki.cloudfunctions.net',
                port: 443,
                path: `/${functionId}`,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': jsonData.length
                }
            }
            
            const req = https.request(options, (res) => {
                // console.log(`statusCode: ${res.statusCode}`);
            
                res.on('data', (bytes) => {
                    resolve(uintToString(bytes));
                    // process.stdout.write(data);
                })
            });
            
            req.on('error', (error) => {
                reject(error);
            });
            req.write(jsonData);
            req.end();
        });
    },

}


function uintToString(uintArray) {
    var encodedString = String.fromCharCode.apply(null, uintArray),
        decodedString = decodeURIComponent(escape(encodedString));
    return decodedString;
}
