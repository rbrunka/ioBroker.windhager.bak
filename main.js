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

    var ip = adapter.config.ip;
    var login = adapter.config.login;
    var password = admin.config.password;

    adapter.log.info('config IP: '    + adapter.config.ip);
    adapter.log.info('config login: '    + adapter.config.login);
    adapter.log.info('config password: ' + adapter.config.password);

}
