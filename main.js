'use strict';

const utils = require('@iobroker/adapter-core');
const request = require('request');

class Windhager extends utils.Adapter {

    constructor(options) {
        super({
            ...options,
            name: 'windhager',
        });
        this.on('ready', this.onReady.bind(this));
        this.on('objectChange', this.onObjectChange.bind(this));
        this.on('stateChange', this.onStateChange.bind(this));
        this.on('unload', this.onUnload.bind(this));
    }

    async onReady() {
        const self = this;

        const windhagerIp = this.config.ip;
        const windhagerLogin = this.config.login;
        const windhagerPasswd = this.config.password;
        const dataPath = 'datapoints';
        
        this.log.info('Configured address: ' + windhagerIp);
        this.log.debug('Configured login:' + windhagerLogin );
        this.log.debug('Configured password:' + windhagerPasswd);

        await this.setObjectAsync('windhagerTestVariable', {
            type: 'state',
            common: {
                name: 'windhagerTestVariable',
                type: 'boolean',
                role: 'indicator',
                read: true,
                write: true,
            },
            native: {},
        });

        const connOptions = {
            auth: {
                user: windhagerLogin,
                pass: windhagerPasswd,
                sendImmediately: false
            },
            time: true,
            timeout: 4500
        };

        request('http://' + windhagerIp + '/api/1.0/' + dataPath, connOptions, (error, response, body) => {
            if (error || response.statusCode !== 200) {
                self.log.error(error || {statusCode: response.statusCode});
            } else {
                self.log.debug('received data (' + response.statusCode + '): ' + JSON.stringify(body));

                self.setObjectNotExists('responseTime', {
                    type: 'state',
                    common: {
                        name: 'responseTime',
                        type: 'number',
                        role: 'value',
                        unit: 'ms',
                        read: true,
                        write: false
                    },
                    native: {}
                });
                self.setState('responseTime', {val: parseInt(response.timingPhases.total), ack: true});

                var bodyObj = JSON.parse(body);
                for (var i = 0; i < bodyObj.length; i++) {
                    if (typeof bodyObj[i] !== 'undefined') {
                        self.log.debug(bodyObj[i].OID + ' ' + bodyObj[i].value + ' ' + bodyObj[i].unit);
                    }
                }
            }
        });

        setTimeout(this.stop.bind(this), 10000);
    }

    onUnload(callback) {
        try {
            this.log.info('cleaned everything up...');
            callback();
        } catch (e) {
            callback();
        }
    }

    onObjectChange(id, obj) {
        if (obj) {
            this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
        } else {
            this.log.info(`object ${id} deleted`);
        }
    }

    onStateChange(id, state) {
        if (state) {
            this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
        } else {
            this.log.info(`state ${id} deleted`);
        }
    }
}

if (module.parent) {
    module.exports = (options) => new Windhager(options);
} else {
    new Windhager();
}
