/* Magic Mirror
 * Module: kmg
 *
 * By Iñaki Reta Sabarrós https://github.com/jirsis
 * MIT Licensed.
 */

Module.register('kmg', {
    defaults: {

        guest_token: '',

        animationSpeed: 2000,

        initialLoadDelay: 1000,
        updateInterval: 60*60*1000, //1 check by hour, by default

    },

    requiresVersion: '2.1.0',

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
        Log.log('Starting module: ' + this.name);
        this.socketNotificationReceived('KMG_STARTED', this.config);
        this.loaded = false;
    },

    processKmgAgendaInformation: function(agendaData){
        this.agendaInfo = agendaData;
        this.show(this.config.animationSpeed, {lockString:this.identifier});
        this.loaded=true;
        this.updateDom(this.config.animationSpeed);
    },

    getDom: function() {
        var wrapper = document.createElement('div');
        if (this.config.guest_token === '') {
			return this.kmgNotConfigurated(wrapper);
		}
		if (!this.loaded) {
			return this.kmgNotLoaded(wrapper);
        }

        if(this.error){
            wrapper.innerHTML = this.name + ': '+this.error;
            wrapper.className = 'dimmed light small';
            this.error = undefined;
		    return wrapper;
        }
        var table = document.createElement('table');
        table.className = 'small';
    
        this.fillLogoRow(table, this.agendaInfo);
        this.fillTodayQuote(table, this.agendaInfo);
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
        const startMinutes = nap.start_minutes<10? '0'+nap.start_minutes:nap.start_minutes;
        const endMinutes =  nap.finish_minutes<10? '0'+nap.finish_minutes:nap.finish_minutes;
        napCell.innerHTML = nap.start_hours + ':' + startMinutes +' - '+
            nap.finish_hours+':'+ endMinutes;
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
        extraSpace.innerHTML = '&emsp;&bull;&emsp;'
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
        p.style = 'max-width: 300px';

        note.colSpan=5;
        note.align = 'center';

        if ( agenda.agenda.today ){
            var title = document.createElement('span');
            title.className = 'small-caps';
            title.style = 'font-variant:small-caps';
            title.innerHTML = agenda.agenda.today;
            p.appendChild(title);
        }

        if( agenda.agenda.today && agenda.entry.note ){
            var dash = document.createElement('span');
            dash.innerHTML = '&emsp;&mdash;&emsp;';
            p.appendChild(dash);
        }

        if ( agenda.entry.note ){
            var teacherNote = document.createElement('span');
            teacherNote.innerHTML = agenda.entry.note;
            p.appendChild(teacherNote);
        }

        note.appendChild(p);
        row.appendChild(note);
        table.appendChild(row);
    },

    mapQuality: function(data){
        const mapper = {
            '-1': 'far fa-times-circle', // no
            0: 'far fa-frown-open', // poco
            1: 'far fa-meh', // regular
            2: 'far fa-laugh-beam', // bien
            3: 'far fa-grin-tongue-squint', //repitio
            
            'undefined': 'fas fa-question-circle'
        }
        var quality = mapper[data];
        if (quality === undefined ){
            Logger.log('entry value -> ' + data);
            quality = mapper['undefined'];
        }
        return quality;
    },

    kmgNotConfigurated: function(wrapper){
        wrapper.innerHTML = 'Please set the correct <i>guest token</i> in the config for module: ' + this.name + '.';
		wrapper.className = 'dimmed light small';
		return wrapper;
    },

    kmgNotLoaded: function(wrapper){
        wrapper.innerHTML = this.name + ' '+this.translate('LOADING');
		wrapper.className = 'dimmed light small';
		return wrapper;
    },

    showError: function(errorDescription){
        this.error = errorDescription;
        Log.info(errorDescription);
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === 'KMG_STARTED'){
            this.sendSocketNotification(notification, payload);
        } else if(notification === 'KMG_WAKE_UP'){
            this.processKmgAgendaInformation(payload);
        }
    },
});