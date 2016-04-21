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
        if (field == 'display' && fieldOptions.display.length > 0) {
            var options = fieldOptions.display;
            setValue('common', 'display', options[0].value);
        } else if (field == 'page') {
            setValue('common', field, 1);
        }
    }

    function setOptions(field, options) {
        fieldOptions[field] = options;
        if (options.length > 0) {
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
                case 'results.page.update':
                    Object.keys(fieldValues).map(function(section) {
                        Object.keys(fieldValues[section]).map(function(fieldName) {
                            if (section == 'filters' && payload.entryParams.filters && payload.entryParams.filters[fieldName] !== undefined) {
                                setValue(section, fieldName, _.toArray(payload.entryParams.filters[fieldName]));
                            } else if (payload.entryParams[fieldName] !== undefined) {
                                setValue(section, fieldName, payload.entryParams[fieldName]);
                            }
                        });
                    });
                    if (payload.entryParams.car_tire_id) {
                        activeSection = 'vehicle';
                    } else if (payload.entryParams.width) {
                        activeSection = 'size';
                    } else if (payload.entryParams.part_number) {
                        activeSection = 'part_number';
                    }
                    change = true;
                    break;
                // case 'search.params.update':
                //     activeSection = payload.params.searchBy.replace('by_', '');
                //     Object.keys(fieldValues[activeSection]).map(function(field) {
                //         if (payload.params[field]) {
                //             fieldValues[activeSection][field] = payload.params[field];
                //         }
                //     });
                //     Object.keys(fieldValues['common']).map(function(field) {
                //         if (payload.params[field]) {
                //             fieldValues['common'][field] = payload.params[field];
                //         }
                //     });
                //     change = true;
                //     break;
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
                case 'search.page.update':
                    setDefaultValue('display');
                    fieldValues.common.page = 1;
                    fieldValues.filters.brand = [];
                    fieldValues.filters.run_flat = [];
                    fieldValues.filters.light_truck = [];
                    fieldValues.filters.category = [];

                    change = true;
                    break;
                // case 'tire.search':
                //     if (payload.step == 1) {
                //         // set filter by category base on base_category
                //         var baseCategoriesLength = fieldOptions.base_category.length;
                //         for (var i = 0; i < baseCategoriesLength; i++) {
                //             if (fieldValues[activeSection].base_category == fieldOptions.base_category[i].value) {
                //                 fieldValues.filters.category = fieldOptions.base_category[i].categories;
                //                 break;
                //             }
                //         }
                //         change = true;
                //     } else if (payload.values) {
                //         if (payload.values.page) {
                //             setValue('common', 'page', payload.values.page);
                //         }
                //     }
                //     break;
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
                    var pageStore = require('load!stores/pageStore');

                    if (pageStore.getPageName() === 'search' || pageStore.getPageName() == '')
                    {
                        Object.keys(payload.options).map(function(field, i) {
                            setOptions(field, payload.options[field]);
                            var val = payload.values[field] || "";
                            if (field == 'car_tire_id' && payload.options[field][0]) {
                                val = payload.options[field][0].value;
                            }
                            setValue('vehicle', field, val);
                        });
                        change = true;
                    }
                    break;
            }

            if (change) {
                searchStore.trigger('change');
            }
        })
    };

    return searchStore;
});