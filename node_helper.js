var NodeHelper = require("node_helper");
var logger = require('./lib/logger');
//var request = require('request');
var request = require('request-promise');

var login = function(body){
    console.log(body);
};


module.exports = NodeHelper.create({
    start: function() {
        logger.log(this.name + ' is started!');
    },
    
    socketNotificationReceived: function(notification, payload) {
        logger.log(this.name + ' received a socket notification: ' + notification + ' - Payload: ' + payload);

        request.post({
          form: {guest_code: payload.guest_token},
          url: payload.apiBase+payload.loginGuest,
          jar: true
        }).then(login);


        //this.sendSocketNotification('KMG_UPDATE_CONFIG', {'hello': 'saludo'});
    },
});