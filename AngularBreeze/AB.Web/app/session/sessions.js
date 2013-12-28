﻿(function () {
    'use strict';

    // Controller name is handy for logging
    var controllerId = 'sessions';

    // Define the controller on the module.
    // Inject the dependencies. 
    // Point to the controller definition function.
    angular.module('app').controller(controllerId,
        ['common', 'datacontext', 'config', '$routeParams', sessions]);

    function sessions(common, datacontext, config, $routeParams) {
        // Using 'Controller As' syntax, so we assign this to the vm variable (for viewmodel).
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        var applyFilter = function() { };

        // Bindable properties and functions are placed on vm.
        vm.filteredSessions = [];
        vm.refresh = refresh;
        vm.sessions = [];
        vm.title = 'Sessions';
        vm.sessionsSearch = $routeParams.search || '';  //$routeParams - get params if are from the url query string
        vm.search = search;
        vm.sessionsFilter = sessionsFilter;

        activate();

        function activate() {
            //TODO get our sessions
            var promises = [getSessions()];
            common.activateController(promises, controllerId)
                .then(function() {
                    //createSearchThrottle uses values by convention, via its parameters:
                    //  vm.sessionsSearch is where the user enters the search
                    //  vm.sessions is the original unfiltered array
                    //  vm.filteredSessions is the filtered array
                    //  vm.sessionsFilter is the filtering function
                    applyFilter = common.createSearchThrottle(vm, 'sessions');
                    if (vm.sessionsSearch) {
                        applyFilter(true); //true - apply filter without delay as controller is activated
                    }
                    log('Activated Sessions View');
                });
        }

        function getSessions(forceRefresh) {
            return datacontext.session.getPartials(forceRefresh).then(function (data) {
                return vm.sessions = vm.filteredSessions = data;
            });
        }

        function refresh() {
            getSessions(true);
        }
        
        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.sessionsSearch = '';
                applyFilter(true); //true - apply filter without delay
            } else {
                applyFilter();
            }
        }

        function sessionsFilter(session) {
            var textContains = common.textContains;
            var searchText = vm.sessionsSearch;
            var isMatch = searchText ?
                textContains(session.title, searchText)
                    || textContains(session.tagsFormatted, searchText)
                    || textContains(session.room.name, searchText)
                    || textContains(session.track.name, searchText)
                    || textContains(session.speaker.fullName, searchText)
                : true;
            return isMatch;
        }
        
    }
})();
