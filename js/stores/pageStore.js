define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/customerStore',
    'load!actions/constants'
], function(
    dispatcher,
    resultsStore,
    customerStore,
    constants
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
                // case constants.LOAD_TIRE_PARAMETERS_SUCCESS:
                case 'page.update':
                    name = payload.name || 'search';
                    props = payload.props || {};
                    change = true;
                    break;

                case constants.SEARCH_TIRES_SUCCESS:
                    dispatcher.waitFor([resultsStore.dispatchToken]);
                    if (name !== 'results') {
                        name = 'results';
                        change = true;
                    }
                    break;

                case 'quote.request.form.show':
                    payload.type = 'request';
                case 'quote.appointment.form.show':
                    dispatcher.waitFor([customerStore.dispatchToken]);
                    name = 'appointment';
                    props = {
                        type: payload.type
                    };
                    change = true;
                    break;

                case constants.SEND_APPOINTMENT_SUCCESS:
                case constants.PRINT_QUOTE_SUCCESS:
                case constants.EMAIL_QUOTE_SUCCESS:
                    name = 'summary';
                    change = true;
                    break;
                    
                case constants.REQUEST_QUOTE_SUCCESS:
                    name = 'results';
                    change = true;
                    break;

                case constants.ORDER_CREATE_SUCCESS:
                    if (payload.tires && payload.tires[0]) {
                        dispatcher.waitFor([customerStore.dispatchToken]);
                        name = 'order';
                        change = true;
                    }
                    break;

                case constants.LOAD_QUOTE_SUCCESS:
                    dispatcher.waitFor([customerStore.dispatchToken, resultsStore.dispatchToken]);
                    if (name !== 'summary') {
                        name = 'summary';
                        change = true;
                    }
                    break;

                case constants.ORDER_PAYMENT_SUCCESS:
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