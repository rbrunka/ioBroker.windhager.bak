/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');

const adapter = new utils.Adapter('windhager');

adapter.on('ready', function () {
    main();
});

function main() {

    var connOptions = {
        uri:'http://' + adapter.config.ip + '/api/1.0/lookup/1/15/0/115/0',
        auth: {
            user: adapter.config.login,
            pass: adapter.config.password,
            sendImmediately: false
        },
        json: true
    };

    adapter.log.info('config IP: '    + adapter.config.ip);
    adapter.log.debug('config login: '    + adapter.config.login);
    adapter.log.debug('config password: ' + adapter.config.password);

    request(connOptions, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            adapter.log.info('Body: ' + body)
        }
    else {
        adapter.log.debug('Code: ' + response.statusCode);
        adapter.log.debug('Error:' + error);
        adapter.log.debug('Body:' + body)
    }});

    setTimeout(function() {
        adapter.stop();
    }, 10000);
}
