define([
    'dispatcher',
    'page',
    'lib/helper',
    'lodash',
    'actions/api',
    'load!stores/routingStore',
    'load!stores/searchStore'
], function(
    dispatcher,
    page,
    h,
    _,
    Api,
    routingStore,
    searchStore
) {

    page('results/:searchBy', function(ctx) {  //results?width=_&height=_&rim=_&display=_&page=_&order_by=_&filter[brand]=Brand|Brand2&filter[category]=Cat1|Cat2
        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);

        dispatcher.dispatch({
            actionType: 'search.params.update',
            params: params || {}
        });

        Api.getVehicleOptions(params);

        Api.searchTires(searchStore.getParamsForSearch());
    });


    page('quote', function(ctx) {  //results?width=_&height=_&rim=_&display=_&page=_&order_by=_&filter[brand]=Brand|Brand2&filter[category]=Cat1|Cat2
        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);

        Api.loadTire(params.tire_id).then(function(response) {

            Api.loadQuote(
                params.tire_id,
                params.quantity,
                params.services || 'use_default',
                params.with_discount || false,
                params.customDiscount || null
            );

        });

    });

    page('search', function(ctx) {});  // first page

    //if url not found
    page('*', function(ctx) {
        window.location.hash = '#!search';
    });
});