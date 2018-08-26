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
        agendas: "/agedas/",

        animationSpeed: 2000,

        initialLoadDelay: 2500,
        updateInterval: 60 * 60 * 1000, //every 1 hour

    },

    requiresVersion: "2.1.0",

    getStyles: function() {
		return [];
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
        this.fillDateRow(table, this.agendaInfo.date);
        this.fillCourse(table, 'brunch', '**');
        this.fillLunchRow(table);
        this.fillCourse(table, 'snack', '**');
        this.fillNaps(table);
        this.fillWC(table);
        this.fillTeacherNote(table);

        return table;
    },

    fillLogoRow: function(table, agenda){
        var row = document.createElement("tr");
        var cell = document.createElement('td');
        cell.colSpan = 3;
        cell.className = 'bright line ';
        cell.innerHTML = "LOGO";
        row.appendChild(cell);
        table.appendChild(row);
    },

    fillDateRow: function(table, date){
        var row = document.createElement("tr");
        var cell = document.createElement('td');
        cell.colSpan = 3;
        cell.innerHTML = date;
        row.appendChild(cell);
        table.appendChild(row);
    },

    fillLunchRow: function(table){
        this.fillCourse(table, 'first_course', '**');
        this.fillCourse(table, 'second_course', '');
        this.fillCourse(table, 'dessert', '');
    },

    fillCourse: function(table, course, icon){
        var courseRow = document.createElement("tr");
        courseRow.className = 'bright line ';
        this.fillFoodCell(courseRow, icon);
        this.fillFoodCell(courseRow, 'menu.'+course);
        this.fillFoodCell(courseRow, 'entry.'+course);  
        table.appendChild(courseRow);
    },

    fillFoodCell: function(row, foodData){
        var cell = document.createElement('td');
        cell.innerHTML = foodData;
        row.appendChild(cell);
    },

    fillNaps: function(table){
        var row = document.createElement('tr');

        var icon = document.createElement('td');
        icon.innerHTML = 'ZZ';
        row.appendChild(icon);

        var nap = document.createElement('td');
        nap.innerHTML = 'naps[0].start_hours :naps[0].start_minutes - naps[0].finish_hours : naps[0].finish_minutes';
        row.appendChild(nap);

        var napStatus = document.createElement('td');
        nap.innerHTML = ':)';
        row.appendChild(napStatus);

        table.appendChild(row);
    },

    fillWC: function(table){
        var row = document.createElement('tr');

        var icon = document.createElement('td');
        icon.innerHTML='P';

        var diaper = document.createElement('td');
        diaper.innerHTML = 'entry.diaper_urination / entry.diaper_deposition';

        var wc = document.createElement('td');
        wc.innerHTML = 'entry.wc_urination / entry.wc_deposition';

        row.appendChild(icon);
        row.appendChild(diaper);
        row.appendChild(wc);

        table.appendChild(row);
    },

    fillTeacherNote: function(table){
        var row = document.createElement('tr');
        var note = document.createElement('td');
        note.colSpan=3;
        note.innerHTML='entry.note';

        row.appendChild(note);
        table.appendChild(row);
    },


    // printRow: function(table, bus){
    //     var row = document.createElement("tr");
    //     if (this.config.colored && Math.floor(bus.eta/60) <= this.config.warningTime ){
    //         row.className = "near ";
    //     }
    //     table.appendChild(row);
    //     return row;
    // },

    // printIcon: function(row){
    //     var iconCell = document.createElement("td");
	// 	iconCell.className = "bus-icon ";
    //     row.appendChild(iconCell);
    //     var icon = document.createElement("span");
	// 	icon.className = "fas fa-bus";
	// 	iconCell.appendChild(icon);
    // },

    // printLine: function(row, bus){
    //     var lineCell = document.createElement("td");
    //     lineCell.className = "bright line ";
    //     lineCell.innerHTML = bus.line;
    //     row.appendChild(lineCell);
    // },

    // printTime: function(row, bus){
    //     var timeCell = document.createElement("td");
    //     timeCell.className = "bright time ";
    //     timeCell.innerHTML = bus.eta===999999?"+20min":Math.floor(bus.eta/60).toString()+"min";;
    //     row.appendChild(timeCell);
    // },

    // printDistance: function(row, bus){
    //     var km = Math.ceil(bus.distance/1000);
    //     var m = bus.distance%1000;
        
    //     var distanceKmCell = document.createElement("td");
    //     distanceKmCell.className = "align-right ";
    //     distanceKmCell.innerHTML = km;
    //     row.appendChild(distanceKmCell);

    //     var distanceMCell = document.createElement("td");
    //     distanceMCell.className = "align-left ";
    //     distanceMCell.innerHTML = "." + m;
    //     row.appendChild(distanceMCell);;

    //     var kmLabelCell = document.createElement("td");
    //     kmLabelCell.className = "align-center ";
    //     kmLabelCell.innerHTML = "km";
    //     row.appendChild(kmLabelCell);
    // },

    // fadeTable: function(row, buses, currentBus){
    //     if (this.config.fade && this.config.fadePoint < 1) {
    //         if (this.config.fadePoint < 0) {
    //             this.config.fadePoint = 0;
    //         }
    //         var startingPoint = buses.length * this.config.fadePoint;
    //         var steps = buses.length - startingPoint;
    //         if (currentBus >= startingPoint) {
    //             var currentStep = currentBus - startingPoint;
    //             row.style.opacity = 1 - (1 / steps * currentStep);
    //         }
    //     }
    // },

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