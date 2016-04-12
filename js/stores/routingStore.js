/**
 * Url builder. Based on events and on data on Stores.
 */

define([
    'dispatcher',
    'lodash',
    'page',
    'load!stores/pageStore',
    'load!stores/vehicleStore',
    'load!stores/searchStore',
    'load!stores/resultsStore',
    'load!stores/customerStore',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    page,
    pageStore,
    vehicleStore,
    searchStore,
    resultsStore,
    customerStore,
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
            /*
            switch (payload.actionType) {               
                // results page
                case 'tire.search':
                    dispatcher.waitFor([searchStore.dispatchToken]);

                    var params = searchStore.getParamsForSearch(true);

                    var queryString = objToQuery(params);

                    var searchBy = 'by_' + searchStore.getActiveSection();

                    window.location.hash = '#!results/' + searchBy + '?' + queryString;

                    break;

                case constants.LOAD_QUOTE_SUCCESS: // 'tire.select':
                    dispatcher.waitFor([customerStore.dispatchToken]);

                    var params = customerStore.getParamsForQuote('display');

                    window.location.hash = '#!quote?' + objToQuery(params);

                    break;

                default:
                    window.location.hash = '#!' + pageStore.getPageName();
                    break;

                // summary page
            } */
        })
    };


    return store;
});