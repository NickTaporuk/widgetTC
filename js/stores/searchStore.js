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

    function setDefaultValue(field) {
        if (field == 'car_tire_id') {
            var options = fieldOptions['car_tire_id'];
            setValue('vehicle', 'car_tire_id', options[0].value);
        } else if (field == 'display') {
            var options = fieldOptions['display'];
            setValue('common', 'display', options[0].value);
        } else if (field == 'brand' || field == 'run_flat' || field == 'light_truck') {
            var options = fieldOptions[field];
            var value = [];
            options.forEach(function(option, i, options) {
                value.push(option.value);
            });
            setValue('common', field, value);
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


        dispatchToken: dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'tire.parameters.set':
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
                case 'dealer.config.set':
                    var c = payload.config;
                    setValue('common', 'order_by', c.default_order.iframe);
                    setValue('size', 'base_category', c.default_base_category);
                    setValue('vehicle', 'base_category', c.default_base_category);
                    activeSection = c.default_searching.iframe.replace('by_', '');
                    change = true;
                    break;
                case 'search.active_section.update':
                    activeSection = payload.section;
                    change = true;
                    break;
                case 'page.update':
                    var pageStore = require('load!stores/pageStore');
                    dispatcher.waitFor([pageStore.dispatchToken]);
                    if (pageStore.getPageName() == 'search') {
                        setDefaultValue('display');
                        setDefaultValue('brand');
                        setDefaultValue('run_flat');
                        setDefaultValue('light_truck');
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