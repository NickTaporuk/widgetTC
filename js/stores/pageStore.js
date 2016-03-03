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

                case 'quote.appointment.form.show':
                    dispatcher.waitFor([customerStore.dispatchToken]);
                    name = 'appointment';
                    props = {
                        type: payload.type
                    };
                    change = true;
                    break;

                case 'quote.print.success':
                case 'quote.email.success':
                case 'quote.appointment.success':
                    name = 'summary';
                    change = true;
                    break;

                case 'order.create.success':
                    if (payload.tires && payload.tires[0]) {
                        dispatcher.waitFor([customerStore.dispatchToken]);
                        name = 'order';
                        change = true;
                    }
                    break;

                case 'quote.display.update':
                    dispatcher.waitFor([customerStore.dispatchToken, resultsStore.dispatchToken]);
                    if (name !== 'summary') {
                        name = 'summary';
                        change = true;
                    }
                    break;

                case 'order.payment.success':
                    dispatcher.waitFor([customerStore.dispatchToken]);
                    name = 'confirmation';
                    props.notice = payload.notice;
                    change = true;
                    break;
            }

            if (change) {
                pageStore.trigger('change');
            }
        })
    };

   

    return pageStore;
});