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

       getInitialState: function() {
            return  {
                loader: true
            }
        },

        componentWillMount: function() {
            this._updateStatus();
        },
        componentDidMount: function() {
            ajaxStore.bind('change', this._updateStatus);
        },
        componentWillUnmount: function() {
            ajaxStore.unbind('change', this._updateStatus);    
        },

        render: function() {
            return (
                <div className={cn('loader')} style={ {display: this.state.loader ? 'block' : 'none' } }>
                    <img src="/img/loader.gif" alt="Loading" />
                </div>
            )
        },

        _updateStatus: function() {
            this.setStatus({
                loader: ajaxStore.isInProcess()
            });
        }

    }


});