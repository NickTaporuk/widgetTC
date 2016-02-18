define([
    'dispatcher'
], function(
    dispatcher
){

    return {
        init: function() {
            dispatcher.dispatch({
                actionType: 'init'
            });
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
            updateParam: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'search-update_param',
                    param: param,
                    value: value
                });   
            },
            updateVehicle: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'search-update_vehicle',
                    param: param,
                    value: value
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