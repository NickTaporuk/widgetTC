define([
    'dispatcher',
    'load!stores/resultsStore'
], function(
    dispatcher,
    resultsStore
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


            }

            if (change) {
                pageStore.trigger('change');
            }
        })
    };

   

    return pageStore;
});