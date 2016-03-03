define([
    'dispatcher',
    'lodash',
], function(
    dispatcher,
    _
) {

    var years = [];
    var makes = {
        2016: []
    };
    var models = {
        2016: {
            Acura: []
        }
    };
    var trims = {
        2016: {
            Acura: {
                MX: []
            }
        }
    };
    var tireSizes = {
        2016: {
            Acura: {
                MX: {
                    Base: []
                }
            }
        }  
    };

    var getKey = function(year, make, model, trim) {
        var key = year + (make ? make : '') + (model ? model : '') + (trim ? trim : '');
        return key.replace(/[^a-zA-Z0-9]/, '_');
    };

    var store = {
        getYears: function() {
            return years;
        },
        getMakes: function(year) {
            return makes[year+''];
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
            var key = getKey(payload.year, payload.make, payload.model, payload.trim);
            switch (payload.actionType) {
                case 'vehicle.years.success':
                    years = payload.options;
                    break;
                case 'vehicle.makes.success':
                    makes[payload.year] = payload.options;
                    break;
                case 'vehicle.models.success':
                    models[key] = payload.options;
                    break;
                case 'vehicle.trims.success':
                    trims[key] = payload.options;
                    break;
                case 'vehicle.tireSizes.success':
                    tireSizes[key] = payload.options;
                    break;
            }

            store.trigger('change');
        })
    };

    return store;

});