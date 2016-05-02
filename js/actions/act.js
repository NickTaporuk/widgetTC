define([
    'dispatcher',
    'promise',
    'load!stores/store',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'load!stores/popupStore',
    'actions/api',
    'lib/helper',
    'lib/history',
    'lodash',
    'config'
], function(
    dispatcher,
    Promise,
    store,
    resultsStore,
    searchStore,
    locationsStore,
    customerStore,
    popupStore,
    Api,
    h,
    history,  // history must be used to fill appStore
    _,
    config
) {

    var actions = {
        init: function () {
            // var curLocId = locationsStore.getCurLocId();

            // var promises = [
                // Api.loadLocations()
                // Api.loadTireParameters(),
                // Api.getVehicleOptions(),
                // Api.loadDealerConfig(),
                // Api.loadDealerInfo()
            // ];

            // if (curLocId) {
            //     promises.push(Api.loadLocationConfig(curLocId));
            // }

            // Promise.all(promises).then(function () {
            //     start();
            // });

            start();
        },

        route: function(url, params) {
            // console.log(params);

            // modes:
            // - 1: new (page init steps need to be done before show page)
            // - 2: after navigation  (prev/next btn),
            // - 3: show last (page init steps will be skiped and last params of the page will be used)


            // var needInit = true;
            // if (visitedPages[url]) {
                // params = visitedPages[url];
                // needInit = false;
            // }

            // actions[url + 'Page'].update(params, needInit);

            dispatcher.dispatch({
                actionType: 'page.update',
                page: url,
                props: params
            });

            // visitedPages[url] = params;
            setUrl(url, params);
        },

        popup: {
            
            show: function(title, content, name) {
                dispatcher.dispatch({
                    actionType: 'popup.show',
                    name: name || '',
                    title: title,
                    content: content
                });
            },
            close: function () {
                dispatcher.dispatch({
                    actionType: 'popup.close'
                });
            }

        },

        confirmationPage: {
            update: function (entryParams, afterNav) {
                dispatcher.dispatch({
                    actionType: 'confirmation.page.update',
                    notice: entryParams.notice
                });
            }
        },
    };

    var visitedPages = {};

    function setUrl(page, params) {
        visitedPages[page] = params || true;

        var path = '#!' + page + (params ? '?' + h.objToQuery(params) : '');

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
        actions.route(page, params);

        // switch (page) {
        //     case '':
        //         actions.searchPage.update(params, afterNav);
        //         break;
        //     case 'get_a_quote':
        //         actions.getAQuotePage.update(params, afterNav);
        //         break;
        //     case 'email_only':
        //         actions.emailOnlyPage.update(params, afterNav);
        //         break;
        //     default:
        //         actions[page + 'Page'].update(params, afterNav);
        // }
    }

    history.bind('popstate', function (state) {
        var page = state && state.page ? state.page : null,
            params = state && state.params ? state.params : {};

        execute(page, params, true);
    });

    function start() {
        var urlData = h.queryToObj(window.location.hash);
        if (['search', 'results', 'summary'].indexOf(urlData.page) == -1) {
            urlData = {
                page: 'search',
                params: null
            };
        }
        execute(urlData.page, urlData.params, false);
    }

    return actions;
});