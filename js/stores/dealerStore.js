define([
    'dispatcher',
    'lodash',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    constants
) {

    var ecommerce = {
        stripe: {
            key: null
        }
    };

    var showTCLogo = true;

    var companyName;
    var logo;

    var style = null; //color scheme style element
    function changeColorScheme(color1, color2) {
        if (style !== null) {
            document.head.removeChild(style);
            style = null;
        }

        function addCSSRule(selector, rules, index) 
        {
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
            // selector = ('.widget ' + selector)
            //             .split(',').join(', .widget')
            //             .split('.').join('.' + config.prefix)
            //             .split('#').join('#' + config.prefix);

            if("insertRule" in this.styleSheet) {
                this.styleSheet.insertRule(selector + "{" + rules + "}", index);
            }
            else if("addRule" in this.styleSheet) {
                this.styleSheet.addRule(selector, rules, index);
            }
        }

        // text color1
        addCSSRule(
            '#tcwlw_widget a, ' + 
            '#tcwlw_widget_outer a, ' +

            '#tcwlw_widget .tcwlw_font_color, ' +
            '#tcwlw_widget_outer .tcwlw_font_color ' +
            
            '#tcwlw_widget .tcwlw_brand_btn_light, ' +
            '#tcwlw_widget_outer .tcwlw_brand_btn_light',
                'color: '+ color1
        );

        //bg color1
        addCSSRule(
            '#tcwlw_widget .tcwlw_btn, ' +
            '#tcwlw_widget .tcwlw_brand_btn, ' +
            '#tcwlw_widget_outer .tcwlw_btn, ' +
            '#tcwlw_widget_outer .tcwlw_brand_btn, ' +

            '#tcwlw_widget .tcwlw_results .tcwlw_result_featured:after',
                'background-color: '+ color1
        );

        //border color1
        addCSSRule(
            '#tcwlw_widget .tcwlw_border_color',
                'border-color: ' + color1
        );

        addCSSRule(
            '#tcwlw_widget .tcwlw_steps_list .tcwlw_steps_list_item.tcwlw_active',
                'background-color: ' + color1 +'; ' +
                'border-color: ' + color1 +';'
        );

        //text color 2 
        addCSSRule(
            '#tcwlw_widget a:hover, ' +
            '#tcwlw_widget a:focus, ' +
            '#tcwlw_widget_outer a:hover, ' +
            '#tcwlw_widget_outer a:focus',
                'color: ' + color2
        );

        //bg color2
        addCSSRule(
            '#tcwlw_widget .tcwlw_bg_color, ' +
            '#tcwlw_widget .tcwlw_fields_wrapper .tcwlw_field:before',
                'background-color: '+ color2
        );

    
        addCSSRule(
            '#tcwlw_widget .tcwlw_steps_list .tcwlw_steps_list_item',
                'background-color: ' + color2 +'; ' +
                'border-color: ' + color2 +';'
        );
    }

    var store = {
        getStripeKey: function(id) {
            return ecommerce.stripe.key;
        },
        getShowTCLogo: function() {
            return showTCLogo;
        },
        getCompanyName: function() {
            return companyName;
        },
        getLogo: function() {
            return logo;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                    var c = payload.config;
                    if (c.ecommerce.enabled && c.ecommerce.services && c.ecommerce.services.stripe) {
                        ecommerce.stripe.key = c.ecommerce.services.stripe.publishable_key;
                        change = true;
                    }
                    showTCLogo = c.show_tireconnect_logo;
                    changeColorScheme('#' + c.colors.color1, '#' + c.colors.color2);
                    break;

                case constants.LOAD_DEALER_INFO_SUCCESS:
                    companyName = payload.info.company_name;
                    logo = payload.info.logo;
                    change = true;
                    break;
            }
            
            if (change) {
                store.trigger('change');
            }
        })
    };

    return store;
});