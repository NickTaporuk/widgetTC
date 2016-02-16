define([
    'load!components/content/search',
    'load!stores/page',
    'load!lib/classnames'
], function(
    Search,
    pageStore,
    cn
) {

    return {

        getInitialState: function() {
            return {
                name: 'search',
                props: {}
            }
        },

        componentDidMount: function() {
            pageStore.bind('change', this._changeState);
        },

        componentWillUnmount: function() {
            pageStore.unbind('change', this._changeState);
        },

        render: function() {

            return this._getContent();
        },

        _getContent: function() {

            var content = null;
            switch (this.state.name) {
                case 'search':
                    content = <Search />;
                    break;
            }

            return content;
        },

        _changeState: function() {
            this.setState({
                name: pageStore.getName(),
                props: pageStore.getProps()
            });
        }
    };

});