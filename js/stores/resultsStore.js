define([
    'dispatcher',
    'lodash',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    constants
) {

    var itemsPerPage = 6;
    var showInStock = true;
    var defaultSelectedQuantity = 4;

    var tires = [];
    var tiresIndexes = []
    var totalCount;
    var filters = [];
    var page;

    function changeSelectedQuantity(tireId, quantity) {
        var tire = tires[tiresIndexes[tireId]];
        tire.selected_quantity = quantity <= tire.quantity ? quantity : tire.quantity;
        tire.calculated_price = tire.selected_quantity * tire.price;
    }

    function fillTires(_tires) {
        tires = _tires;
        _tires.map(function(tire, i) {
            tiresIndexes[tire.id] = i;
            changeSelectedQuantity(tire.id, defaultSelectedQuantity);
        });
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
        getItemsPerPage: function() {
            return itemsPerPage;
        },
        // getShowInStock: function() {
        //     return showInStock;
        // },

        dispatchToken: dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case constants.SEARCH_TIRES_SUCCESS:
                    fillTires(payload.tires);
                    totalCount = payload.totalCount;
                    filters = payload.filters;
                    page = payload.page;                
                    change = true;
                    break;
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                    var c = payload.config;
                    itemsPerPage = c.items_per_page;
                    defaultSelectedQuantity = c.default_selected_quantity;
                    // showInStock = c.show_in_stock;
                    change = true;
                    break;
                case constants.LOAD_QUOTE_SUCCESS:
                    changeSelectedQuantity(payload.tireId, payload.quantity);
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