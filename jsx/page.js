define([
    'reactDOM',
    'lib/helper',
    'load!components/preloader',
    'load!components/page/search',
    'load!components/page/results',
    'load!components/page/summary',
    'load!components/page/appointment',
    'load!components/page/order',
    'load!components/page/confirmation',
    'load!components/page/quote',
    'load!components/page/email',
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
    Appointment,
    Order,
    Confirmation,
    Quote,
    Email,
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
            // this._changeState();
            this._updateState();
        },

        componentDidMount: function() {
            // pageStore.bind('change', this._changeState);
            store.bind('change', this._updateState);
        },

        componentWillUnmount: function() {
            // pageStore.unbind('change', this._changeState);
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

            switch (this.state.name) {
                case 'search':
                    var props = {
                        canChangeLocation: Object.keys(locationsStore.getLocations()).length > 1
                    };

                    content = <Search {...props} />;
                    break;
                case 'results':
                    var props = store.getProps();
                    content = <Results {...props} />;
                    break;
                case 'summary':
                    // var props = {
                    //     callNumber:   locationsStore.getCurLocConfig() ? locationsStore.getCurLocConfig().call_number : null
                    // };
                    var props = store.getProps();
                    content = <Summary {...props} />;
                    break;
                case 'appointment':
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
                case 'quote':
                    var props = {
                        followUp: customerStore.getCustomerValue('follow_up')
                    };
                    content = <Quote {...props} />;
                    break;
                case 'email':
                    var props = {
                        quote: customerStore.getQuote()
                    };
                    content = <Email {...props} />;
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

        // _changeState: function() {
        //     this.setState({
        //         name: pageStore.getPageName(),
        //         props: pageStore.getProps()
        //     });
        // },

        _scrollToTop: function() {
            var widget = document.getElementById(cn('widget'));
            h.scrollToTop(widget);
        }
    }

    return Page;
});