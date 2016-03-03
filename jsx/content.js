define([
    'load!components/content/search',
    'load!components/content/results',
    'load!components/content/summary',
    'load!components/content/appointment',
    'load!components/content/order',
    'load!components/content/confirmation',
    'load!components/content/quote',
    'react',
    'load!stores/pageStore',
    'load!stores/searchStore',
    'load!stores/resultsStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'load!stores/dealerStore',
    'classnames'
], function(
    Search,
    Results,
    Summary,
    Appointment,
    Order,
    Confirmation,
    Quote,
    React,
    pageStore,
    searchStore,
    resultsStore,
    locationsStore,
    customerStore,
    dealerStore,
    cn
) {

    return {

        getInitialState: function() {
            return {
                name: '',
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
                    var props = {
                        canChangeLocation: locationsStore.getLocations().length > 1
                    };

                    content = <Search {...props} />;
                    break;
                case 'results':
                    var tab = searchStore.getActiveSection();
                    var queryParams = {first: '', second: '', third: ''};
                    switch (tab) {
                        case 'size':
                            queryParams = {
                                first: searchStore.getValueDesc(tab, 'base_category'),
                                second: searchStore.getValueDesc(tab, 'width') + '/' + searchStore.getValueDesc(tab, 'height') + 'R' + searchStore.getValueDesc(tab, 'rim'),
                            }
                            break;

                        case 'vehicle':
                            queryParams = {
                                first: searchStore.getValueDesc(tab, 'year') + ' ' + searchStore.getValueDesc(tab, 'make') + ' ' + searchStore.getValueDesc(tab, 'model') + ' ' + searchStore.getValueDesc(tab, 'trim'),
                                second: searchStore.getValueDesc(tab, 'base_category'),
                                third: searchStore.getValueDesc(tab, 'car_tire_id')
                            }
                            break;

                        case 'part_number':
                             queryParams = {
                                first: searchStore.getValue(tab, 'part_number')
                             }
                             break;
                    }
                    var props = {
                        fieldOptions: {
                            display: searchStore.getOptions('display'),  
                            order_by: searchStore.getOptions('order_by'),
                            brand: searchStore.getOptions('brand'),
                            run_flat: searchStore.getOptions('run_flat'),
                            light_truck: searchStore.getOptions('light_truck')
                        },
                        fieldValues: {
                            display: searchStore.getValue('common', 'display'),
                            order_by: searchStore.getValue('common', 'order_by'),
                            brand: searchStore.getValue('common', 'brand'),
                            run_flat: searchStore.getValue('common', 'run_flat'),
                            light_truck: searchStore.getValue('common', 'light_truck')
                        },
                        queryParams: queryParams
                    };
                    content = <Results {...props} />
                    break;
                case 'summary':
                    var props = {
                        tire: customerStore.getSelectedTire(),
                        withOrderBtn: dealerStore.getStripeKey() !== null
                    };
                    content = <Summary {...props} />
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
                        content = <Appointment {...props} />
                    } else if (this.state.name == 'order') {
                        content = <Order {...props} />
                    } else if (this.state.name == 'confirmation') {
                        props.location = locationsStore.getCurrentLocation();
                        content = <Confirmation {...props} />
                    }
                    break;
                case 'quote':
                    content = <Quote />
            }

            return content;
        },

        _changeState: function() {
            this.setState({
                name: pageStore.getPageName(),
                props: pageStore.getProps()
            });
        }
    };

});