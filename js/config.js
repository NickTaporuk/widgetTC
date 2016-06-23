define([
    'lockr',
    'lib/helper',
    'classnames'
], function(
    lockr,
    h,
    cn
) {

    var isSessionIdSetted = function() {
        // true if last sesstion id was created less than "expireAfter" days ago.
        var lastSesstionId = lockr.get('sessionId');
        var expireAfter = 1000*60*60*24*3; // 3 days in milliseconds
        return (lastSesstionId && (Date.now() - lockr.get('sessionIdCreatedAt')) < expireAfter);
    };

    var isReturnedUser = function() {
        return lockr.get('sessionId') ? true : false;
    };
    
    var config = {
        //user settings
        apikey: null,
        allowUrl: true,
        sa: false,

        clientType: 0,
        defaultCategory: '',
        defaultNumbersOfTires: 4,
        defaultOrder: 'best_match',
        defaultQuoteCallBack: false,
        defaultSearching: 'by_vehicle',
        itemsPerPage: 6,
        showInStock: true,
        showTireconnectLogo: false,
        colors: null,

        locationId: null, // sets by locator

        // calculated settings:
        mainCss: '',
        sessionId: null,
        isReturnedUser: null,

        // another settings
        prefix: 'tcwlw_',

        wlUrl: 'https://wl.tireconnect.ca',
        apiBaseUrl: 'https://wl.tireconnect.ca/api/v1/',
        scriptPlace: 'https://app.tireconnect.ca',
        maxSizeCompareTires: 3,

        init: function(params) {
            if (!params.apikey) {
                throw new Error('Api key is required');
            }
            if (!params.container) {
                throw new Error('Container is required');
            }

            cn.prefix = config.prefix;

            config.setParam('scriptPlace', params.scriptPlace ? params.scriptPlace : config.scriptPlace);
            delete params.scriptPlace;
            config.setParams(params);
        },

        // methods to change params
        setParam: function(param, value) {
            config[param] = value;
            switch (param) {
                case 'apikey':
                    lockr.prefix = config.prefix + config.apikey;

                    config.sessionId = isSessionIdSetted() ? lockr.get('sessionId') : null;
                    config.isReturnedUser = isReturnedUser();
                    break;
                case 'sessionId':
                    if (!isSessionIdSetted()) {
                        lockr.set('sessionId', value);
                        lockr.set('sessionIdCreatedAt', Date.now());
                    }
                    break;
                case 'scriptPlace':
                    config.imagesFolder = value + '/img/';
                    config.mainCss = value + '/css/style.css';
                    break;
            }
        },
        setParams: function(params) {
            Object.keys(params).map(function(param){
                config.setParam(param, params[param]);
            });
        }
    };

    return config;
});