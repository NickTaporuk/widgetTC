define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/customerStore'
], function(
    dispatcher,
    resultsStore,
    customerStore
) {

    // private section
    var name = 'search';
    var props = {};

    // public section
    var pageStore = {
        getPageName: function() {
            return name;
        },
        getProps: function() {
            return props;
        },

        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'tire.parameters.set':
                case 'page.update':
                    name = payload.name || 'search';
                    props = payload.props || {};
                    change = true;
                    break;

                case 'results.fill':
                    dispatcher.waitFor([resultsStore.dispatchToken]);
                    if (name !== 'results') {
                        name = 'results';
                        change = true;
                    }
                    break;

                case 'quote.appointment.success':
                    name = 'quote';
                    change = true;
                    break;

                case 'quote.display.update':
                    dispatcher.waitFor([customerStore.dispatchToken, resultsStore.dispatchToken]);
                    if (name !== 'quote') {
                        name = 'quote';
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