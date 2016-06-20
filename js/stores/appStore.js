define([
    'lodash',
    'moment',
    'lockr'
], function(
    _,
    moment,
    lockr
) {
    var pageState = {};
    var pageProps = {};
    //customer data storage
    var customerInfo = {
        name            : '',
        email           : '',
        phone           : '',
        way_to_contact  : 'phone',
        notes           : '',
        preferred_time  : moment().add(1, 'd').minutes(0).hour(13).format('YYYY-MM-DD HH:mm'),
        vehicle: {
            year    : '',
            make    : '',
            model   : '',
            trim    : ''
        }
    };

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

        setCustomerInfo : function(info) {
            _.merge(customerInfo,info);
        },

        getCustomerInfo : function(name) {
            return name ? customerInfo[name] : customerInfo;
        }
    };

    return store;

});