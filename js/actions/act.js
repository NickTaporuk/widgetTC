define([
    'dispatcher',
    'promise',
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
    Promise,
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
        init: function() {
            var curLocId = locationsStore.getCurLocId();

            var promises = [
                Api.loadLocations(),
                Api.loadTireParameters(),
                Api.getVehicleOptions(),
                Api.loadDealerConfig(),
                Api.loadDealerInfo()
            ];

            if (curLocId) {
                promises.push(Api.loadLocationConfig(curLocId));
            }

            Promise.all(promises).then(function() {
                start();
                // dispatcher.dispatch({
                //     actionType: 'widget.inited'
                // });
            });
        },

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
                // set filter by category base no base_category
                if (entryParams.base_category) {
                    var baseCategories = searchStore.getOptions('base_category');
                    var baseCategoriesLength = baseCategories.length;
                    for (var i = 0; i < baseCategoriesLength; i++) {
                        if (entryParams.base_category == baseCategories[i].value) {
                            if (!entryParams.filters) {
                                entryParams.filters = {};
                            }
                            entryParams.filters.category = baseCategories[i].categories;
                            break;
                        }
                    }
                }

                var dispatch = function() {
                    dispatcher.dispatch({
                        actionType: 'results.page.update',
                        entryParams: entryParams
                    });
                };

                if (!visitedPages['results'] || !afterNav) {
                    var params = _.cloneDeep(entryParams);
                    if (params.base_category) {
                        delete params.base_category;
                    }

                    Api.searchTires(params).then(dispatch);

                    if (!afterNav) {
                        setUrl('results', entryParams);
                    }
                } else {
                    dispatch();
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
                };

                if (!resultsStore.getTire(entryParams.tire_id)) {
                    Api.loadTire(entryParams.tire_id).then(function() {
                        dispatch();
                    });
                } else {
                    dispatch();
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

    var firstRun = true;
    var visitedPages = {};

    function setUrl(page, params) {
        visitedPages[page] = true;

        if (firstRun) {
            firstRun = false;
            return;
        }

        var path = '#!' + page + (params ? '?'  + h.objToQuery(params) : '');

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
        switch (page) {
            case '':
                actions.searchPage.update(params, afterNav);
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
    }

    window.addEventListener('popstate', function(e) {
        var page = e.state && e.state.page ? e.state.page : 'search';
        var params = e.state && e.state.params ? e.state.params : {};
        execute(page, params, true);
    }, false);

    function start() {
        var urlData = h.queryToObj(window.location.hash);
        if ( ['search', 'results', 'summary'].indexOf(urlData.page) == -1) {
            urlData = {
                page: 'search',
                params: null
            };
        }
        execute(urlData.page, urlData.params, false);
    }

    return actions;
});