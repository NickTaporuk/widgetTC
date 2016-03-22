define([
    'dispatcher',
    'lodash',
    'load!stores/vehicleStore',
    'load!actions/constants'
], function(
    dispatcher,
    _,
    vehicleStore,
    constants
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

    var defaultValues = {};

    var fieldValues = {
        size: {
            width: '195',
            height: '65',
            rim: '15',
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
            brand: [],
            category: []
        }
    };

    var sections = ['size', 'vehicle', 'part_number', 'common'];

    function setDefaultValue(field) {
        var options;
        if (field == 'car_tire_id') {
            options = fieldOptions.car_tire_id;
            setValue('vehicle', 'car_tire_id', options[0].value);
        } else if (field == 'display') {
            options = fieldOptions.display;
            setValue('common', 'display', options[0].value);
        } else if (field == 'brand' || field == 'run_flat' || field == 'light_truck' || field == 'category') {
            options = fieldOptions[field];
            var value = [];
            // options.forEach(function(option, i, options) {
            //     value.push(option.value);
            // });
            setValue('common', field, []);
        }
    }

    function setOptions(field, options) {
        if (options.length === 0) {
            // if no options set value of field to empty
            var sectionsCount = sections.length;
            for (var i = 0; i < sectionsCount; i++) {
                if (fieldValues[sections[i]][field]) {
                    setValue(sections[i], field, '');
                    break;
                }
            }
            fieldOptions[field] = [];
        } else {
            fieldOptions[field] = options;
            setDefaultValue(field);
        }
    }

    function setValue(section, field, value) {
        if (fieldValues[section] !== undefined && fieldValues[section][field] !== undefined) {
            fieldValues[section][field] = value;
        } else {
            throw new Error('Field "' + field + '" in section "' + section + '" not found');
        }
    }

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
        // getParamsForSearch: function(isClarifying) {
        //     if (!isClarifying) {
        //         //set filter for category
        //     } else {

        //     }
        // },

        dispatchToken: dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case constants.LOAD_TIRE_PARAMETERS_SUCCESS:
                case 'search.options.update':
                    Object.keys(payload.options).map(function(fieldName) {
                        setOptions(fieldName, payload.options[fieldName]);
                    });
                    change = true;
                    break;
                case 'search.field.update':
                    setValue(payload.section, payload.field, payload.value);
                    change = true;
                    break;
                case 'search.vehicle.change':
                    Object.keys(payload.values).map(function(fieldName) {
                        setValue('vehicle', fieldName, payload.values[fieldName]);
                    });
                    change = true;
                    break;
                case 'tire.search':
                    if (payload.step == 1) {
                        setDefaultValue('display');
                        setDefaultValue('brand');
                        setDefaultValue('run_flat');
                        setDefaultValue('light_truck');
                        setDefaultValue('category');

                        // set filter by category base on base_category
                        var baseCategoriesLength = fieldOptions.base_category.length;
                        for (var i = 0; i < baseCategoriesLength; i++) {
                            if (fieldValues[activeSection].base_category == fieldOptions.base_category[i]['value']) {
                                fieldValues['common']['category'] = fieldOptions.base_category[i]['categories'];
                                break;
                            }
                        }
                    }
                    change = true;
                    break;
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                    var c = payload.config;
                    if (c.default_order) {
                        setValue('common', 'order_by', c.default_order);
                    }
                    setValue('size', 'base_category', c.default_base_category);
                    setValue('vehicle', 'base_category', c.default_base_category);
                    if (c.default_searching) {
                        activeSection = c.default_searching.replace('by_', '');
                    }
                    change = true;
                    break;
                    
                case 'search.active_section.update':
                    activeSection = payload.section;
                    change = true;
                    break;

                case constants.GET_VEHICLE_YEARS_SUCCESS:
                case constants.GET_VEHICLE_MAKES_SUCCESS:
                case constants.GET_VEHICLE_MODELS_SUCCESS:
                case constants.GET_VEHICLE_TRIMS_SUCCESS:
                case constants.GET_VEHICLE_TIRES_SUCCESS:
                    dispatcher.waitFor([vehicleStore.dispatchToken]);
                    
                    setOptions('year', vehicleStore.getYears());
                    setOptions('make', vehicleStore.getMakes(fieldValues.vehicle.year));
                    setOptions('model', vehicleStore.getModels(fieldValues.vehicle.year, fieldValues.vehicle.make));
                    setOptions('trim', vehicleStore.getTrims(fieldValues.vehicle.year, fieldValues.vehicle.make, fieldValues.vehicle.model));
                    setOptions('car_tire_id', vehicleStore.getTireSizes(fieldValues.vehicle.year, fieldValues.vehicle.make, fieldValues.vehicle.model, fieldValues.vehicle.trim));
                    change = true;
                    break;
            }

            if (change) {
                searchStore.trigger('change');
            }
        })
    };

    return searchStore;
});