define([
    'dispatcher'
], function(
    dispatcher
) {

    var settingsStore = {
        isInProcess: function() {
            return ajaxCount > 0;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case 'ajax.beforeSend':
                    break;
            }
            
            if (change) {
                settingsStore.trigger('change');
            }
        })
    };

    return settingsStore;
});