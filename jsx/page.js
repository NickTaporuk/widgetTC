define([
    'reactDOM',
    'lib/helper',
    'load!components/preloader',
    'load!components/page/search',
    'load!components/page/results',
    'load!components/page/summary',
    'load!components/page/quoteForm',
    'load!components/page/order',
    'load!components/page/confirmation',
    'load!components/page/quote',
    'load!components/page/emailForm',
    'react',
    'load!stores/store',
    'load!stores/pageStore',
    'load!stores/searchStore',
    'load!stores/resultsStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'load!stores/dealerStore',
    'classnames',
    'config',
    'lodash'
], function(
    ReactDOM,
    h,
    Preloader,
    Search,
    Results,
    Summary,
    QuoteForm,
    Order,
    Confirmation,
    Quote,
    EmailForm,
    React,
    store,
    pageStore,
    searchStore,
    resultsStore,
    locationsStore,
    customerStore,
    dealerStore,
    cn,
    config,
    _
) {

    var Page = {
        displayName: 'Page',

        getInitialState: function() {
            return {
                name: '',
                props: {}
            }
        },

        componentWillMount: function() {
            this._updateState();
        },

        componentDidMount: function() {
            store.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            store.unbind('change', this._updateState);
        },

        componentDidUpdate: function() {
            if (this.state.props.lastScrollPos) {
                window.scrollTo(0, this.state.props.lastScrollPos);
            } else {
                this._scrollToTop();
            }
        },

        render: function() {
            return this._getContent();
        },

        _getContent: function() {
            var content = null;

            var props = store.getProps();
            switch (this.state.name) {
                case 'search':
                    content = <Search {...props} />;
                    break;
                case 'results':
                    content = <Results {...props} />;
                    break;
                case 'summary':
                    content = <Summary {...props} />;
                    break;
                case 'quote_form':
                    content = <QuoteForm {...props} />;
                    break;
                case 'email_form':
                    content = <EmailForm {...props} />;
                    break;
                case 'get_a_quote':
                    content = <Quote {...props} />;
                    break;
                case 'order':
                    content = <Order {...props} />;
                    break;
                case 'confirmation':
                    console.log('confirm!!!');
                    content = 'OK!!!';
                    // content = <Confirmation {...props} />;
                    break;


                case 'order':
                case 'confirmation':
                    var props = {
                        quote: customerStore.getQuote(),
                        tire: customerStore.getSelectedTire(),
                        order: customerStore.getOrder(),
                        stripeKey: dealerStore.getStripeKey(),
                        vehicleInfo: searchStore.getActiveSection() == 'vehicle'
                            ? searchStore.getValue('vehicle', 'year') + ' ' + searchStore.getValue('vehicle', 'make') + ' ' + searchStore.getValue('vehicle', 'model') + ' ' + searchStore.getValue('vehicle', 'trim')
                            : null
                    };
                    if (this.state.name == 'appointment') {
                        props.type = this.state.props.type;
                        content = <Appointment {...props} />;
                    } else if (this.state.name == 'order') {
                        content = <Order {...props} />;
                    } else if (this.state.name == 'confirmation') {
                        props.location = locationsStore.getCurrentLocation();
                        content = <Confirmation {...props} />;
                    }
                    break;
                case '':
                    content = <Preloader />;
                    break;
            }

            return content;
        },

        _updateState: function () {
            this.setState({
                name: store.getPage()
            });
        },

        _scrollToTop: function() {
            var widget = document.getElementById(cn('widget'));
            h.scrollToTop(widget);
        }
    }

    return Page;
});