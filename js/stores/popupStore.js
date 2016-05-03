define([
    'dispatcher',
    'load!actions/constants'
], function(
    dispatcher,
    constants
) {
    var hidden = true,
        name = '',
        title = '',
        content = '';

    var popupStore = {
        isHidden: function() {
            return hidden;
        },

        getName: function () {
            return name;
        },

        getTitle: function () {
            return title;
        },

        getContent: function () {
            return content;
        },

        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'popup.show':
                    name = payload.name;
                    title = payload.title;
                    content = payload.content;
                    hidden = false;
                    change = true;
                    break;

                case 'popup.close':
                    hidden = true;
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
                        };
                        title = (errors[error.error_code] ? errors[error.error_code] : error.notice);
                        content = '';
                    } else {
                        title = 'Sorry, an error has been occurred ):';
                        content = 'Please try again later!';
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