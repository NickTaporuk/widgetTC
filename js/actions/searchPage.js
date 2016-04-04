define([
    'dispatcher',
    'page'
], function(
    dispatcher,
    page
) {
    



    var actions = {
        init: function(params) {
            dispatcher.dispatch({
                actionType: 'search.init',
                params: params || {}
            });
        },

        changeSearchBy: function(searchBy) {
            dispatcher.dispatch({
                actionType: 'search.search_by.change',
                searchBy: searchBy
            });
        },

        changeVehicleParam: function(values) {
            dispatcher.dispatch({
                actionType: 'search.vehicle.change',
                values: values
            });
        },

        changeSizeParam: function(values) {
            dispatcher.dispatch({
                actionType: 'search.size.change',
                values: values
            });
        },

        changePartNumber: function(partNumber) {
            dispatcher.dispatch({
                actionType: 'search.part_number.change',
                partNumber: partNumber
            });
        },

        search: function(values) {
            dispatcher.dispatch({
                actionType: 'search.start',
                values: values
            });

            Api.searchTires(values);
        }
    };

    return actions;
});