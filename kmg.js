/* Magic Mirror
 * Module: emt
 *
 * By Iñaki Reta Sabarrós https://github.com/jirsis
 * MIT Licensed.
 */

Module.register("kmg", {
    defaults: {

        guest_token: "",

        apiBase: "https://kindermygarden.schooltivity.com",
        loginGuest: "/sign-in/guest/",
        agendas: "/agendas/",

        animationSpeed: 2000,

        initialLoadDelay: 2500,
        updateInterval: 60 * 60 * 1000, //every 1 hour

    },

    requiresVersion: "2.1.0",

    getStyles: function() {
		return [
            'kmg.css',
            'icons-embedded.css'
        ];
    },

    getScripts: function () {
		return [
		    'https://use.fontawesome.com/releases/v5.3.1/js/all.js'
		];
    },

    start: function(){
        Log.log("Starting module: " + this.name);
        this.scheduleUpdate(this.config.initialLoadDelay);
        this.loaded = false;
    },

    updateKmg: function(){
        var self = this;
        var urlLogin = this.config.apiBase + this.config.loginGuest;
        urlLogin = "http://localhost:8080/modules/kmg/example.json";
        
        this.agendaInfo = [];
        
        var kmgLoginRequest = new XMLHttpRequest();
        var kmgQuery = new FormData();
        kmgQuery.append('guest_code', this.config.guest_token);
            
        kmgLoginRequest.open("GET", urlLogin, true);
        kmgLoginRequest.onreadystatechange = function() {
            if (this.readyState === 4) {
                var kmgResponse = JSON.parse(this.response);
                self.processKmgAgendaInformation(kmgResponse);
                self.scheduleUpdate(self.config.updateInterval);
            }
        };
        // kmgLoginRequest.send(kmgQuery);
        kmgLoginRequest.send();
    },

    processKmgAgendaInformation: function(agendaData){
        this.agendaInfo = agendaData;
        this.show(this.config.animationSpeed, {lockString:this.identifier});
        this.loaded=true;
        this.updateDom(this.config.animationSpeed);
    },

    getDom: function() {
        var wrapper = document.createElement("div");
        if (this.config.guest_token === "") {
			return this.kmgNotConfigurated(wrapper);
		}
		if (!this.loaded) {
			return this.kmgNotLoaded(wrapper);
        }

        if(this.error){
            wrapper.innerHTML = this.name + ": "+this.error;
            wrapper.className = "dimmed light small";
            this.error = undefined;
		    return wrapper;
        }
        var table = document.createElement("table");
        table.className = "small";
    
        this.fillLogoRow(table, this.agendaInfo);
        this.fillTodayQuote(table, this.agendaInfo);
        //frown grin-beam 
        this.fillCourse(table, this.agendaInfo, 'brunch','icon-milk-box');
        this.fillLunchRow(table, this.agendaInfo);
        this.fillCourse(table, this.agendaInfo, 'snack', 'icon-sandwich');
        this.fillNaps(table, this.agendaInfo.entry.naps[0]);
        this.fillWC(table, this.agendaInfo);
        this.fillTeacherNote(table, this.agendaInfo);

        return table;
    },

    fillLogoRow: function(table, agenda){
        var row = document.createElement('tr');
        var cell = document.createElement('td');
        var img = document.createElement('img');

        cell.colSpan = 5;
        img.src = '/modules/kmg/logo-full.png';
        img.width = 200;
        cell.appendChild(img);
        row.appendChild(cell);
        table.appendChild(row);
    },

    fillTodayQuote: function(table, agendaInfo){
        var row = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 5;
        td.align = 'center';

        var activity = document.createElement('span');
        activity.innerHTML = agendaInfo.agenda.today;
        td.appendChild(activity);

        var extraSpace = document.createElement('span');
        extraSpace.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;';
        td.appendChild(extraSpace);

        var date = document.createElement('span');
        date.innerHTML = moment(agendaInfo.date).format('DD MMM YYYY');
        td.appendChild(date);

        row.appendChild(td);
        table.appendChild(row);
    },

    fillLunchRow: function(table, agenda){
        this.fillCourse(table, agenda, 'first_course', 'icon-main-course');
        this.fillCourse(table, agenda, 'second_course', 'icon-second-course');
        this.fillCourse(table, agenda, 'dessert', 'icon-apple');
    },

    fillCourse: function(table, agenda, course, icon){
        var courseRow = document.createElement("tr");
        courseRow.className = 'bright ';
        this.fillFoodIcon(courseRow, icon, 1, 'left');
        this.fillFoodCell(courseRow, agenda['menu'][course], 3, 'right');
        this.fillFoodQuality(courseRow, agenda['entry'][course]);  
        table.appendChild(courseRow);
    },

    fillFoodCell: function(row, foodData, span, align){
        var cell = document.createElement('td');
        cell.colSpan = span;
        cell.className = ' align-'+align+' ';
        cell.innerHTML = foodData;
        row.appendChild(cell);
    },

    fillFoodIcon: function(row, icon, span, align){
        var cell = document.createElement('td');
        cell.colSpan = span;
        cell.className = ['icon-'+align].join(' ');
        var iconCell = document.createElement('span');
        iconCell.className = icon;
        cell.appendChild(iconCell);
        row.appendChild(cell);
    },

    fillFoodQuality: function(row, foodData){
        var cell = document.createElement('td');
        cell.colSpan = 1;
        cell.className = ' icon-left';

        var span = document.createElement('span');
        span.className = this.mapQuality(foodData);
        
        cell.appendChild(span);
        row.appendChild(cell);
    },

    fillNaps: function(table, nap){
        var row = document.createElement('tr');

        var icon = document.createElement('td');
        icon.className = ' align-left icon-left';
        
        var iconCell = document.createElement('span');
        iconCell.className = 'icon-zzz';
        icon.appendChild(iconCell);
        row.appendChild(icon);

        var napCell = document.createElement('td');
        napCell.className = 'align-right ';
        napCell.colSpan = 3;
        napCell.innerHTML = nap.start_hours + ':' + nap.start_minutes+' - '+
            nap.finish_hours+':'+ nap.finish_minutes;
        row.appendChild(napCell);

        var napStatus = document.createElement('td');
        napStatus.className = 'icon-left';
        napStatus.colSpan = 1;
        var span = document.createElement('span');
        span.className = this.mapQuality(nap.quality);
        napStatus.appendChild(span);
        row.appendChild(napStatus);
        table.appendChild(row);
    },

    fillWC: function(table, agenda){
        var row = document.createElement('tr');
        var td = document.createElement('td');
        td.colSpan = 5;
        td.align = 'center';

        this.fillPee(td, agenda);
        var extraSpace = document.createElement('span');
        extraSpace.innerHTML = '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;-&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'
        td.appendChild(extraSpace);
        this.fillPoo(td, agenda);
        
        row.appendChild(td);
        table.appendChild(row);
    },

    fillPee: function(cell, agenda){
        var pee = document.createElement('span');
        pee.className = 'icon-pee';
        cell.appendChild(pee);

        var peeDiaper = document.createElement('span');
        peeDiaper.className = 'icon-diaper';
        peeDiaper.innerHTML = agenda.entry['diaper_urination'];
        cell.appendChild(peeDiaper);

        var peeWC = document.createElement('span');
        peeWC.className = 'icon-wc';
        peeWC.innerHTML = agenda.entry['wc_urination'];
        cell.appendChild(peeWC);
    },

    fillPoo: function(cell, agenda){
        var poo = document.createElement('span');
        poo.className = 'icon-poo';
        cell.appendChild(poo);

        var pooDiaper = document.createElement('span');
        pooDiaper.className = 'icon-diaper';
        pooDiaper.innerHTML = agenda.entry['diaper_depositions'];
        cell.appendChild(pooDiaper);

        var pooWC = document.createElement('span');
        pooWC.className = 'icon-wc';
        pooWC.innerHTML = agenda.entry['wc_depositions'];
        cell.appendChild(pooWC);
    },

    fillTeacherNote: function(table, agenda){
        var row = document.createElement('tr');
        var note = document.createElement('td');
        var p = document.createElement('p');
        note.colSpan=5;
        note.align = 'center';

        p.innerHTML = agenda.entry.note;

        note.appendChild(p);
        row.appendChild(note);
        table.appendChild(row);
    },

    mapQuality: function(data){
        if(data === 2){
            return 'far fa-laugh-beam';
        } else if (data === -1){
            return 'fas fa-times-circle';
        } else {
            console.log('entry value -> ' + data);
            return 'fas fa-question-circle';
        }
    },

    kmgNotConfigurated: function(wrapper){
        wrapper.innerHTML = "Please set the correct <i>guest token</i> in the config for module: " + this.name + ".";
		wrapper.className = "dimmed light small";
		return wrapper;
    },

    kmgNotLoaded: function(wrapper){
        wrapper.innerHTML = this.name + " "+this.translate("LOADING");
		wrapper.className = "dimmed light small";
		return wrapper;
    },

    scheduleUpdate: function(delay) {
		var nextLoad = this.config.updateInterval;
		if (typeof delay !== "undefined" && delay >= 0) {
			nextLoad = delay;
		}
		var self = this;
		setTimeout(function() {
			self.updateKmg();
		}, nextLoad);
	},

    processEmtInformation: function(emtData){
        for (bus of emtData.arrives){
            Log.info(bus);
            var busInfo = {};
            busInfo.line = bus.lineId;
            busInfo.distance = bus.busDistance;
            busInfo.eta = bus.busTimeLeft;
            this.busesInfo.push(busInfo);
        }
        
        this.show(this.config.animationSpeed, {lockString:this.identifier});
        this.loaded=true;
        this.updateDom(this.config.animationSpeed);
    },

    showError: function(errorDescription){
        this.error = errorDescription;
        Log.info(errorDescription);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "KMG_STOP_EVENTS") {
            Log.log(payload);
        }    
        this.updateDom(this.config.animationSpeed);
    },
});