define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'lib/api'
], function(
    dispatcher,
    resultsStore,
    searchStore,
    locationsStore,
    customerStore,
    Api
) {

    var Actions = {
        init: function() {
            // trigger in Location component
            Api.getLocations().then(function(response) {
                dispatcher.dispatch({
                    actionType: 'locations.init',
                    locations: response.data.locations
                });
            });

            // trigger in Search component
            Api.getTireParameters().then(function(response) {
                dispatcher.dispatch({
                    actionType: 'tire.parameters.set',
                    options: response.data
                });
            });

            Api.getVehicleYears().then(function(years) {
                dispatcher.dispatch({
                    actionType: 'search.options.update',
                    options: {year: years}
                });
            });

            Api.getDealerConfig().then(function(config) {
                dispatcher.dispatch({
                    actionType: 'dealer.config.set',
                    config: config
                });
            });
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

                if (section == 'vehicle') {
                    if (field == 'year') {
                        Api.getVehicleMakes(searchStore.getValue('vehicle', 'year')).then(function(makes) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {make: makes, model: [], trim: [], car_tire_id: []}
                            });
                        });
                    } else if (field == 'make') {
                        Api.getVehicleModels(
                            searchStore.getValue('vehicle', 'year'),
                            searchStore.getValue('vehicle', 'make')
                        ).then(function(models) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {model: models, trim: [], car_tire_id: []}
                            });
                        });
                    } else if (field == 'model') {
                        Api.getVehicleTrims(
                            searchStore.getValue('vehicle', 'year'),
                            searchStore.getValue('vehicle', 'make'),
                            searchStore.getValue('vehicle', 'model')
                        ).then(function(trims) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {trim: trims, car_tire_id: []}
                            });
                        });
                    } else if (field == 'trim') {
                        Api.getVehicleTireSizes(
                            searchStore.getValue('vehicle', 'year'),
                            searchStore.getValue('vehicle', 'make'),
                            searchStore.getValue('vehicle', 'model'),
                            searchStore.getValue('vehicle', 'trim')
                        ).then(function(car_tire_ids) {
                            dispatcher.dispatch({
                                actionType: 'search.options.update',
                                options: {car_tire_id: car_tire_ids}
                            });
                        });
                    }
                }
            },
            changeTab: function(section) {
                dispatcher.dispatch({
                    actionType: 'search.active_section.update',
                    section: section
                }); 
            }
        },
        Customer: {
            updateParam: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'customer.update_param',
                    param: param,
                    value: value
                });                
            },
            updateVehicle: function(param, value) {
                dispatcher.dispatch({
                    actionType: 'customer.update_vehicle',
                    param: param,
                    value: value
                });
            }
        },
        Quote: {
            update: function(tireId, quantity, services, withDiscount, customDiscount) {
                Api.getQuoteDisplay({
                    tire_id: tireId,
                    quantity: quantity,
                    optional_services: services || 'use_default',
                    with_discount: withDiscount || false,
                    custom_discount: customDiscount || null
                }).then(function(quote) {
                    dispatcher.dispatch({
                        actionType: 'quote.display.update',
                        tireId: tireId,
                        quantity: quantity,
                        quote: quote
                    });
                });
            },
            sendAppointment: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values
                });


                if (Object.keys(customerStore.getValidationErrors()).length == 0) {
                    values.tire_id = customerStore.getSelectedTireId();
                    values.quantity = customerStore.getSelectedQuantity();
                    values.way_to_contact = 'phone';

                    var quote = customerStore.getQuote();
                    values.with_discount = quote.discount ? quote.discount.applied : false;
                    var optionalServices = [];
                    quote.optional_services.map(function(service) {
                        if (service.applied) {
                            optionalServices.push(service.key);
                        }
                    });
                    values.optional_services = optionalServices;

                    Api.sendAppointment(values).then(function(response) {
                        dispatcher.dispatch({
                            actionType: 'quote.appointment.success',
                            title: 'Thank you!', 
                            content: response.notice
                        });
                    });
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

                Api.orderCreate(data).then(function(orderInfo) {
                    orderInfo.actionType = 'order.create.success';

                    dispatcher.dispatch(orderInfo);
                })
            },

            payment: function(values) {
                dispatcher.dispatch({
                    actionType: 'order.payment',
                    values: values
                });

                if (Object.keys(customerStore.getValidationErrors()).length == 0) {
                    var order = customerStore.getOrder();


                    function payment() {
                        Api.orderPayment(order.order_id, values.token).then(function(response) {
                            var info = response.data;
                            info.notice = response.notice;
                            info.actionType = 'order.payment.success';
                            dispatcher.dispatch(info);
                        }, function(response) {
                            if (response.error_code == 400001) {
                                dispatcher.dispatch({
                                    actionType: 'order.payment.error',
                                    errors: {number: response.errors.token}
                                });
                            }
                        });
                    }

                    if (order.status === 'initiated') {
                        Api.orderCheckout(order.order_id, values).then(function(orderInfo) {
                            orderInfo.actionType = 'order.checkout.success';
                            dispatcher.dispatch(orderInfo);
                            payment();
                        }, function(response) {
                            if (response.error_code == 400001) {
                                dispatcher.dispatch({
                                    actionType: 'order.checkout.error',
                                    errors: response.errors
                                });
                            }
                        });
                    } else {
                        payment();
                    }
                }
            }
        }

    }

    return Actions;
});