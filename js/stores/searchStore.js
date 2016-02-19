define([
    'dispatcher',
    'ajax',
    'lodash'
], function(
    dispatcher,
    ajax,
    _
) {

    var activeSection = 'size';

    var fieldOptions = {
        width: [],
        height: [],
        rim: [],
        speed_rating: [],
        load_index: [],
        
        year: [],
        make: [],
        model: [],
        trim: [],
        car_tire_id: [],

        base_category: [],

        display: [],
        order_by: [],

        run_flat: [],
        light_truck: [],
        brand: []
    };

    var fieldValues = {
        size: {
            width: '',
            height: '',
            rim: '',
            speed_rating: '',
            load_index: '',
            base_category: ''
        },

        vehicle: {
            year: '',
            make: '',
            model: '',
            trim: '',
            car_tire_id: '',
            base_category: ''
        },

        part_number: {
            part_number: ''
        },

        common: {
            display: '',
            order_by: '',

            run_flat: [],
            light_truck: [],
            brand: []
        }
    };

    function setOptions(field, options) {
        if (options.length > 0) {
            var argType = typeof options[0];
            
            if (argType === 'string' || argType === 'number') {
                // adjust options to needed format:
                var newOptions = [];
                options.map(function(val, i){
                    newOptions.push({
                        'value': val,
                        'description': val
                    });
                });
                options = newOptions;
            }
        }
        fieldOptions[field] = options;
    }

    function setValue(section, field, value) {
        fieldValues[section][field] = value;
    }

    // public section
    var searchStore = {
        getActiveSection: function() {
            return activeSection;
        },
        getSectionValues: function(section) {
            return _.cloneDeep(fieldValues[section]);
        },
        getValue: function(section, field) {
            return fieldValues[section][field];
        },
        getOptions: function(field) {
            return _.cloneDeep(fieldOptions[field]);
        },
        getAllOptions: function() {
            return _.cloneDeep(fieldOptions);
        },
        getAllValues: function() {
            return _.cloneDeep(fieldValues);
        },


        dispatcherToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {

                case 'init':
                    ajax.make({
                        url: 'tire/parameters',
                        success: function(response) {
                            Object.keys(response.data).map(function(fieldName) {
                                setOptions(fieldName, response.data[fieldName]);      
                            });

                            searchStore.trigger('change');
                        }
                    });

                    ajax.make({
                        url: 'vehicle/years',
                        data: data,
                        success: function(response) {
                            setOptions('year', response.data.values);
                            searchStore.trigger('change');
                        }
                    });
                    break;

                case 'search.field.update':
                    setValue(payload.section, payload.field, payload.value);

                    if (payload.section === 'vehicle' && payload.field !== 'car_tire_id' && payload.field !== 'base_category') {
                        var data = {};
                        var stopDataCollect = false;
                        var fieldToFill;
                        var vehicleFields = ['year', 'make', 'model', 'trim', 'car_tire_id'];

                        vehicleFields.map(function(fieldName) {
                            if (!stopDataCollect) {
                                data[fieldName] = searchStore.getValue('vehicle', fieldName);

                                if (fieldName == payload.field) {
                                    stopDataCollect = true;
                                }
                            } else {
                                setOptions(fieldName, []);
                                setValue('vehicle', fieldName, '');

                                if (!fieldToFill) {
                                    fieldToFill = fieldName;
                                }
                            }
                        });

                        if (payload.value) {
                            ajax.make({
                                url: 'vehicle/' + ( fieldToFill == 'car_tire_id' ? 'tireSizes' : (fieldToFill + 's') ),
                                data: data,
                                success: function(response) {
                                    var options = [];
                                    if (fieldToFill == 'car_tire_id') {
                                        response.data.values.map(function(option) {
                                            options.push({
                                                value: option.cartireid,
                                                description: option.fitment + ' ' + option.size_description
                                            });
                                        });
                                        setValue('vehicle', 'car_tire_id', options[0]['value']);
                                    } else {
                                        options = response.data.values;
                                    }

                                    setOptions(fieldToFill, options);
                                    searchStore.trigger('change');
                                }
                            });
                        } else {
                            searchStore.trigger('change');
                        }
                    } else {
                        searchStore.trigger('change');
                    }
                    break;

                case 'search.active_section.update':
                    activeSection = payload.section;
                    searchStore.trigger('change');
                    break;
            }
        })
    };

    return searchStore;
});