define([
    'reactDOM',
    'lib/helper',
    'load!components/page/search',
    'load!components/page/results',
    'load!components/page/summary',
    'load!components/page/quoteForm',
    'load!components/page/order',
    'load!components/page/confirmation',
    'load!components/page/quote',
    'load!components/page/emailForm',
    'react',
    'load!stores/pageStore',
    'load!stores/appStore',
    'classnames',
    'config',
    'lodash'
], function(
    ReactDOM,
    h,
    Search,
    Results,
    Summary,
    QuoteForm,
    Order,
    Confirmation,
    Quote,
    EmailForm,
    React,
    pageStore,
    appStore,
    cn,
    config,
    _
) {

    var Page = {
        displayName: 'page',

        getInitialState: function() {
            return {
                name: '',
                content: null
            }
        },

        componentWillMount: function() {
            this._updateState();
        },

        componentDidMount: function() {
            pageStore.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            pageStore.unbind('change', this._updateState);
        },

        componentDidUpdate: function(prevProps, prevState) {
            if (prevState.name !== this.state.name) {
                this._scrollToTop();
            }
        },

        render: function() {
            var pageComponent = this._getPageComponent();
            var pageProps = pageStore.getProps();
            if (pageProps == null) pageProps = {};
            pageProps.ref = 'page';

            return pageComponent ? React.createElement(pageComponent, pageProps) : null;
        },

        _updateState: function () {
            var self = this,
                pageComponent = this._getPageComponent();

            if (pageComponent && typeof pageComponent.prepare == 'function') {

                if (this.state.name && this.state.name !== pageStore.getPage()) {
                    // save current page data:
                    appStore.savePageData(this.refs.page);
                }

                pageComponent.prepare(pageStore.getProps(), (pageStore.getPage() == this.state.name)).then(function(){
                    // change or update page after it has been prepared:
                    self.setState({
                        name: pageStore.getPage()
                    });
                });
            } else {
                this.setState({
                    name: pageStore.getPage()
                });
            }
        },

        _getPageComponent: function() {
            var component = null;
            switch (pageStore.getPage()) {
                case 'search':
                    component = Search;
                    break;
                case 'results':
                    component = Results;
                    break;
                case 'summary':
                    component = Summary;
                    break;
                case 'quote_form':
                    component = QuoteForm;
                    break;
                case 'email_form':
                    component = EmailForm;
                    break;
                case 'get_a_quote':
                    component = Quote;
                    break;
                case 'order':
                    component = Order;
                    break;
                case 'confirmation':
                    component = Confirmation;
                    break;
            }
            return component;
        },

        _scrollToTop: function() {
            var widget = document.getElementById(cn('widget'));
            h.scrollToTop(widget);
        }
    };

    return Page;
});