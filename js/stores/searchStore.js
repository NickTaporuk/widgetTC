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
            page: 1,
            items_per_page: 6,
            display: '',
            order_by: ''
        },

        filters: {
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
        } else if (fieldValues.filters[field]) {
            setValue('filters', field, []);
        } else if (field == 'page') {
            setValue('common', field, 1);
        }
    }

    function setOptions(field, options) {
        // if (options.length === 0) {
        //     // if no options set value of field to empty
        //     var sectionsCount = sections.length;
        //     for (var i = 0; i < sectionsCount; i++) {
        //         if (fieldValues[sections[i]][field]) {
        //             setValue(sections[i], field, '');
        //             break;
        //         }
        //     }
        //     fieldOptions[field] = [];
        // } else {

            fieldOptions[field] = options;
            if (options.length > 0) {
                setDefaultValue(field);
            }
        // }
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
            var options = _.cloneDeep(fieldOptions[field]);
            if (field == 'display' && activeSection !== 'vehicle' ) {
                // Remove oem parameter from display options. Only search by vehicle need this one.
                for (var l = options.length, i = 0; i <= l; i++ ) {
                    if (options[i]['value'] == 'oem') {
                        options.splice(i, 1);
                        break;
                    }
                }
            }
            return options;
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
        getParamsForSearch: function() {
            if (!searchStore.isReadyForSearch()) {
                return null;
            }

            // var resultsStore = require('load!stores/resultsStore');
            var locationsStore = require('load!stores/locationsStore');

            var params = searchStore.getSectionValues(activeSection);

            // needed categories will be returned base on filter
            if (params.base_category) {
                delete params.base_category;
            }

            params.location_id = locationsStore.getCurrentLocation().id;
            // params.items_per_page = resultsStore.getItemsPerPage();

            params = _.assign(params, searchStore.getSectionValues('common'));

            params.filters = searchStore.getSectionValues('filters');

            return params;
        },
        isReadyForSearch: function() {
            var sectionValues = searchStore.getSectionValues(activeSection);
            var isReady = false;
            switch (activeSection) {
                case 'size':
                    isReady = (sectionValues.width && sectionValues.height && sectionValues.rim);
                    break;
                case 'vehicle':
                    isReady = (sectionValues.car_tire_id != false);
                    break;
                case 'part_number':
                    isReady = (sectionValues.part_number != false);
                    break;
            }

            return isReady;
        },
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
                case 'page.search.show':
                    activeSection = payload.params.searchBy.replace('by_', '');
                    Object.keys(fieldValues[activeSection]).map(function(field) {
                        if (payload.params[field]) {
                            fieldValues[activeSection][field] = payload.params[field];
                        }
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

                case 'locations.current.change':
                    payload.step = 1;
                case 'tire.search':
                    if (payload.step == 1) {
                        setDefaultValue('display');
                        setDefaultValue('brand');
                        setDefaultValue('run_flat');
                        setDefaultValue('light_truck');
                        setDefaultValue('category');
                        setDefaultValue('page');

                        // set filter by category base on base_category
                        var baseCategoriesLength = fieldOptions.base_category.length;
                        for (var i = 0; i < baseCategoriesLength; i++) {
                            if (fieldValues[activeSection].base_category == fieldOptions.base_category[i].value) {
                                fieldValues.filters.category = fieldOptions.base_category[i].categories;
                                break;
                            }
                        }

                        change = true;
                    } else if (payload.values) {
                        if (payload.values.page) {
                            setValue('common', 'page', payload.values.page);
                        }
                    }
                    break;
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                    var c = payload.config;
                    if (c.default_order) {
                        setValue('common', 'order_by', c.default_order);
                    }
                    setValue('size', 'base_category', c.default_base_category);
                    setValue('vehicle', 'base_category', c.default_base_category);
                    setValue('common', 'items_per_page', c.items_per_page);
                    if (c.default_searching) {
                        activeSection = c.default_searching.replace('by_', '');
                    }
                    change = true;
                    break;
                    
                case 'search.active_section.update':
                    activeSection = payload.section;
                    change = true;
                    break;

                case constants.GET_VEHICLE_OPTIONS_SUCCESS:
                    Object.keys(payload.options).map(function(field, i) {
                        setOptions(field, payload.options[field]);
                        setValue('vehicle', field, payload.values[field]);
                    });
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