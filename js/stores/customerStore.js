define([
    'dispatcher',
    'load!stores/resultsStore',
    'lodash',
    'validate',
    'moment'
], function(
    dispatcher,
    resultsStore,
    _,
    validate,
    moment
) {

    // private section
    var selectedTire,
        selectedQuantity,
        quote;

    var customer = {
        name: '',
        email: '',
        phone: '',
        preferred_time: '',
        way_to_contact: '',
        vehicle_info: '',
        notes: ''
    };
    var validationErrors = {};


    validate.extend(validate.validators.datetime, {
      // The value is guaranteed not to be null or undefined but otherwise it
      // could be anything.
      parse: function(value, options) {
        return +moment(value);
      },
      // Input is a unix timestamp
      format: function(value, options) {
        var format = options.dateOnly ? 'YYYY-MM-DD' : this.timeFormat;
        return moment(value).format(format);
      }
    });
    var constraints = {
        email: {
            email: true
        },
        phone: {
            presence: true,
            format: {
                pattern: "^\\(?[0-9]{3}\\)?[-. ]?[0-9]{3}[-. ]?[0-9]{4}$",
                message: "is not valid phone number"
            }
        },
        preferred_time: {
            datetime: {
                earliest: moment()
            },
        }
    };

    function setQuote(q) {
        //convert objects to array if needed
        var objToArr = ['services', 'optional_services'];
        for (var i = 0; i < 2; i++) {
            var objName = objToArr[i];
            if (!_.isArray(q[objName])) {
                var services = [];
                Object.keys(q[objName]).map(function(service) {
                    q[objName][service].key = service;
                    services.push(q[objName][service]);
                });
                q[objName] = services;
            }
        }
        //make shop supply fee as service
        if (q.shop_supply_fee) {
            q.services.push({
                name: q.shop_supply_fee.name,
                description: '',
                link: '',
                total_price: q.shop_supply_fee.total_value
            });
        }

        quote = q;
    }


    // public section
    var store = {
        getSelectedTireId: function() {
            return selectedTire;
        },
        getSelectedTire: function() {
            return resultsStore.getTire(selectedTire);
        },
        getSelectedQuantity: function() {
            return selectedQuantity;
        },
        getQuote: function() {
            return _.cloneDeep(quote);
        },
        getValidationErrors: function() {
            return validationErrors;
        },
        getCustomer: function() {
            return _.cloneDeep(customer);
        },
    
        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case 'quote.display.update':
                    selectedTire = payload.tireId;
                    selectedQuantity = payload.quantity;

                    setQuote(payload.quote);
                    change = true;
                    break;

                case 'customer.values.update':
                    validationErrors = validate(payload.values, constraints);
                    if (validationErrors === undefined) {
                        validationErrors = {};
                        _.assign(customer, payload.values);
                    }
                    change = true;
                    break;
            }

            if (change) {
                store.trigger('change');
            }
        })
    };

   

    return store;
});