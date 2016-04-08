define([
    'dispatcher',
    'page',
    'lib/helper',
    'lodash',
    'actions/api'
], function(
    dispatcher,
    page,
    h,
    _,
    Api
) {

    var actions = {
        changeSearchBy: function(searchBy) {
            dispatcher.dispatch({
                actionType: 'search.search_by.change',
                searchBy: searchBy
            });
        },

        showLocations: function() {
            dispatcher.dispatch({
                actionType: 'popup.show',
                popup: 'locations' 
            });
        },

        changeLocation: function(locationId) {
            dispatcher.dispatch({
                actionType: 'search.location.change',
                locationId: locationId
            });
        },

        changeVehicleParam: function(values, changedField) {
            dispatcher.dispatch({
                actionType: 'search.params.change',
                values: values,
                section: 'vehicle'
            });

            Api.getVehicleOptions(values, updatedField);
        },

        changeSizeParam: function(values) {
            dispatcher.dispatch({
                actionType: 'search.params.change',
                values: values,
                section: 'size'
            });
        },

        changePartNumber: function(partNumber) {
            dispatcher.dispatch({
                actionType: 'search.params.change',
                values: {part_number: partNumber},
                section: 'part_number'
                //partNumber: partNumber
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