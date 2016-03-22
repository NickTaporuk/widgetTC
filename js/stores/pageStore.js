define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/customerStore',
    'load!actions/constants',
    'classnames',
    'lib/helper'
], function(
    dispatcher,
    resultsStore,
    customerStore,
    constants,
    cn,
    h
) {

    var name = 'search';
    var props = {};

    var lastScrollPos = {};
    // var pagesToSavePos = ['results'];

    function setPage(_name, _props) {
        if (_name !== name) {

            // save scroll pos before leave current page
            // lastScrollPos[name] = h.getScrollPos()[1];

            name = _name || 'search';
            props = _props || {};

            // if (pagesToSavePos.indexOf(name) !== -1 && lastScrollPos[name]) {
            if (lastScrollPos[name]) {
                props.lastScrollPos = lastScrollPos[name];
                delete lastScrollPos[name];
            }

            return true;
        } else {
            return false;
        }
    }

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
                case 'tire.select':
                    lastScrollPos['results'] = h.getScrollPos()[1];
                    break;

                case 'page.update':
                    change = setPage(payload.name, payload.props);
                    break;

                case constants.SEARCH_TIRES_SUCCESS:
                    dispatcher.waitFor([resultsStore.dispatchToken]);
                case constants.REQUEST_QUOTE_SUCCESS:
                    change = setPage('results');
                    break;

                case 'quote.request.form.show':
                    payload.type = 'request';
                case 'quote.appointment.form.show':
                    dispatcher.waitFor([customerStore.dispatchToken]);
                    change = setPage('appointment', {
                        type: payload.type
                    });
                    break;
                    
                case 'quote.emmail.form.show':
                    change = setPage('email');
                    break;

                case constants.LOAD_QUOTE_SUCCESS:
                    dispatcher.waitFor([customerStore.dispatchToken, resultsStore.dispatchToken]);
                case constants.SEND_APPOINTMENT_SUCCESS:
                case constants.PRINT_QUOTE_SUCCESS:
                case constants.EMAIL_QUOTE_SUCCESS:
                    change = setPage('summary');
                    break;

                case constants.ORDER_CREATE_SUCCESS:
                    if (payload.tires && payload.tires[0]) {
                        dispatcher.waitFor([customerStore.dispatchToken]);
                        change = setPage('order');
                    }
                    break;
                    
                case constants.ORDER_PAYMENT_SUCCESS:
                    dispatcher.waitFor([customerStore.dispatchToken]);
                    change = setPage('confirmation', {
                        notice: payload.notice
                    });
                    break;
            }

            if (change) {
                pageStore.trigger('change');
            }
        })
    };

   

    return pageStore;
});