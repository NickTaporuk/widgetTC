define([
    'react',
    'reactDOM',
    'classnames', 
    'config',
    'load!components/top',
    'load!components/header', 
    'load!components/page',
    'load!components/preloader',
    'actions/api'
], function(
    React,
    ReactDOM,
    cn, 
    config,
    Top,
    Header, 
    Page,
    Preloader,
    Api
) {

    var component = {
        displayName: 'Wrapper',

        getInitialState: function() {
            return {
                ready: false
            }
        },

        componentDidMount: function() {
            this._checkContainerWidth();
            if (window.addEventListener) {
              window.addEventListener('resize', this._checkContainerWidth, false);
            } else {
              window.attachEvent('onresize', this._checkContainerWidth);
            }
            var self = this;
            Api.loadDealerConfig().then(function(response) {
                if (response.colors && response.colors.color1) {
                    changeColorScheme('#' + response.colors.color1, '#' + response.colors.color2);
                }
                self.setState({
                    ready: true
                });
            });
        },

        render: function() {
            return (
                <div id={cn('widget')}>
                    <Top />
                    <div className={cn('wrapper')}>
                        {this.state.ready ? <Header /> : null}
                        <Preloader />
                        <Page />
                    </div>
                </div>
            );
        },

        _checkContainerWidth: function() {
            var el = ReactDOM.findDOMNode(this)
            var tireconnect = el.parentElement,
                tireconnectWidth = tireconnect.offsetWidth;

            if (tireconnectWidth >= 1024) {
                tireconnect.setAttribute('data-tcwlw-w', 't s m l');
            } else if (tireconnectWidth < 1024 && tireconnectWidth >= 768) {
                tireconnect.setAttribute('data-tcwlw-w', 't s m');
            } else if (tireconnectWidth < 768 && tireconnectWidth >= 600) {
                tireconnect.setAttribute('data-tcwlw-w', 't s');
            } else {
                tireconnect.setAttribute('data-tcwlw-w', 't');
            }
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
            '#widget .fields_wrapper .field:before',
            'background-color: '+ color2
        );


        addCSSRule(
            '#widget ul.steps_list .steps_list_item',
            'background-color: ' + color2 +'; ' +
            'border-color: ' + color2 +';'
        );
    }
    
    return component;
});