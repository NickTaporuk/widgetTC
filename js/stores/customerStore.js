define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'lodash',
    'validate',
    'moment',
    'load!actions/constants'
], function(
    dispatcher,
    resultsStore,
    searchStore,
    _,
    validate,
    moment,
    constants
) {

    // private section
    var selectedTire,
        selectedQuantity,
        quote = {};

    var customer = {
        name: '',
        email: '',
        phone: '',
        preferred_time: '',
        way_to_contact: '',
        vehicle_info: '',
        vehicle: {
            year: null,
            make: null,
            model: null,
            trim: null
        },
        notes: ''
    };

    var order = {
        order_number: null,
        order_id: null,
        status: null,
        deposit_payment: null,
        outstanding_balance: null,
        payment_percentage: null
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
        if (q.shop_supply_fee && Object.keys(q.shop_supply_fee).length > 0) {
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
            var _customer = _.cloneDeep(customer);
            if (_customer.vehicle.year === null && searchStore.getActiveSection() == 'vehicle') {
                _customer.vehicle.year = searchStore.getValue('vehicle', 'year');
                _customer.vehicle.make = searchStore.getValue('vehicle', 'make');
                _customer.vehicle.model = searchStore.getValue('vehicle', 'model');
                _customer.vehicle.trim = searchStore.getValue('vehicle', 'trim');
            }
            return _customer;
        },
        getOrder: function() {
            return _.cloneDeep(order);
        },
    
        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case constants.LOAD_QUOTE_SUCCESS:
                case 'quote.request.form.show':
                    selectedTire = payload.tireId;
                    selectedQuantity = payload.quantity;
                    if (payload.quote) {
                        setQuote(payload.quote);
                    }
                    change = true;
                    break;

                case constants.ORDER_CREATE_SUCCESS:
                    if (payload.tires && payload.tires[0]) {
                        order.order_id = payload.order_id;
                        order.order_number = payload.order_number;
                        order.status = payload.status;
                        order.deposit_payment = payload.tires[0].prices.deposit_payment;
                        order.outstanding_balance = payload.tires[0].prices.outstanding_balance;
                        order.payment_percentage = payload.tires[0].prices.payment_percentage;
                        change = true;
                    }
                    break;

                case 'order.payment':
                case 'quote.appointment.form.show':
                case 'customer.values.update':
                    var c = _.cloneDeep(constraints);
                    if (payload.required) {
                        payload.required.map(function(field) {
                            if (!c[field]) {
                                c[field] = {};
                            }
                            c[field].presence = true;
                        });
                    }

                    validationErrors = validate(payload.values, c);
                    if (validationErrors === undefined) {
                        validationErrors = {};
                        _.merge(customer, payload.values);
                    }
                    change = true;
                    break;

                case 'customer.vehicle.change':
                    customer.vehicle = payload.values;
                    change = true;
                    break;

                case constants.ORDER_CHECKOUT_SUCCESS:
                case constants.ORDER_PAYMENT_SUCCESS:
                    order.status = payload.status;
                    change = true;
                    break;

                case constants.ORDER_CHECKOUT_ERROR:
                case constants.ORDER_PAYMENT_ERROR:
                    validationErrors = payload.errors;
                    if (validationErrors.prefered_time) {
                        validationErrors.preferred_time = validationErrors.prefered_time; //temporary for compatibility
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