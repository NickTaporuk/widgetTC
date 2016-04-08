/**
 * Url builder. Based on events and on data on Stores.
 */

define([
    'dispatcher',
    'lodash',
    'page',
    'load!stores/vehicleStore',
    'load!stores/searchStore',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    page,
    vehicleStore,
    searchStore,
    constants
) {

    var objToQuery = function(obj, prefix) {
        var str = [];
        for(var p in obj) {
            if (obj.hasOwnProperty(p)) {
                var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
                var param = typeof v == "object" ?
                    objToQuery(v, k) :
                    encodeURIComponent(k) + "=" + encodeURIComponent(v)
                if (param) {
                    str.push(param);
                }
            }
        }
        return str.join("&");
    }


    var store = {
        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {               
                // results page
                case 'tire.search':
                    dispatcher.waitFor([searchStore.dispatchToken]);

                    var params = searchStore.getParamsForSearch(true);

                    var queryString = objToQuery(params);

                    var searchBy = 'by_' + searchStore.getActiveSection();

                    window.location.hash = '#!results/' + searchBy + '?' + queryString;

                    break;

                // search page
                // case 'search.vehicle.change':
                // case 'search.active_section.update':
                // case 'search.field.update':
                //     var params = searchStore.getParamsForSearch(true);
                //     params.base_category = searchStore.getValue(searchStore.getActiveSection(), 'base_category');
                //     delete params.filters;

                //     var queryString = objToQuery(params);

                //     var searchBy = 'by_' + searchStore.getActiveSection();

                //     window.location.hash = '#!search/' + searchBy + '?' + queryString;

                //     break;

                // summary page
            }
        })
        // store.trigger('change');
    };


    return store;
});