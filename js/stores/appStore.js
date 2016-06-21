define([
    'lodash',
    'lockr'
], function(
    _,
    lockr
) {
    var pageState = {};
    var pageProps = {};

    var observers = [];

    var store = {
        getPageState: function (pageComponent) {
            var page = typeof pageComponent == 'string' ? pageComponent : pageComponent.constructor.displayName;
            return pageState[page] ?  _.cloneDeep(pageState[page]) : (lockr.get('state_' + page) || null);
        },

        getPageProps: function (pageComponent) {
            var page = typeof pageComponent == 'string' ? pageComponent : pageComponent.constructor.displayName;
            return pageProps[page] ? _.cloneDeep(pageProps[page]) : (lockr.get('props_' + page) || null);
        },

        savePageData: function (pageComponent, saveInStorage) {
            store.savePageState(pageComponent, pageComponent.state, saveInStorage);
            store.savePageProps(pageComponent, pageComponent.props, saveInStorage);

            observers.forEach(function(observer) {
                observer.update(pageComponent);
            });
        },

        savePageState: function (pageComponent, state, saveInStorage) {
            var name = pageComponent.constructor.displayName;
            if (saveInStorage) {
                lockr.set('state_' + name, state);
            } else {
                pageState[name] = state;
            }
        },

        savePageProps: function (pageComponent, props, saveInStorage) {
            var name = pageComponent.constructor.displayName;
            if (saveInStorage) {
                lockr.set('props_' + name, props);
            } else {
                pageProps[name] = props;
            }
        },

        addObserver: function(observer) {
            observers.push(observer);
        }
    };

    return store;

});