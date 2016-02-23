define([
    'load!components/content/search',
    'load!components/content/results',
    'react',
    'load!stores/pageStore',
    'load!stores/searchStore',
    'load!stores/resultsStore',
    'classnames'
], function(
    Search,
    Results,
    React,
    pageStore,
    searchStore,
    resultsStore,
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
                            brands: searchStore.getOptions('brand'),
                            run_flat: searchStore.getOptions('run_flat'),
                            light_truck: searchStore.getOptions('light_truck')
                        },
                        queryParams: queryParams,
                        totalCount: resultsStore.getTotalCount(),
                        tires: resultsStore.getTires()
                    }
                    content = <Results {...props} />
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