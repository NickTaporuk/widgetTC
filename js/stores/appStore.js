define([
    'lodash',
    'moment'
], function(
    _,
    moment
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
            return pageState[page] ?  _.cloneDeep(pageState[page]) : null;
        },

        getPageProps: function (pageComponent) {
            var page = typeof pageComponent == 'string' ? pageComponent : pageComponent.constructor.displayName;
            return pageProps[page] ? _.cloneDeep(pageProps[page]) : null;
        },

        savePageData: function (pageComponent) {
            store.savePageState(pageComponent, pageComponent.state);
            store.savePageProps(pageComponent, pageComponent.props);
        },

        savePageState: function (pageComponent, state) {
            pageState[pageComponent.constructor.displayName] = state;
        },

        savePageProps: function (pageComponent, props) {
            pageProps[pageComponent.constructor.displayName] = props;
        },

        setCustomerInfo : function(info) {
            _.merge(customerInfo,info);
        },

        getCustomerInfo : function(name) {
            return name ? customerInfo[name] : customerInfo;
        },
    };

    return store;

});