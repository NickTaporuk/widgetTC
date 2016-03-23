define([
    'dispatcher',
    'lodash',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    constants
) {

    var years = [],
        makes = [],
        models = [],
        trims = [],
        tireSizes = [];

    var getKey = function(year, make, model, trim) {
        var key = year + (make ? make : '') + (model ? model : '') + (trim ? trim : '');
        return key.replace(/[^a-zA-Z0-9]/, '_');
    };

    var store = {
        getYears: function() {
            return years;
        },
        getMakes: function(year) {
            return makes[year+''] ? makes[year+''] : [];
        },
        getModels: function(year, make) {
            var key = getKey(year, make);
            return models[key] ? models[key] : [];
        },
        getTrims: function(year, make, model) {
            var key = getKey(year, make, model);
            return trims[key] ? trims[key] : [];
        },
        getTireSizes: function(year, make, model, trim) {
            var key = getKey(year, make, model, trim);
            return tireSizes[key] ? tireSizes[key] : [];
        },
        getAll: function(year, make, model, trim) {
            var key = getKey(year, make, model, trim);
            var all = {
                years: store.getYears(),
                makes: year ? store.getMakes(year) : [],
                models: make ? store.getModels(year, make) : [],
                trims: model ? store.getTrims(year, make, model) : [],
                tireSizes: trim ? store.getTireSizes(year, make, model, trim) : []
            };
            return all;
        },
        dispatchToken:  dispatcher.register(function(payload) {
            var values = payload.values || {};
            var key = getKey(values.year, values.make, values.model, values.trim);
            switch (payload.actionType) {
                case constants.GET_VEHICLE_YEARS_SUCCESS:
                    years = payload.options;
                    break;
                case constants.GET_VEHICLE_MAKES_SUCCESS:
                    makes[key] = payload.options;
                    break;
                case constants.GET_VEHICLE_MODELS_SUCCESS:
                    models[key] = payload.options;
                    break;
                case constants.GET_VEHICLE_TRIMS_SUCCESS:
                    trims[key] = payload.options;
                    break;
                case constants.GET_VEHICLE_TIRES_SUCCESS:
                    tireSizes[key] = payload.options;
                    break;
            }

            store.trigger('change');
        })
    };
    
    return store;

});