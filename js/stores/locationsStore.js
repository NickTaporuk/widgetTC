define([
    'dispatcher',
    'ajax',
    'lodash'
], function(
    dispatcher,
    ajax,
    _
) {

    var locations = [];
    var currectLocation;

    function setLocations(locs) {
        locs.map(function(location) {
            locations[location.id] = location;
        });
        
        if (locs.length == 1) {
            currectLocation = locs[0].id;
        }
    }

    function setCurrentLocation(id) {
        currectLocation = id;
    }

    var locationsStore = {
        getLocation: function(id) {
            return locations[id];
        },
        getLocations: function() {
            return locations;
        },
        getCurrentLocation: function() {
            return this.getLocation(currectLocation);
        },

        dispatchToken: dispatcher.register(function(payload) {
            change = false;
            switch (payload.actionType) {
                case 'locations.init':
                    setLocations(payload.locations);
                    change = true;
                    break;
                    
                case 'locations.current.change': 
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