var moment = require('moment');

module.exports = {
    log: function(msg) {
        var date = moment().format('\\[HH:mm:ss.SSS DD-MM-YY\\]');
        console.log(date +' [kmg]: '+msg);
    }
}