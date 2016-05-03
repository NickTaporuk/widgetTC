define([
    'react',
    'reactDOM',
    'classnames', 
    'config',
    'load!components/top',
    'load!components/header', 
    'load!components/page',
    'load!components/preloader'
], function(
    React,
    ReactDOM,
    cn, 
    config,
    Top,
    Header, 
    Page,
    Preloader
) {

    return {
        displayName: 'Wrapper',

        componentDidMount: function() {
            this._checkContainerWidth();
            if (window.addEventListener) {
              window.addEventListener('resize', this._checkContainerWidth, false);
            } else {
              window.attachEvent('onresize', this._checkContainerWidth);
            }
        },

        render: function() {
            return (
                <div id={cn('widget')}>
                    <Top />
                    <div className={cn('wrapper')}>
                        <Header />
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

});