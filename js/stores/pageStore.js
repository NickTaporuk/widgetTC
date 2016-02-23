define([
    'dispatcher',
    'load!stores/resultsStore'
], function(
    dispatcher,
    resultsStore
) {

    // private section
    var _name = 'search';
    var _props = {};


    // public section
    var pageStore = {
        getPageName: function() {
            return _name;
        },
        getProps: function() {
            return _props;
        },

        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'page.update':
                    _name = payload.name || 'search';
                    _props = payload.props || {};
                    change = true;
                    break;

                case 'results.fill':
                    dispatcher.waitFor([resultsStore.dispatchToken]);
                    if (_name !== 'results') {
                        _name = 'results';
                        change = true;
                    }
                    break;


            }

            if (change) {
                pageStore.trigger('change');
            }
        })
    };

   

    return pageStore;
});