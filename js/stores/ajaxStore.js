define([
    'dispatcher'
], function(
    dispatcher
) {

    var ajaxCount = 0;

    var ajaxStore = {
        isInProcess: function() {
            return ajaxCount > 0;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case 'ajax.beforeSend':
                    ajaxCount++;
                    // setLocations(payload.locations);
                    change = true;
                    break;
                    
                case 'ajax.complete': 
                    ajaxCount--;
                    // currectLocation = payload.id;
                    if (ajaxCount == 0) {
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