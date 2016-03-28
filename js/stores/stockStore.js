define([
    'dispatcher',
    'lodash',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    constants
) {
    var fullStock = {};
    var branches ={};


    function setCurrentLocation(id) {
        currectLocation = id;
    }

    var store = {
        getFullStock: function(tireId) {
            return fullStock[tireId] ? fullStock[tireId] : [];
        },
        getBranches: function(tireId) {
            return branches[tireId] ? branches[tireId] : [];
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.LOAD_FULL_STOCK_SUCCESS:
                    fullStock[payload.tireId] = payload.stock;
                    change = true;
                    break;
                    
                case constants.LOAD_STOCK_SUCCESS: 
                    branches[payload.tireId] = payload.branches;
                    change = true;
                    break;
            }
            
            if (change) {
                store.trigger('change');
            }
        })
    };

    return store;
});