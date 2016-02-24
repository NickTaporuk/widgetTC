define([
    'dispatcher',
    'ajax'
], function(
    dispatcher,
    ajax
) {

    var locations = [];
    var currectLocation;

    function setLocations(locs) {
        locs.map(function(location) {
            locations[location.id] = location;
        });
        
        //temp code.:
        currectLocation = locs[0].id;
    }

    function setCurrentLocation(id) {
        currectLocation = id;
    }

    var locationsStore = {
        getLocation: function(id) {
            return locations[id];
        },
        getCurrentLocation: function() {
            return locations[currectLocation];
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case 'locations.init':
                    setLocations(payload.locations);
                    change = true;
                    break;
                    
                case 'locations.change': 
                    currectLocation = payload.id;
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