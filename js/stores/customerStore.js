define([
    'dispatcher',
    'load!stores/resultsStore',
    'lodash'
], function(
    dispatcher,
    resultsStore,
    _
) {

    // private section
    var selectedTire;
    var selectedQuantity;
    var quote;
    
    function setQuote(q) {
        //convert objects to array if needed
        var objToArr = ['services', 'optional_services'];
        for (var i = 0; i < 2; i++) {
            var objName = objToArr[i];
            if (!_.isArray(q[objName])) {
                var services = [];
                Object.keys(q[objName]).map(function(service) {
                    q[objName][service].key = service;
                    services.push(q[objName][service]);
                });
                q[objName] = services;
            }
        }
        //make shop supply fee as service
        if (q.shop_supply_fee) {
            q.services.push({
                name: q.shop_supply_fee.name,
                description: '',
                link: '',
                total_price: q.shop_supply_fee.total_value
            });
        }

        quote = q;
    }


    // public section
    var store = {
        getSelectedTire: function() {
            return resultsStore.getTire(selectedTire);
        },
        getSelectedQuantity: function() {
            return selectedQuantity;
        },
        getQuote: function() {
            return _.cloneDeep(quote);
        },
    
        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'quote.display.update':
                    selectedTire = payload.tireId;
                    selectedQuantity = payload.quantity;

                    setQuote(payload.quote);
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