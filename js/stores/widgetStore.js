define([
    'dispatcher',
    'load!actions/constants'
], function(
    dispatcher,
    constants
) {
    var stepsForReady = 4;
    var currentStepToReady = 0;

    var store = {
        getIsReady: function() {
            return currentStepToReady == stepsForReady;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.LOAD_LOCATIONS_SUCCESS:
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                case constants.LOAD_TIRE_PARAMETERS_SUCCESS:
                case constants.LOAD_DEALER_INFO_SUCCESS:
                case constants.GET_VEHICLE_YEARS_SUCCESS:
                    currentStepToReady++;
                    
                    change = true;
                    break;
                
                // case constants.SESSION_SET_SUCCESS:
                    // change = true;
            }

            if (change) {
                store.trigger('change');
            }
        })
    };

    return store;
});