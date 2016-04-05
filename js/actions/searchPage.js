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

    page('', function(ctx) {
        console.log('home');
    });

    page('search/:searchBy', function(ctx) {
        console.log('dfdf');

        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);
        
        // console.log(params);

        dispatcher.dispatch({
            actionType: 'page.search.show',
            params: params || {}
        });


        if (params.searchBy == 'by_vehicle') {
            var values = params;

            if (values.trim) {
                Api.getVehicleTireSizes(values.year, values.make, values.model, values.trim);
            } 
            if (values.model) {
                Api.getVehicleTrims(values.year, values.make, values.model);
            } 
            if (values.make) {
                Api.getVehicleModels(values.year, values.make);
            } 
            if (values.year) {
                Api.getVehicleMakes(values.year);
            }
        }
    });



    page.base(window.location.pathname + window.location.search);


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

        changeVehicleParam: function(values, changedField) {
            dispatcher.dispatch({
                actionType: 'search.vehicle.change',
                values: values
            });

            Api.getVehicleOptions(values, changedField);
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