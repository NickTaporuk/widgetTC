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

    // page('search/:searchBy', function(ctx) {
    //     var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);
        
    //     dispatcher.dispatch({
    //         actionType: 'search.params.update',
    //         params: params || {}
    //     });

    //     Api.getVehicleOptions(params);
    // });


    page('results/:searchBy', function(ctx) {  //results?width=_&height=_&rim=_&display=_&page=_&order_by=_&filter[brand]=Brand|Brand2&filter[category]=Cat1|Cat2
        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);

        dispatcher.dispatch({
            actionType: 'search.params.update',
            params: params || {}
        });

        Api.getVehicleOptions(params);

        Api.searchTires(searchStore.getParamsForSearch());
    });


    page('quote/:tireId', function(ctx) {  //results?width=_&height=_&rim=_&display=_&page=_&order_by=_&filter[brand]=Brand|Brand2&filter[category]=Cat1|Cat2
        var params = _.merge(h.queryToObj(ctx.querystring), ctx.params);

        // get tire first

        // get quote
        Api.loadQuote(
            params.tireId,
            params.quantity,
            params.services || 'use_default',
            params.withDiscount || false,
            params.customDiscount || null
        );
        // .done(function() {
        //     console.log('dfdfdf');
        // });
    });


    // page('quote', function(ctx) {    //quote?tire_id=_&with_discount=_&quantity=_&custom_discount=_&optional_services[]=_&optional_services[]=_
    //     // load quote
    //     // show page
    // });

    // //appointment and any quote page:
    // page('appointment', function() {  //appointment?tire_id=_&with_discount=_&quantity=_&custom_discount=_&optional_services[]=_&optional_services[]=_
    //     // load quote
    //     // show page
    // });
});