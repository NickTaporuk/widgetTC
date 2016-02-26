define([
    'react',
    'classnames', 
    'load!stores/ajaxStore',
    'load!components/popup',
], function(
    React,
    cn,
    ajaxStore,
    Popup
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
                <div>
                    <div className={cn('loader')} style={ {display: this.state.loader ? 'block' : 'none' } }>
                        <img src="/img/loader.gif" alt="Loading" />
                    </div>
                    <Popup />
                </div>
            )
        },

        _updateStatus: function() {
            this.setState({
                loader: ajaxStore.isInProcess()
            });
        }

    }


});