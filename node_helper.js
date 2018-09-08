var NodeHelper = require("node_helper");
//var request = require('request');
var request = require('request-promise');

module.exports = NodeHelper.create({
    start: function() {
        console.log(this.name + ' is started!');
    },

    main: function(token){
        this.cookies = [];
        return new Promise((resolve, reject) => {
            console.log('.. ' + token);
            resolve({hola: 'saludo '+token});
        });
        return {'hello': 'saludo'};
        // return kmg.loginGuest('bwuPX4VVEsyBH48Y')
        //     .catch(kmg.students)
        //     .then(kmg.entries)
        //     .then(kmg.process)
        //     .then(kmg.logout);
    },
    
    socketNotificationReceived: function(notification, payload) {
        let json = JSON.stringify(payload, null, 2);
        console.log(this.name + ' received a socket notification: ' + notification + ' - Payload: ' + json);
        let self = this;
        this.main(payload.guest_token).then((response) => {
            console.log('r-> '+ JSON.stringify(response, null, 2));
            self.sendSocketNotification('KMG_UPDATE_CONFIG', response);
        });
    }
});