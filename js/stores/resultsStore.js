define([
    'dispatcher',
    'lodash',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    constants
) {

    var showInStock = true;
    var defaultSelectedQuantity = 4;

    var tires = [];
    var tiresIndexes = [];
    var totalCount;
    var filters = [];
    var page;

    function changeSelectedQuantity(tireId, quantity) {
        var tire = tires[tiresIndexes[tireId]];
        tire.selected_quantity = quantity <= tire.quantity ? quantity : tire.quantity;
    }

    function addTires(_tires) {
        tires = _tires;
        _tires.map(function(tire, i) {
            tiresIndexes[tire.id] = i;
            changeSelectedQuantity(tire.id, defaultSelectedQuantity);

            if (!tire.external_info) {
                tire.external_info = {
                    marketing: {},
                    rating: {}
                };
            }

            if (!tire.external_info.marketing) {
                tire.external_info.marketing = {
                    images: [],
                    statement: ''
                };
            } else if (tire.external_info.marketing.features && tire.external_info.marketing.features.length > 0) {
                tire.description = tire.external_info.marketing.features;
            }

            if (!tire.external_info.rating) {
                tire.external_info.rating = {
                    total_reviews: null,
                    average_rating: null
                };
            }

            if (tire.category == 'Not Defined') {
                tire.category = 'Undefined Category';
            }

            tire.is_in_stock = (showInStock && tire.is_in_stock);
        });
    }

    function changeSupplier(tireId, supplier) {
        var tire = tires[tiresIndexes[tireId]];
        tire.id = supplier.tire_id;
        tire.quantity = supplier.quantity;
        tire.price = supplier.price;
        tire.supplier = supplier.supplier.name;
        tire.is_in_stock = supplier.is_in_stock;

        tiresIndexes[supplier.tire_id] = tiresIndexes[tireId];
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
                case constants.SEARCH_TIRES_SUCCESS:
                    addTires(payload.tires);
                    totalCount = payload.totalCount;
                    filters = payload.filters;
                    page = payload.page;                
                    change = true;
                    break;
                case constants.LOAD_TIRE_SUCCESS:
                    addTires([payload.tire]);
                    change = true;
                    break;
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                    var c = payload.config;
                    defaultSelectedQuantity = c.default_selected_quantity;
                    showInStock = c.show_in_stock;
                    change = true;
                    break;
                case 'quote.request.form.show':
                case 'tire.select':
                    if (payload.supplier) {
                        changeSupplier(payload.tireId, payload.supplier);
                    }
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