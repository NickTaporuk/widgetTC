define([
    'dispatcher',
    'page'
], function(
    dispatcher,
    page
) {

    page('/search/:searchBy', function(ctx) {
        // console.log('home');
    });

    var actions = {
        init: function(params) {
            dispatcher.dispatch({
                actionType: 'page.search.init',
                params: params || {}
            });
        },

        changeSearchBy: function() {

        },

        changeVehicleParam: function() {

        },

        changeSizeParam: function() {

        },

        changePartNumber: function() {

        },

        search: function() {

        }
    };

    return actions;
});