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
        prefix: 'tcwlw_',
        allowUrl: true,
        apikey: null,
        locationId: null,
        sessionId: null,
        isReturnedUser: null,
        sa: false,
        wlUrl: 'https://wl.tireconnect.ca',
        apiBaseUrl: 'https://wl.tireconnect.ca/api/v1/',
        scriptPlace: 'https://app.tireconnect.ca',

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
                case 'colors':
                    config.colors = value;
                    if (value && value[1]) {
                        changeColorScheme(value[0], value[1]);
                    }
                    break;
                case 'scriptPlace':
                    config.imagesFolder = value + '/img/';
                    config.mainCss = value + '/css/style.css';
                    h.loadCss( config.mainCss );
                    h.loadCss('https://fonts.googleapis.com/icon?family=Material+Icons');
                    break;
            }
        },
        setParams: function(params) {
            Object.keys(params).map(function(param){
                config.setParam(param, params[param]);
            });
        }
    };

    var style = null; //color scheme style element
    function changeColorScheme(color1, color2) {
        if (style !== null) {
            document.head.removeChild(style);
            style = null;
        }

        function addCSSRule(selector, rules, index)
        {
            index = index || 0;

            if (!style) {
                style = document.createElement("style");

                // Add a media (and/or media query) here if you'd like!
                // style.setAttribute("media", "screen")
                // style.setAttribute("media", "only screen and (max-width : 1024px)")

                // WebKit hack :(
                style.appendChild(document.createTextNode(""));

                // Add the <style> element to the page
                document.head.appendChild(style);

                this.styleSheet = style.sheet;
            }

            // add prefix for each id/class
            selector = selector
                .split('.').join('.' + config.prefix)
                .split('#').join('#' + config.prefix);


            if("insertRule" in this.styleSheet) {
                this.styleSheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if("addRule" in this.styleSheet) {
                this.styleSheet.addRule(selector, rules, index);
            }
        }

        // text color1
        addCSSRule(
            '#widget .price, ' +

            '#widget a, ' +
            '#widget_outer a, ' +

            '#widget .font_color, ' +
            '#widget_outer .font_color, ' +

            '#widget .brand_btn_light, ' +
            '#widget_outer .brand_btn_light',
            'color: '+ color1
        );

        //bg color1
        addCSSRule(
            '#widget .btn, ' +
            '#widget .brand_btn, ' +
            '#widget_outer .btn, ' +
            '#widget_outer .brand_btn, ' +

            '#widget .results .result_featured:after',
            'background-color: '+ color1
        );

        //border color1
        addCSSRule(
            '#widget .border_color',
            'border-color: ' + color1
        );

        addCSSRule(
            '#widget ul.steps_list .steps_list_item.active',
            'background-color: ' + color1 +'; ' +
            'border-color: ' + color1 +';'
        );

        //text color 2
        addCSSRule(
            '#widget a:hover, ' +
            // '#widget a:focus, ' +
            // '#widget_outer a:focus, ' +
            '#widget_outer a:hover',
            'color: ' + color2
        );
        //bg color2
        addCSSRule(
            '#widget .bg_color, ' +
            '#widget .fields_wrapper .number_widget',
            // '#widget .fields_wrapper .field:before',
            // '#widget .fields_wrapper .number_widget',
            'background-color: '+ color2
        );


        addCSSRule(
            '#widget ul.steps_list .steps_list_item',
            'background-color: ' + color2 +'; ' +
            'border-color: ' + color2 +';'
        );
    }

    return config;
});