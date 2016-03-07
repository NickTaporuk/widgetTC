define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
    _
) {
    var fullStock = {};
    var branches ={};


    function setCurrentLocation(id) {
        currectLocation = id;
    }

    var store = {
        getFullStock: function(tireId) {
            return fullStock[tireId] || [];
        },
        getBranches: function(tireId) {
            return branches[tireId] || [];
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case 'tire.full_stock.success':
                    fullStock[payload.tireId] = payload.stock;
                    // console.log(fullStock);
                    change = true;
                    break;
                    
                case 'tire.stock.success': 
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