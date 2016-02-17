define([
    'dispatcher'
], function(
    dispatcher
) {

    // private section
    var fields = {
        tab: {},

        size: {
            width: {
                value: '',
                options: []
            },
            height: {},
            rim: {},
            speed_rating: {},
            load_index: {},
        },

        vehicle: {
            year: {
                value: '',
                options: []
            },
            make: {
                depends: 'year'  // if year is not selected the field is disabled
            },
            model: {
                depends: 'make'
            },
            trim: {
                depends: 'model'
            },
            car_tire_id: {
                depends: 'trim'
            }
        }
    }


    // public section
    var searchStore = {
        getName: function() {
            return _name;
        },
        getProps: function() {
            return _props;
        }
    };

    dispatcher.register(function(payload) {
        switch (payload.actionType) {
            case 'init':
                //ajax call to get options
                break;
            case 'search-update_size_param':
                break;
            case 'search-update_vehicle_param':
                //ajax call for options of next field
                break;

        }
        searchStore.trigger('change');
    });

    return searchStore;
});