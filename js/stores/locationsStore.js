define([
    'dispatcher',
    'lodash',
    'lockr',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    lockr,
    constants
) {
    var locations = {};
    var locsConfig = {};

    var currectLocationId;
    

    if (lockr.get('location_id')) {
        currectLocationId = lockr.get('location_id');
    }

    function setLocations(locs) {
        locs.map(function(location) {
            locations[location.id] = location;
            // generate default config for location
            if (!locsConfig[location.id]) {
                locsConfig[location.id] = {
                    call_number: null
                }
            }
        });
        
        if (locs.length == 1) {
            currectLocationId = locs[0].id;
        }
    }

    function setCurrentLocation(id) {
        currectLocationId = id;
    }

    var locationsStore = {
        getLocation: function(id) {
            return locations[id];
        },
        getLocations: function() {
            return locations;
        },
        getCurrentLocation: function() {
            return currectLocationId ? this.getLocation(currectLocationId) : null;
        },
        getCurLocId: function() {
            return currectLocationId;
        },
        getCurLocConfig: function() {
            return locsConfig[currectLocationId] ? locsConfig[currectLocationId] : null;
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case constants.LOAD_LOCATIONS_SUCCESS:
                    setLocations(payload.locations);
                    change = true;
                    break;

                case constants.LOAD_LOCATION_CONFIG_SUCCESS:
                    locsConfig[currectLocationId] = payload.config;
                    change = true;
                    break;
                    
                case 'locations.current.change': 
                    currectLocationId = payload.id;
                    lockr.set('location_id', currectLocationId);
                    change = true;
                    break;
            }
            
            if (change) {
                locationsStore.trigger('change');
            }
        })
    };

    return locationsStore;
});