define([
    'dispatcher',
    'lodash',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/customerStore',
    'load!actions/constants',
    'classnames',
    'lib/helper',
    'config'
], function(
    dispatcher,
    _,
    resultsStore,
    searchStore,
    customerStore,
    constants,
    cn,
    h,
    config
) {

    var name = '';
    var props = {};

    var lastScrollPos = {};

    function setPage(_name, _props) {
        if (true || _name !== name || !_.isEqual(_props, props)) {

            name = _name || '';
            props = _props || {};

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

                case 'order.page.update':
                    dispatcher.waitFor([customerStore.dispatchToken]);
                    change = setPage('order');
                    break;
                case 'get_a_quote.page.update':
                    change = setPage('quote');
                    break;
                case 'email_only.page.update':
                    change = setPage('email');
                    break;
                case 'email.page.update':
                    change = setPage('appointment', {type: 'email'});
                    break;
                case 'print.page.update':
                    change = setPage('appointment', {type: 'print'});
                    break;
                case 'appointment.page.update':
                    change = setPage('appointment', {type: 'appointment'});
                    break;
                case 'summary.page.update':
                    change = setPage('summary', {entryParams: payload.entryParams});
                    break;
                case 'search.page.update':
                    change = setPage('search', {entryParams: payload.entryParams});
                    break;
                case 'results.page.update':
                    dispatcher.waitFor([searchStore.dispatchToken, resultsStore.dispatchToken]);
                    change = setPage('results', {entryParams: payload.entryParams});
                    break;
                case 'confirmation.page.update':
                    change = setPage('confirmation', {notice: payload.notice});
                    break;

                case constants.REQUEST_QUOTE_SUCCESS:
                    change = setPage('results');
                    break;

                case 'quote.request.form.show':
                    dispatcher.waitFor([resultsStore.dispatchToken]);
                    payload.type = 'request';

                case constants.SEND_APPOINTMENT_SUCCESS:
                case constants.PRINT_QUOTE_SUCCESS:
                case constants.EMAIL_QUOTE_SUCCESS:
                    change = setPage('summary');
                    break;
                    

                // case 'order.payment.success':
                //     dispatcher.waitFor([customerStore.dispatchToken]);
                //     change = setPage('confirmation', {
                //         notice: payload.order.notice
                //     });
                //     break;
            }

            if (change) {
                pageStore.trigger('change');
            }
        })
    };

   

    return pageStore;
});