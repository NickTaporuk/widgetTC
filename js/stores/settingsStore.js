define([
    'dispatcher'
], function(
    dispatcher
) {

    var store = {
        isInProcess: function() {
            return ajaxCount > 0;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            
            if (change) {
                store.trigger('change');
            }
        })
    };

    return store;
});