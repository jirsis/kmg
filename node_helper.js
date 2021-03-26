var NodeHelper = require('node_helper');
var request = require('request-promise');
//require('request-debug')(request);

var kmg = {
    baseUrl: 'https://kindermygarden.schooltivity.com', 
    cookies: [],
    kmgResponse: {},
    helper: {},

    config: {},

    log: function(msg){
        if(this.config.debug){
            console.log(msg);
        }
    },
    
    chain: function(email, password, kmg_helper){
        this.helper = kmg_helper;
        this.cookies = [];
        this.kmgResponse = {};
        return this.loginParent(email, password)
            .then(kmg.students)
            .then(kmg.entries)
            .then(kmg.process)
            .then(kmg.logout)
            .then(function(){
                return this.kmgResponse;
            });
    },
    
    loginParent: function(email, password){
        //console.log('login parent: '+kmg.baseUrl+'->'+email);
        return request.post(
            { url: kmg.baseUrl+'/sign-in/parent/',
              form: {email: email, password: password},
              resolveWithFullResponse: true,
              simple: false
            }
        );
    },

    students: function(loginResponse){
        kmg.log('students');    
        const cookiesToSet = loginResponse.headers['set-cookie'];
        
        this.cookies = cookiesToSet
            .filter( (cookie) => { 
                return cookie.split(';')[0];
            });
        return request.get({
            uri: kmg.baseUrl + '/api/parents/students/',
            resolveWithFullResponse: true,
            headers: {
                'Cookie': this.cookies
            }
        });
    },

    entries: function(studentsResponse){
        kmg.log('entries');
        const entriesKindergarden = JSON.parse(studentsResponse.body);
        const studentId = entriesKindergarden[0].id;
        const classroomId = entriesKindergarden[0].classroom_id;
        const uri = `/api/agendas/student/${studentId}/${classroomId}/entries/`;

        return request.get({
            uri: kmg.baseUrl + uri,
            resolveWithFullResponse: true,
            headers: {
                'Cookie': this.cookies
            }
        });
    },

    process: function(entriesResponse){
        kmg.log('process');
        
        return new Promise((resolve, reject) => {
            this.kmgResponse = JSON.parse(entriesResponse.body)[0];
            resolve();
        });
    },

    logout: function(){
        kmg.log('logout');
        kmg.log(this.kmgResponse);
        return request.get({
            uri: kmg.baseUrl + '/logout/',
            resolveWithFullResponse: true,
            headers: {
                'Cookie': this.cookies
            }
        });
    },
}

module.exports = NodeHelper.create({

    start: function() {
        console.log(this.name + ' node_helper is started!');
    },

    updateKindergardenData: function(kmg_config, node_helper){
        console.log('kmg updated: '+new Date());
        kmg.chain(kmg_config.email, kmg_config.password, node_helper)
            .then(function(response){
                node_helper.sendSocketNotification('KMG_WAKE_UP', response);
                setInterval(function update(){  
                    console.log('kmg updated: '+new Date());
                    kmg.chain(kmg_config.email, kmg_config.password, node_helper)
                    .then(function(response){
                        node_helper.sendSocketNotification('KMG_WAKE_UP', response);  
                    });
                }, kmg_config.updateInterval);
            });
    },

    socketNotificationReceived: function(notification, payload) {
        const kmg_nodehelper = this;        
        if ( notification === 'KMG_STARTED' ){

            setTimeout(this.updateKindergardenData, 
                payload.initialLoadDelay, 
                payload,
                kmg_nodehelper);     
        }
    }
});