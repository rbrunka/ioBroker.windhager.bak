/* jshint -W097 */// jshint strict:false
/*jslint node: true */
'use strict';

const utils =    require(__dirname + '/lib/utils'); // Get common adapter utils
var request = require('request');

const adapter = new utils.Adapter('windhager');

adapter.on('ready', function () {
    main();
});

/*
Winddhager RestAPI:
http://%kessel-ip/api-docs - Documentation
http://%kessel-ip/api/1.0/datapoint/{subnetId}/{nodeId}/{fctId}/{groupId}/{memberId}/{varInst} - single Datapoint object with all its details (read-write)
http://%kessel-ip/api/1.0/datapoints - retrieve one OID or a list of OID's
http://%kessel-ip/api/1.0/lookup/{subnetId}/{nodeId}/{fctId}/{levelId}/{position} - single Datapointobject with all its details (read)
http://%kessel-ip/api/1.0/info/{id} - retrieve id info
http://%kessel-ip/api/1.0/nodes - list all actual nodes
http://%kessel-ip/api/1.0/object - retrieve one OID or a list of OID's
*/

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
        adapter.log.error('Code: ' + response.statusCode);
        adapter.log.error('Error:' + error);
        adapter.log.error('Body:' + body)
    }});

    setTimeout(function() {
        adapter.stop();
    }, 10000);
}
