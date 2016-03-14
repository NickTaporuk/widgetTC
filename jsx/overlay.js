define([
    'react',
    'classnames', 
    'load!stores/ajaxStore',
    'load!components/popup',
    'load!components/loading',
    'config'
], function(
    React,
    cn,
    ajaxStore,
    Popup,
    Loading,
    config
) {
    return {
        displayName: 'Overlay',

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
                    <Loading />
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