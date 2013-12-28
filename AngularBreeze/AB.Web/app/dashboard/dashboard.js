﻿(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.attendeeCount = 0;
        vm.speakerCount = 0;
        vm.sessionCount = 0;
        vm.content = {
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            title: 'Content',
            tracks: []
        };
        vm.map = {
           title: 'Location'     
        };
        vm.speakers = {
            interval: 5000,
            list: [],
            title: 'Top Spakers'
        };
        vm.news = {
            title: 'Hot Towel Angular',
            description: 'Hot Towel Angular is a SPA template for Angular developers.'
        };
        vm.title = 'Dashboard';

        activate();

        function activate() {
            getTopSpeakers(); // as this method gets local data we don't need promises
            var promises = [getAttendeeCount(), getSessionCount(), getSpeakerCount(), getTrackCounts()];
            common.activateController(promises, controllerId)
                .then(function () { log('Activated Dashboard View'); });
        }

        function getAttendeeCount() {
            return datacontext.attendee.getCount()
                .then(function (data) {
                    return vm.attendeeCount = data;
            });
        }
        
        function getSessionCount() {
            return datacontext.session.getCount()
                .then(function (data) {
                    return vm.sessionCount = data;
                });
        }

        function getTrackCounts() {
            return datacontext.session.getTrackCounts()
                .then(function (data) {
                    return vm.content.tracks = data;
                });
        }

        function getTopSpeakers() {
            vm.speakers.list = datacontext.speaker.getTopLocal();
        }
        
        function getSpeakerCount() {
            var speakers = datacontext.speaker.getAllLocal();
            vm.speakerCount = speakers.length;
        }

        function setContentSort(prop) {
            vm.content.predicate = prop;
            vm.content.reverse = !vm.content.reverse;
        }
    }
})();