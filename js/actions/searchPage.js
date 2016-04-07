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

    //start page
    page('search/:searchBy', function(ctx) {
        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);
        actions.index(params);
        
        // actions.changeSearchBy(params.searchBy);
        // delete params.searchBy;
        // actions.changeLocation(params.location_id);
        // delete params.location_id;
        // // if vehicle
        // actions.changeVehicleParam(params);
        // // if size
        // actions.changeSizeParam(params);
        // // if part number
        // actions.changePartNumber(params.part_number || '');
    });

    page('results', function(ctx) {  //results?width=_&height=_&rim=_&display=_&page=_&order_by=_&filter[brand]=Brand|Brand2&filter[category]=Cat1|Cat2
        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);
        // make search
        // show page
    });

    page('quote', function(ctx) {    //quote?tire_id=_&with_discount=_&quantity=_&custom_discount=_&optional_services[]=_&optional_services[]=_
        // load quote
        // show page
    });

    //appointment and any quote page:
    page('appointment', function() {  //appointment?tire_id=_&with_discount=_&quantity=_&custom_discount=_&optional_services[]=_&optional_services[]=_
        // load quote
        // show page
    });


    var actions = {
        index: function(params) {
            dispatcher.dispatch({
                actionType: 'page.search.show',
                params: params || {}
            });

            Api.getVehicleOptions(params);
        },

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