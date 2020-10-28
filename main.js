'use strict';

const utils = require('@iobroker/adapter-core');
const http = require('urllib');

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

        const connOptions = {
            method: 'GET',
            digestAuth: windhagerLogin + ':' + windhagerPasswd,
            dataType: 'json'
        };

        http.request('http://' + windhagerIp + '/api/1.0/' + dataPath, connOptions, function (error, body, response) {
            if (error || response.statusCode !== 200) {
                self.log.error('Error' || {statusCode: response.statusCode});
            } else {
                self.log.debug('received data (' + response.statusCode + '): ' + body);

                self.setObjectNotExistsAsync(dataPath + '.responseTime', {
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
                self.setState(dataPath + '.responseTime', {val: parseInt(response.rt), ack: true});

                self.setObjectNotExistsAsync(dataPath + '.JSON', {
                    type: 'state',
                    common: {
                        name: 'JSON',
                        type: 'json',
                        role: 'text',
                        read: 'true',
                        write: 'false'
                    },
                    native: {}
                });
                self.setState(dataPath + '.JSON', {val: JSON.stringify(body});

                const bodyObj = body;
                var key, subkey, objectID;
                for (let i = 0; i < bodyObj.length; i++) {
                    if (typeof bodyObj[i] !== 'undefined') {
                        self.log.debug(bodyObj[i].OID + ' ' + bodyObj[i].value + ' ' + bodyObj[i].unit);

                        for (key in bodyObj[i]) {
                            if (bodyObj[i].hasOwnProperty(key)) {
                                if (key == 'device') {
                                    for (subkey in bodyObj[i][key]) {
                                        if (objectID[i][key].hasOwnProperty(subkey)) {
                                            self.setObjectNotExistsAsync(dataPath + bodyObj[i].OID.replace(/\//g, '.') + '.' + key + '.' + subkey, {
                                                type: 'state',
                                                common: {
                                                    name: subkey,
                                                    type: 'text',
                                                    role: 'text',
                                                    read: true,
                                                    write: false
                                                },
                                                native: {}
                                            });
                                            self.setState(dataPath + bodyObj[i].OID.replace(/\//g, '.') + '.' + key + '.' + subkey, {val: bodyObj[i][key][subkey], ack: true});
                                        }
                                    }
                                } else {
                                    self.setObjectNotExistsAsync(dataPath + bodyObj[i].OID.replace(/\//g, '.') + '.' + key, {
                                        type: 'state',
                                        common: {
                                            name: key,
                                            type: 'string',
                                            role: 'text',
                                            read: true,
                                            write: false
                                        },
                                        native: {}
                                    });
                                    self.setState(dataPath + bodyObj[i].OID.replace(/\//g, '.') + '.' + key, {val: bodyObj[i][key], ack: true}); 
                                }
                            }
                        }
                    }
                }
            }
        });

        setTimeout(this.stop.bind(this), 30000);
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
