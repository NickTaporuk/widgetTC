define([
    'dispatcher',
    'load!actions/constants'
], function(
    dispatcher,
    constants
) {

    var ajaxCount = 0;

    var ajaxStore = {
        isInProcess: function() {
            return ajaxCount > 0;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.BEFORE_REQUEST:
                    ajaxCount++;
                    change = true;
                    break;
                    
                case constants.RESPONSE_RECEIVED: 
                    ajaxCount--;
                    if (ajaxCount === 0) {
                        change = true;
                    }
                    break;
            }
            
            if (change) {
                ajaxStore.trigger('change');
            }
        })
    };

    return ajaxStore;
});