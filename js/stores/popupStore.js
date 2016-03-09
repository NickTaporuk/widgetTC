define([
    'dispatcher',
    'load!actions/constants'
], function(
    dispatcher,
    constants
) {

    // private section
    var name = '';
    var props = {};
    var hidden = true;

    // public section
    var popupStore = {
        getPopupName: function() {
            return name;
        },
        getProps: function() {
            return props;
        },
        isHidden: function() {
            return hidden;
        },

        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'popup.update':
                    name = payload.name || 'search';
                    props = payload.props || {};
                    hidden = false;
                    change = true;
                    break;
                case 'locations.current.change':
                case 'popup.close':
                    hidden = true;
                    change = true;
                    break;

                case constants.SEND_APPOINTMENT_SUCCESS:
                case constants.EMAIL_QUOTE_SUCCESS:
                case constants.REQUEST_QUOTE_SUCCESS:
                    name = 'alert';
                    props = {
                        title: payload.title,
                        content: payload.content
                    };
                    hidden = false;
                    change = true;
                    break;

                case constants.ERROR_RESPONSE:
                    name = 'alert';
                    var error = payload.error;
                    if (error.notice) {
                        var errors = {
                            403011: 'Sorry, rate limit has been exceeded',
                            403012: 'Sorry, widget is unavailable from your IP',
                            403013: 'Sorry, widget is unavailable from this Domain'
                        }
                        props = {
                            title: (errors[error.error_code] ? errors[error.error_code] : error.notice),
                            content: ''
                        };
                    } else {
                        props = {
                            title: 'Sorry, an error has been occurred ):',
                            content: 'Please try again later!'
                        };
                    }
                    hidden = false;
                    change = true;
                    break;
            }

            if (change) {
                popupStore.trigger('change');
            }
        })
    };

    return popupStore;
});