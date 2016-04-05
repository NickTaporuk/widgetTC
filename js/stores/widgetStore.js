define([
    'dispatcher',
    'page',
    'load!actions/constants',
    'load!stores/locationsStore',
], function(
    dispatcher,
    page,
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
            console.log(payload.actionType);
            switch (payload.actionType) {
                case constants.LOAD_LOCATIONS_SUCCESS:
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                case constants.LOAD_TIRE_PARAMETERS_SUCCESS:
                case constants.LOAD_DEALER_INFO_SUCCESS:
                case constants.GET_VEHICLE_YEARS_SUCCESS:
                case constants.LOAD_LOCATION_CONFIG_SUCCESS:
                    count++;

                    change = store.getIsReady();
                    break;
            }

            if (change) {
                store.trigger('change');

                setTimeout(function() {
                    page.start({
                        hashbang: true
                        // dispatch: false
                    });
                }, 500);

            }
        })
    };

    return store;
});