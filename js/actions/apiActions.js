define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'lib/api'
], function(
    dispatcher,
    resultsStore,
    searchStore,
    locationsStore,
    Api
) {

    var Actions = {
        // beforeSend: function() {
        //     dispatcher.dispatch({
        //         actionType: 'ajax.beforeSend'
        //     });
        // },
        
        // responseReceived: function() {
        //     dispatcher.dispatch({
        //         actionType: 'ajax.complete'
        //     });  
        // },

        searсhTires: function(addParams) {
            var section = searchStore.getActiveSection();
            var searchParams = searchStore.getSectionValues(section);
            searchParams.location_id = locationsStore.getCurrentLocation().id;
            searchParams.items_per_page = 6;

            searchParams.display = searchStore.getValue('common', 'display');
            searchParams.order_by = searchStore.getValue('common', 'order_by');
            searchParams.filters = {
                'brand': searchStore.getValue('common', 'brand'),
                'light_truck': searchStore.getValue('common', 'light_truck'),
                'run_flat': searchStore.getValue('common', 'run_flat')
            };
            searchParams.needed_filters = ['brand', 'run_flat', 'light_truck'];


            if (addParams) {
                searchParams = _.assign(searchParams, addParams);
            }

            Api.searchTires(section, searchParams).then(function(results) {
                dispatcher.dispatch({
                    actionType: 'results.fill',
                    tires: results.tires,
                    totalCount: results.nb_results,
                    filters: results.filters,
                    page: results.page
                });
            });
        }
    }

    return Actions;

});