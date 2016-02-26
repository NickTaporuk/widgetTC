define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {

    var tires = [];
    var tiresIndexes = []
    var totalCount;
    var filters = [];
    var page;

    function fillTires(_tires) {
        _tires.map(function(tire, i) {
            tiresIndexes[tire.id] = i; 
        });
        tires = _tires;
    }

    var resultsStore = {
        getPage: function() {
            return page;
        },
        getFilters: function() {
            return _.cloneDeep(filters);
        },
        getTotalCount: function() {
            return totalCount;
        },
        getTires: function() {
            return _.cloneDeep(tires);
        },
        getTire: function(id) {
            return _.cloneDeep(tires[tiresIndexes[id]]);
        },

        dispatchToken: dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'results.fill':
                    fillTires(payload.tires);
                    totalCount = payload.totalCount;
                    filters = payload.filters;
                    page = payload.page;                
                    change = true;
                    break;    
            }
            
            if (change) {
                resultsStore.trigger('change');
            }
        })
    };

    return resultsStore;
});