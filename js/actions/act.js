define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'actions/api',
    'actions/resultsPage',
    'lib/helper',
    'lodash',
    'config'
], function(
    dispatcher,
    resultsStore,
    searchStore,
    locationsStore,
    customerStore,
    Api,
    resultsPageActions,
    h,
    _,
    config
) {

    function setUrl(page, params) {
        var path = '#!' + page + '?'  + h.objToQuery(params);

        var state = {
            page: page,
            params: params,
            path: path
        }

        if (history.state && history.state.page && history.state.page == page) {
            history.replaceState(state, page, config.allowUrl ? path : '');
        } else {
            history.pushState(state, page, config.allowUrl ? path : '');
        }
    }

    window.addEventListener('popstate', function(e) {
        var page = e.state && e.state.page ? e.state.page : 'search';
        var params = e.state && e.state.params ? e.state.params : {};
        if (page == 'results') {
            actions.resultsPage.update(params, true);
        } else if (page == 'summary') {
            actions.summaryPage.update(params, true);
        } else if (page == 'search') {
            actions.searchPage.update(params, true);
        }
    }, false);


    var actions = {
        searchPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'search.page.update',
                    entryParams: entryParams || {}
                });

                if (!afterNav) {
                    setUrl('search', entryParams);
                }
            }
        },
        resultsPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'results.page.update',
                    entryParams: entryParams || {}
                });

                //all entry params is component (page) props
                Api.searchTires(entryParams);
                
                if (!afterNav) {
                    setUrl('results', entryParams);
                }
            }
        },
        summaryPage: {
            update: function(entryParams, afterNav) {
                Api.loadQuote(
                    entryParams.tire_id,
                    entryParams.quantity,
                    entryParams.optional_services || 'use_default',
                    entryParams.with_discount || false,
                    entryParams.custom_discount || null
                ).then(function() {
                    dispatcher.dispatch({
                        actionType: 'summary.page.update',
                        entryParams: entryParams || {}
                    });    
                });

                if (!afterNav) {
                    setUrl('summary', entryParams);
                }
            }
        }

        
    };

    return actions;
});