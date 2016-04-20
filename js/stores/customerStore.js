define([
    'dispatcher',
    'config',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'lodash',
    'validate',
    'moment',
    'load!actions/constants'
], function(
    dispatcher,
    config,
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
        preferred_time: moment().add(1, 'd').minutes(00).hour(13).format('YYYY-MM-DD HH:mm'),
        way_to_contact: 'phone',
        vehicle_info: '',
        vehicle: {
            year: null,
            make: null,
            model: null,
            trim: null
        },
        notes: '',
        follow_up: false
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

    function setQuote(q) {
        //convert objects to array if needed
        var objToArr = ['services', 'optional_services'];
        for (var i = 0; i < 2; i++) {
            var objName = objToArr[i];
            if (q[objName]) {
                if (!_.isArray(q[objName])) {
                    var services = [];
                    Object.keys(q[objName]).map(function(service) {
                        q[objName][service].key = service;
                        services.push(q[objName][service]);
                    });
                    q[objName] = services;
                }
            } else {
                q[objName] = [];
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
        hasErrors: function() {
            return Object.keys(store.getValidationErrors()).length > 0;
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
        getCustomerValue: function(param) {
            return customer[param];
        },
        getParamsForQuote: function(type) {
            var values = {};
            if (type !== 'display') {
                if (type == 'appointment' || customer.follow_up || config.sa) {
                    values = store.getCustomer();
                    delete values.vehicle;
                } else if (type == 'email') {
                    values.email = customer.email;
                }
            }
            values.tire_id = selectedTire;
            values.quantity = selectedQuantity;
            
            var quote = store.getQuote();
            values.with_discount = quote.discount ? quote.discount.applied : false;
            values.custom_discount = quote.discount && quote.discount.is_custom ? quote.discount.total_value : null;
            var optionalServices = [];
            quote.optional_services.map(function(service) {
                if (service.applied) {
                    optionalServices.push(service.key);
                }
            });
            values.optional_services = optionalServices;

            return values;
        },
        getOrder: function() {
            return _.cloneDeep(order);
        },
    
        dispatchToken:  dispatcher.register(function(payload) {
            var change = false;
            switch (payload.actionType) {
                case constants.LOAD_DEALER_CONFIG_SUCCESS:
                    customer.follow_up = config.sa ? false : payload.config.default_quote_call_back;
                    change = true;
                    break;

                case 'request.page.update':
                case 'summary.page.update':
                    if (payload.entryParams.tire_id) {
                        selectedTire = payload.entryParams.tire_id;
                    }
                    if (payload.entryParams.quantity) {
                        selectedQuantity = payload.entryParams.quantity;
                    }
                    if (payload.quote) {
                        setQuote(payload.quote);
                    }
                    change = true;
                    break;

                case 'order.checkout.success':
                case 'order.payment.success':
                    var _order = payload.order;
                    if (_order) {
                        order.status = _order.status;
                        change = true;
                    }
                    if (payload.customer) {
                        _.merge(customer, payload.customer);
                    }
                    break;

                case 'order.page.update':
                    var _order = payload.order;
                    if (_order && _order.tires && _order.tires[0]) {
                        order.order_id = _order.order_id;
                        order.order_number = _order.order_number;
                        order.status = _order.status;
                        order.deposit_payment = _order.tires[0].prices.deposit_payment;
                        order.outstanding_balance = _order.tires[0].prices.outstanding_balance;
                        order.payment_percentage = _order.tires[0].prices.payment_percentage;
                        change = true;
                    }
                    break;

                case 'email_only.page.update':
                    customer.follow_up = false;
                    break;

                case 'email.page.update':
                case 'print.page.update':
                    customer.follow_up = config.sa ? false : true;
                    break;

                case 'print.quote':
                case 'email.quote':
                case 'appointment.make':
                case 'request.quote':
                    _.merge(customer, payload.customer);
                    validationErrors = {};
                    change = true;
                    break;

                case 'customer.values.update':
                    _.merge(customer, payload.values);
                    validationErrors = {};
                    change = true;
                    break;

                case 'customer.vehicle.change':
                    customer.vehicle = payload.values;
                    change = true;
                    break;

                case constants.SEND_APPOINTMENT_ERROR:
                case constants.REQUEST_QUOTE_ERROR:
                case constants.EMAIL_QUOTE_ERROR:
                case constants.PRINT_QUOTE_ERROR:

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