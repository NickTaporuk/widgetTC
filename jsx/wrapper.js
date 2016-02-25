define([
    'react',
    'reactDOM',
    'classnames', 
    'load!actions/actions',
    'load!components/header', 
    'load!components/content'
], function(
    React,
    ReactDOM,
    cn, 
    Act,
    Header, 
    Content
) {

    return {
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
                    <p className={cn('powered_by')}>Powered by <img src="/img/tireconnect-logo.png" alt="TireConnect" /></p>
                    <div className={cn('wrapper')}>
                        <Header />
                        <Content />
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