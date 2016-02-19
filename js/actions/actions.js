define([
    'dispatcher',
    'load!stores/resultsStore'
    // 'lib/api'
], function(
    dispatcher,
    resultsStore
    // Api
){

    return {
        init: function() {
            // var promise = Api.getLocation();
            // promise.success(function(locations) {
            //     console.log(locations);
            // });

            dispatcher.dispatch({
                actionType: 'init'
            });
        },
        Locations: {
            prepare: function() {
                Api.getLocations().then(function(locations){
                    dispatcher.dispatch({
                        actionType: 'locations.init',
                        locations: locations,
                    });
                });
            }
        },
        Page: {
            update: function(name, props) {
                dispatcher.dispatch({
                    actionType: 'page-update',
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
            },
            changeTab: function(section) {
                dispatcher.dispatch({
                    actionType: 'search.active_section.update',
                    section: section
                }); 
            },
            make: function() {
                dispatcher.dispatch({
                    actionType: 'search.make'
                });   
            }
        },
        Customer: {
            updateParam: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'customer-update_param',
                    param: param,
                    value: value
                });                
            },
            updateVehicle: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'customer-update_vehicle',
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
});