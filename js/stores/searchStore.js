define([
    'dispatcher',
    'lodash'
], function(
    dispatcher,
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

    var sections = ['size', 'vehicle', 'part_number', 'common'];

    function setOptions(field, options) {
        if (options.length === 0) {
            var sectionsCount = sections.length;
            for (var i = 0; i < sectionsCount; i++) {
                if (fieldValues[sections[i]][field]) {
                    setValue(sections[i], field, '');
                    break;
                }
            }
        } else {
            if (field == 'car_tire_id') {
                setValue('vehicle', 'car_tire_id', options[0].value);
            }
        }
        
        fieldOptions[field] = options;
    }

    function setValue(section, field, value) {
        if (fieldValues[section] !== undefined && fieldValues[section][field] !== undefined) {
            fieldValues[section][field] = value;
        } else {
            throw new Error('Field "' + field + '" in section "' + section + '" not found');
        }
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
        getValueDesc: function(section, field) {
            var options = fieldOptions[field],
                value = searchStore.getValue(section, field);
                desc = null;

            optionsCount = options.length;
            for (var i = 0; i < optionsCount; i++) {
                if (options[i].value == value) {
                    desc = options[i].description;
                    break;
                }
            }

            return desc;
        },
        getAllOptions: function() {
            return _.cloneDeep(fieldOptions);
        },
        getAllValues: function() {
            return _.cloneDeep(fieldValues);
        },


        dispatchToken: dispatcher.register(function(payload) {
            switch (payload.actionType) {

                case 'search.options.update':
                    Object.keys(payload.options).map(function(fieldName) {
                        setOptions(fieldName, payload.options[fieldName]);
                    });

                    searchStore.trigger('change');
                    break;

                case 'search.field.update':
                    setValue(payload.section, payload.field, payload.value);

                    searchStore.trigger('change');
                    /*
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
                    } */
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