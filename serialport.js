const { autoDetect } = require('@serialport/bindings-cpp');

function getPorts(callback) {
    autoDetect().list().then(ports => {
        callback(ports);
    });
}
module.exports = {
    getPorts: getPorts
}