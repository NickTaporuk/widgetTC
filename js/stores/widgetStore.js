define([
    'dispatcher',
    'load!actions/constants',
    'load!stores/locationsStore',
], function(
    dispatcher,
    constants,
    locationsStore
) {
    var curLocId = locationsStore.getCurLocId();

    var eventsForReady = curLocId ? 6 : 5;
    var count = 0;

    var store = {
        getIsReady: function() {
            return count >= eventsForReady;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.LOAD_LOCATIONS_SUCCESS:
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                case constants.LOAD_TIRE_PARAMETERS_SUCCESS:
                case constants.LOAD_DEALER_INFO_SUCCESS:
                case constants.GET_VEHICLE_OPTIONS_SUCCESS:
                case constants.LOAD_LOCATION_CONFIG_SUCCESS:
                    if (!store.getIsReady()) {
                        count++;

                        change = store.getIsReady();
                    }
                    break;
            }

            if (change) {
                setTimeout(function() {
                    store.trigger('change');
                }, 1);
            }
        })
    };

    return store;
});