define([
    'react',
    'classnames', 
    'load!stores/ajaxStore',
    'load!stores/widgetStore',
    'load!components/popup',
    'load!components/loading',
    'config'
], function(
    React,
    cn,
    ajaxStore,
    widgetStore,
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
            this._updateState();
        },
        componentDidMount: function() {
            ajaxStore.bind('change', this._updateState);
            widgetStore.bind('change', this._updateState);
        },
        componentWillUnmount: function() {
            ajaxStore.unbind('change', this._updateState);    
            widgetStore.bind('change', this._updateState);
        },

        render: function() {
            if (!this.state.ready) {
                return null
            } else {
                return (
                    <div>
                        <Loading />
                        <Popup />
                    </div>
                )
            }
        },

        _updateState: function() {
            this.setState({
                loader: ajaxStore.isInProcess(),
                ready: widgetStore.getIsReady()
            });
        }

    }


});