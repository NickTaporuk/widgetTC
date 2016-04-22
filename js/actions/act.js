define([
    'dispatcher',
    'promise',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'actions/api',
    'lib/helper',
    'lib/history',
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
    history,
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
            });
        },

        // route: function(url, params, mode) {
        //     // modes:
        //     // - 1: new (page init steps need to be done before show page)
        //     // - 2: after navigation  (prev/next btn),
        //     // - 3: show last (page init steps will be skiped and last params of the page will be used)
        //     mode = mode || 1;


        //     var needInit = true;
        //     if (visitedPages[url]) {
        //         params = visitedPages[url];
        //         needInit = false;
        //     }

        //     actions[url + 'Page'].update(params, needInit);

        //     if (mode !== 2) {
        //         visitedPages[url] = params;
        //         setUrl(url, params);
        //     }
        // },

        searchPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'search.page.update',
                    entryParams: entryParams || {}
                });

                setUrl('search', entryParams);
            }
        },
        resultsPage: {
            update: function(entryParams, afterNav) {
                // set filter by category base on base_category
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

                var dispatch = function(results) {
                    dispatcher.dispatch({
                        actionType: 'results.page.update',
                        entryParams: entryParams,
                        results: results || null
                    });
                };

                var makeSearch = function(params) {
                    Api.searchTires(params).then(dispatch);
                };

                if (!visitedPages['results'] || !afterNav) {
                    var params = _.cloneDeep(entryParams);
                    if (params.base_category) {
                        // removing of base category. We apply it through category filter. See above.
                        delete params.base_category;
                    }

                    if (!visitedPages['results'] && entryParams.car_tire_id) {
                        // if search  by vehile, load vehicle options
                        Api.getVehicleOptions(entryParams).then(function() {
                            makeSearch(params);
                        });
                    } else {
                        makeSearch(params);
                    }

                    setUrl('results', entryParams);
                } else {
                    dispatch();
                }
            }
        },
        summaryPage: {
            update: function(entryParams, afterNav) {
                var dispatch = function() {

                    var dispatch = function(quote) {
                        dispatcher.dispatch({
                            actionType: 'summary.page.update',
                            entryParams: entryParams || {},
                            quote: quote || null
                        });
                    };

                    if (!afterNav) {
                        Api.loadQuote(
                            entryParams.tire_id,
                            entryParams.quantity,
                            entryParams.optional_services || 'use_default',
                            entryParams.with_discount || false,
                            entryParams.custom_discount || null
                        ).then(function(quote){
                            dispatch(quote);
                        });

                        delete entryParams.supplier;

                        setUrl('summary', entryParams);
                    } else {
                        dispatch();
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

                setUrl('appointment', entryParams);
            },
            sendAppointment: function(values) {
                dispatcher.dispatch({
                    actionType: 'appointment.make',
                    customer: values
                });

                values = customerStore.getParamsForQuote('appointment');
                Api.sendAppointment(values).then(function() {
                    actions.summaryPage.update(visitedPages['summary'], false);
                }, function() {});
            },
        },
        getAQuotePage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'get_a_quote.page.update'
                });

                setUrl('get_a_quote', entryParams);
            }
        },
        emailPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'email.page.update'
                });

                setUrl('email', entryParams);
            },
            sendEmail: function(values) {
                dispatcher.dispatch({
                    actionType: 'email.quote',
                    customer: values
                });

                var values = customerStore.getParamsForQuote('email');
                Api.emailQuote(values).then(function() {
                    actions.summaryPage.update(visitedPages['summary'], false);
                }, function() {});
            }
        },
        printPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'print.page.update'
                });

                setUrl('print', entryParams);
            },
            print: function(values) {
                dispatcher.dispatch({
                    actionType: 'print.quote',
                    customer: values
                });

                var values = customerStore.getParamsForQuote('print');
                Api.printQuote(values).then(function() {
                    actions.summaryPage.update(visitedPages['summary'], false);
                }, function() {});
            }
        },
        emailOnlyPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'email_only.page.update'
                });

                setUrl('email_only', entryParams);
            }
        },
        orderPage: {
            update: function(entryParams, afterNav) {
                var dispatch = function(order) {
                    dispatcher.dispatch({
                        actionType: 'order.page.update',
                        order: order || null
                    });
                }

                if (!afterNav) {
                    Api.orderCreate({
                        tires: [{
                            id: entryParams.tire_id,
                            quantity: entryParams.quantity,
                            with_discount: entryParams.with_discount || false,
                            optional_services: entryParams.optional_services || 'use_default'
                        }]
                    }).then(function(order) {
                        dispatch(order)
                    });

                    setUrl('order');
                } else {
                    dispatch();
                }
            },
            payment: function(values) {
                var order = customerStore.getOrder();

                var dispatch = function(order, step) {
                    step = step || 'payment';
                    dispatcher.dispatch({
                        actionType: 'order.' + step + '.success',
                        customer: values,
                        order: order
                    });
                    if (step == 'payment') {
                        actions.confirmationPage.update({
                            notice: order.notice
                        });
                    }
                };

                if (order.status === 'initiated') {
                    Api.orderCheckout(order.order_id, values).then(function(order) {
                        if (order.status == 'incomplete') {
                            dispatch(order, 'checkout');    
                        } else {
                            dispatch(order);    
                        }
                    });
                } else {
                    Api.orderPayment(order.order_id, values.token).then(function(order) {
                        dispatch(order);
                    });
                }
            }
        },
        confirmationPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'confirmation.page.update',
                    notice: entryParams.notice
                });
            }
        },
        requestPage: {
            update: function(entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'request.page.update',
                    entryParams: entryParams
                });

                setUrl('request');
            },
            request: function(values) {
                dispatcher.dispatch({
                    actionType: 'request.quote',
                    customer: values
                });

                values.tire_id = customerStore.getSelectedTireId();
                values.quantity = customerStore.getSelectedQuantity();

                Api.requestQuote(values).then(function() {
                    actions.resultsPage.update(visitedPages['results'], false);
                }, function() {});
            }
        }
    };

    var visitedPages = {};

    function setUrl(page, params) {
        visitedPages[page] = params || true;

        var path = '#!' + page + (params ? '?'  + h.objToQuery(params) : '');

        var state = {
            page: page,
            params: params,
            path: path
        };
        
        if (!history.state || (history.state && history.state.page && history.state.page == page)) {
            history.replaceState(state, page, path);
        } else {
            history.pushState(state, page, path);
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

    history.bind('popstate', function(state) {
        var page = state && state.page ? state.page : null,
            params = state && state.params ? state.params : {};
        
        execute(page, params, true);
    });

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