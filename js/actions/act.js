define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'actions/api',
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
    h,
    _,
    config
) {

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
                var defaultEntryParams = {
                    display: 'full',
                    page: 1,
                    filters: {
                        brand: [],
                        category: [],
                        run_flat: [],
                        ligth_truck: []
                    }
                };

                var entryParams = entryParams ? _.merge(defaultEntryParams, entryParams) : defaultEntryParams;

                dispatcher.dispatch({
                    actionType: 'results.page.update',
                    entryParams: entryParams
                });
                
                if (!afterNav) {
                    Api.searchTires(entryParams);

                    setUrl('results', entryParams);
                }
            }
        },
        summaryPage: {
            update: function(entryParams, afterNav) {
                var dispatch = function() {
                    dispatcher.dispatch({
                        actionType: 'summary.page.update',
                        entryParams: entryParams || {}
                    });
                };

                if (!resultsStore.getTire(entryParams.tire_id)) {
                    Api.loadTire(entryParams.tire_id).then(function() {
                        dispatch();
                    });
                } else {
                    dispatch();
                }

                if (!afterNav) {
                    Api.loadQuote(
                        entryParams.tire_id,
                        entryParams.quantity,
                        entryParams.optional_services || 'use_default',
                        entryParams.with_discount || false,
                        entryParams.custom_discount || null
                    );

                    delete entryParams.supplier;

                    setUrl('summary', entryParams);
                }
            }
        },
        appointmentPage: { 
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'appointment.page.update'
                });

                if (!afterNav) {
                    setUrl('appointment', entryParams);
                }
            }
        },
        getAQuotePage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'get_a_quote.page.update'
                });

                if (!afterNav) {
                    setUrl('get_a_quote', entryParams);
                }
            }
        },
        emailPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'email.page.update'
                });

                if (!afterNav) {
                    setUrl('email', entryParams);
                }
            }
        },
        printPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'print.page.update'
                });

                if (!afterNav) {
                    setUrl('print', entryParams);
                }
            }
        },
        emailOnlyPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'email_only.page.update'
                });

                if (!afterNav) {
                    setUrl('email_only', entryParams);
                }
            }
        },

        
    };

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

    function execute(page, params, afterNav) {
        // console.log(page, params);
        switch (page) {
            case '':
                actions.searchPage.update(params, true);
                break;
            case 'get_a_quote':
                actions.getAQuotePage.update(params, afterNav);
                break;
            case 'email_only':
                actions.emailOnlyPage.update(params, afterNav);
                break;
            default:
                actions[page + 'Page'].update(params, afterNav);
        }
    };

    window.addEventListener('popstate', function(e) {
        var page = e.state && e.state.page ? e.state.page : 'search';
        var params = e.state && e.state.params ? e.state.params : {};
        execute(page, params, true);
    }, false);

    var urlData = h.queryToObj(window.location.hash);

    execute(urlData.page, urlData.params, false);

    return actions;
});