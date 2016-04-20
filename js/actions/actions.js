define([
    'dispatcher',
    // 'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'actions/api',
    'lib/helper',
    'lodash'
], function(
    dispatcher,
    // resultsStore,
    searchStore,
    locationsStore,
    customerStore,
    Api,
    h,
    _
) {

    var Actions = {
        Page: {
            show: function(name, props) {
                dispatcher.dispatch({
                    actionType: 'page.update',
                    name: name,
                    props: props || {}
                });
            }
        },
        Popup: {
            show: function(name, props) {
                dispatcher.dispatch({
                    actionType: 'popup.update',
                    name: name,
                    props: props || {}
                });
            },
            close: function() {
                dispatcher.dispatch({
                    actionType: 'popup.close'
                });
            }
        },
        Locations: {
            select: function(id) {
                dispatcher.dispatch({
                    actionType: 'locations.current.change',
                    id: id
                });

                Api.loadLocationConfig(id);
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
            },
            changeTab: function(section) {
                dispatcher.dispatch({
                    actionType: 'search.active_section.update',
                    section: section
                }); 
            }
        },
        Tire: {
            loadFullStock: function(tireId) {
                Api.loadFullStock(tireId);
            },
            loadStock: function(tireId) {
                Api.loadStock(tireId);
            },
            loadRewiews: function(tireId, offset) {
                Api.loadReviews(tireId, offset);
            },
            enlargeImage: function(image, model) {
                dispatcher.dispatch({
                    actionType: 'tire.enlarge',
                    image: image,
                    model: model
                });
            }
        },
        Vehicle: {
            change: function(values, type) {
                dispatcher.dispatch({
                    actionType: type + '.vehicle.change',
                    values: values
                });

                Api.getVehicleOptions(values);
            }
        }
    };

    return Actions;
});