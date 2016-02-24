define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'lib/api'
], function(
    dispatcher,
    resultsStore,
    searchStore,
    locationsStore,
    Api
){

    var Actions = {
        init: function() {
            // trigger in Location component
            Api.getLocations().then(function(response) {
                dispatcher.dispatch({
                    actionType: 'locations.init',
                    locations: response.data.locations
                });
            });

            // trigger in Search component
            Api.getTireParameters().then(function(response) {
                dispatcher.dispatch({
                    actionType: 'search.options.update',
                    options: response.data
                });
            });

            Api.getVehicleYears().then(function(years) {
                dispatcher.dispatch({
                    actionType: 'search.options.update',
                    options: {year: years}
                });
            });
        },
        Page: {
            show: function(name, props) {
                dispatcher.dispatch({
                    actionType: 'page.update',
                    name: name,
                    props: props || {}
                });
            }
        },
        Search: {
            updateField: function(section, field, value) {
                dispatcher.dispatch({
                    actionType: 'search.field.update',
                    section: section,
                    field: field,
                    value: value
                });

                if (section == 'vehicle') {
                    if (field == 'year') {
                        Api.getVehicleMakes(searchStore.getValue('vehicle', 'year')).then(function(makes) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {make: makes, model: [], trim: [], car_tire_id: []}
                            });
                        });
                    } else if (field == 'make') {
                        Api.getVehicleModels(
                            searchStore.getValue('vehicle', 'year'),
                            searchStore.getValue('vehicle', 'make')
                        ).then(function(models) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {model: models, trim: [], car_tire_id: []}
                            });
                        });
                    } else if (field == 'model') {
                        Api.getVehicleTrims(
                            searchStore.getValue('vehicle', 'year'),
                            searchStore.getValue('vehicle', 'make'),
                            searchStore.getValue('vehicle', 'model')
                        ).then(function(trims) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {trim: trims, car_tire_id: []}
                            });
                        });
                    } else if (field == 'trim') {
                        Api.getVehicleTireSizes(
                            searchStore.getValue('vehicle', 'year'),
                            searchStore.getValue('vehicle', 'make'),
                            searchStore.getValue('vehicle', 'model'),
                            searchStore.getValue('vehicle', 'trim')
                        ).then(function(car_tire_ids) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {car_tire_id: car_tire_ids}
                            });
                        });
                    }
                }
            },
            changeTab: function(section) {
                dispatcher.dispatch({
                    actionType: 'search.active_section.update',
                    section: section
                }); 
            },
            make: function(addParams) {
                var section = searchStore.getActiveSection();
                var searchParams = searchStore.getSectionValues(section);
                searchParams['location_id'] = locationsStore.getCurrentLocation().id;
                searchParams['items_per_page'] = 6;

                searchParams['display'] = searchStore.getValue('common', 'display');
                searchParams['order_by'] = searchStore.getValue('common', 'order_by');
                searchParams['filters'] = {
                    'brand': searchStore.getValue('common', 'brand'),
                    'light_truck': searchStore.getValue('common', 'light_truck'),
                    'run_flat': searchStore.getValue('common', 'run_flat')
                };

                if (addParams) {
                    searchParams = _.assign(searchParams, addParams);
                }

                Api.searchTires(section, searchParams).then(function(results) {
                    dispatcher.dispatch({
                        actionType: 'results.fill',
                        tires: results.tires,
                        totalCount: results.nb_results,
                        filters: results.filters,
                        page: results.page
                    });
                });
            }
        },
        Results: {
            updatePage: function(params) {
                Actions.Search.make(params);
            }
        },
        Customer: {
            updateParam: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'customer.update_param',
                    param: param,
                    value: value
                });                
            },
            updateVehicle: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'customer.update_vehicle',
                    param: param,
                    value: value
                });
            }
        },
        Quote: {
            update: function() {
                //quantity
                //optionalServices
                //discount
                dispatcher.dispatch({
                    actionType: 'quote-update_param',
                    param: param,
                    value: value
                });
            }
        }
    }

    return Actions;
});