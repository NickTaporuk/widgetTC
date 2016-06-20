define(['config'],function(config){

    var style = null; //color scheme style element

    return {
        changeColorScheme: function(color1, color2) {
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
            //text color 2
            addCSSRule(
                '#widget .tab a:hover ',
                'color: ' + color1
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
    };

});