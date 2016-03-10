define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/dealerStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'load!stores/vehicleStore',
    'actions/api'
], function(
    dispatcher,
    resultsStore,
    dealerStore,
    searchStore,
    locationsStore,
    customerStore,
    vehicleStore,
    Api
) {

    var Actions = {
        init: function() {
            Api.loadLocations();
            Api.loadTireParameters();
            Api.getVehicleYears();
            Api.loadDealerConfig();
            Api.loadDealerInfo();
        },
        Page: {
            show: function(name, props) {
                dispatcher.dispatch({
                    actionType: 'page.update',
                    name: name,
                    props: props || {}
                });
            }
        },
        Popup: {
            show: function(name, props) {
                dispatcher.dispatch({
                    actionType: 'popup.update',
                    name: name,
                    props: props || {}
                });
            },
            close: function() {
                dispatcher.dispatch({
                    actionType: 'popup.close'
                });
            }
        },
        Locations: {
            select: function(id) {
                dispatcher.dispatch({
                    actionType: 'locations.current.change',
                    id: id
                });
            }
        },
        Search: {
            updateField: function(section, field, value) {
                dispatcher.dispatch({
                    actionType: 'search.field.update',
                    section: section,
                    field: field,
                    value: value
                });
            },
            changeTab: function(section) {
                dispatcher.dispatch({
                    actionType: 'search.active_section.update',
                    section: section
                }); 
            }
        },
        Tire: {
            search: function(addParams) {
                var location = locationsStore.getCurrentLocation();
                if (location) {
                    var section = searchStore.getActiveSection();
                    var searchParams = searchStore.getSectionValues(section);
                    searchParams.location_id = location.id;
                    searchParams.items_per_page = resultsStore.getItemsPerPage();

                    searchParams.display = searchStore.getValue('common', 'display');
                    searchParams.order_by = searchStore.getValue('common', 'order_by');
                    searchParams.filters = {
                        'brand': searchStore.getValue('common', 'brand'),
                        'light_truck': searchStore.getValue('common', 'light_truck'),
                        'run_flat': searchStore.getValue('common', 'run_flat')
                    };
                    searchParams.needed_filters = ['brand', 'run_flat', 'light_truck'];


                    if (addParams) {
                        searchParams = _.assign(searchParams, addParams);
                    }

                    Api.searchTires(section, searchParams);
                } else {
                    dispatcher.dispatch({
                        actionType: 'popup.update',
                        name: 'locations'
                    });
                }
            },
            loadFullStock: function(tireId) {
                Api.loadFullStock(tireId);
            },
            loadStock: function(tireId) {
                Api.loadStock(tireId);
            },
            loadRewiews: function(tireId, offset) {
                Api.loadReviews(tireId, offset);
            }
        },
        Quote: {
            update: function(tireId, quantity, services, withDiscount, customDiscount) {
                Api.loadQuote(
                    tireId,
                    quantity,
                    services || 'use_default',
                    withDiscount || false,
                    customDiscount || null
                );
            },
            requestForm: function(tireId, quantity) {
                dispatcher.dispatch({
                    actionType: 'quote.request.form.show',
                    tireId: tireId,
                    quantity: quantity
                });
            },
            appointmentForm: function(type, values) {
                dispatcher.dispatch({
                    actionType: 'quote.appointment.form.show',
                    type: type || 'appointment', 
                    values: values || {}
                });
            },
            sendAppointment: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values,
                    required:  ['name', 'email', 'phone', 'vehicle_info']
                });

                if (Object.keys(customerStore.getValidationErrors()).length === 0) {
                    values = customerStore.getParamsForQuote(true);
                    Api.sendAppointment(values);
                }
            },
            email: function(followUp, values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values,
                    required: values.name ? ['name', 'email', 'phone', 'vehicle_info'] : ['email']
                });

                if (Object.keys(customerStore.getValidationErrors()).length === 0) {
                    var followUp = followUp || false;
                    values = customerStore.getParamsForQuote( followUp );
                    Api.emailQuote(values);
                }
            },
            print: function(followUp, values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values || {},
                    required: values ? ['name', 'email', 'phone', 'vehicle_info'] : []
                });

                if (Object.keys(customerStore.getValidationErrors()).length === 0) {
                    var followUp = followUp || false;
                    values = customerStore.getParamsForQuote( followUp );
                    Api.printQuote(values);
                }
            },
            request: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values || {},
                    required:  ['name', 'email', 'phone', 'vehicle_info']
                });

                if (Object.keys(customerStore.getValidationErrors()).length === 0) {
                    values.tire_id = customerStore.getSelectedTireId();
                    values.quantity = customerStore.getSelectedQuantity();

                    Api.requestQuote(values);
                }
            }
        },
        Order: {
            create: function() {
                var quote = customerStore.getQuote();
                var optionalServices = [];
                quote.optional_services.map(function(service) {
                    if (service.applied) {
                        optionalServices.push(service.key);
                    }
                });

                data = {
                    tires: [{
                        id: customerStore.getSelectedTireId(),
                        quantity: customerStore.getSelectedQuantity(),
                        with_discount: quote.discount ? quote.discount.applied : false,
                        optional_services: optionalServices
                    }]
                };

                Api.orderCreate(data);
            },

            payment: function(values) {
                dispatcher.dispatch({
                    actionType: 'order.payment',
                    values: values,
                    required: ['name', 'email', 'phone', 'vehicle_info']
                });

                if (Object.keys(customerStore.getValidationErrors()).length === 0) {
                    var order = customerStore.getOrder();

                    if (order.status === 'initiated') {
                        Api.orderCheckout(order.order_id, values);
                    } else {
                        Api.orderPayment(order.order_id, values.token);
                    }
                }
            }
        },
        Vehicle: {
            change: function(values, type) {
                dispatcher.dispatch({
                    actionType: type + '.vehicle.change',
                    values: values
                });

                if (values.trim) {
                    Api.getVehicleTireSizes(values.year, values.make, values.model, values.trim);
                } else if (values.model) {
                    Api.getVehicleTrims(values.year, values.make, values.model);
                } else if (values.make) {
                    Api.getVehicleModels(values.year, values.make);
                } else if (values.year) {
                    Api.getVehicleMakes(values.year);
                } else {
                    Api.getVehicleYears();
                }
            }
        }
    };

    return Actions;
});