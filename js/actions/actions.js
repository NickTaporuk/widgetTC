define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/dealerStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'load!stores/vehicleStore',
    'lib/api'
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
                    actionType: 'vehicle.years.success',
                    options: years
                });
            });

            Api.getDealerConfig().then(function(config) {
                dispatcher.dispatch({
                    actionType: 'dealer.config.set',
                    config: config
                });
            });

            Api.getDealerList().then(function(info) {
                dispatcher.dispatch({
                    actionType: 'dealer.info.success',
                    info: info
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
            },
            changeTab: function(section) {
                dispatcher.dispatch({
                    actionType: 'search.active_section.update',
                    section: section
                }); 
            }
        },
        Tire: {
            loadFullStock: function(tireId) {
                Api.getFullStock(tireId).then(function(stock) {
                    dispatcher.dispatch({
                        actionType: 'tire.full_stock.success',
                        stock: stock,
                        tireId: tireId
                    }); 
                });
            },
            loadStock: function(tireId) {
                Api.getStock(tireId).then(function(branches) {
                    dispatcher.dispatch({
                        actionType: 'tire.stock.success',
                        branches: branches,
                        tireId: tireId
                    }); 
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
            },
            email: function(followUp, values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values,
                    required: values.name ? ['name', 'email', 'phone', 'vehicle_info'] : ['email']
                });

                if (Object.keys(customerStore.getValidationErrors()).length == 0) {
                    followUp = followUp || false;
                    if (followUp) {
                        values = customerStore.getCustomer();
                    }
                    values.tire_id = customerStore.getSelectedTireId();
                    values.quantity = customerStore.getSelectedQuantity();
                    var quote = customerStore.getQuote();
                    values.with_discount = quote.discount ? quote.discount.applied : false;
                    var optionalServices = [];
                    quote.optional_services.map(function(service) {
                        if (service.applied) {
                            optionalServices.push(service.key);
                        }
                    });
                    values.optional_services = optionalServices;

                    Api.quoteEmail(values).then(function(response){
                        dispatcher.dispatch({
                            actionType: 'quote.email.success',
                            title: response.notice, 
                            content: ''
                        });
                    });
                }
            },
            print: function(followUp, values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values || {},
                    required: values ? ['name', 'email', 'phone', 'vehicle_info'] : []
                });

                if (Object.keys(customerStore.getValidationErrors()).length == 0) {
                    followUp = followUp || false;
                    var values = {};
                    if (followUp) {
                        values = customerStore.getCustomer();
                    }
                    values.tire_id = customerStore.getSelectedTireId();
                    values.quantity = customerStore.getSelectedQuantity();
                    var quote = customerStore.getQuote();
                    values.with_discount = quote.discount ? quote.discount.applied : false;
                    var optionalServices = [];
                    quote.optional_services.map(function(service) {
                        if (service.applied) {
                            optionalServices.push(service.key);
                        }
                    });
                    values.optional_services = optionalServices;

                    var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
                    Api.quotePrint(values).then(function(response){
                        WinPrint.focus();
                        WinPrint.document.write(response.data.html);
                        WinPrint.document.close();
                        dispatcher.dispatch({
                            actionType: 'quote.print.success'
                        });
                    });
                }
            },
            request: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values || {},
                    required:  ['name', 'email', 'phone', 'vehicle_info']
                });

                if (Object.keys(customerStore.getValidationErrors()).length == 0) {
                    values.tire_id = customerStore.getSelectedTireId();
                    values.quantity = customerStore.getSelectedQuantity();

                    Api.quoteRequest(values).then(function(response){
                        dispatcher.dispatch({
                            actionType: 'quote.request.success',
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
                    values: values,
                    required: ['name', 'email', 'phone', 'vehicle_info']
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
        },
        Vehicle: {
            change: function(values, type) {
                dispatcher.dispatch({
                    actionType: type + '.vehicle.change',
                    values: values
                });

                if (values.trim) {
                    Api.getVehicleTireSizes(
                        values.year,
                        values.make,
                        values.model,
                        values.trim
                    ).then(function(car_tire_ids) {
                        dispatcher.dispatch({
                            actionType: 'vehicle.tireSizes.success',
                            options: car_tire_ids,
                            values: values
                        });
                    });
                } else if (values.model) {
                    Api.getVehicleTrims(
                        values.year,
                        values.make,
                        values.model
                    ).then(function(trims) {
                        dispatcher.dispatch({
                            actionType: 'vehicle.trims.success',
                            options: trims,
                            values: values
                        });
                    });
                } else if (values.make) {
                    Api.getVehicleModels(
                        values.year,
                        values.make
                    ).then(function(models) {
                        dispatcher.dispatch({
                            actionType: 'vehicle.models.success',
                            options: models,
                            values: values
                        });
                    });
                } else if (values.year) {
                    Api.getVehicleMakes(values.year).then(function(makes) {
                        dispatcher.dispatch({
                            actionType: 'vehicle.makes.success',
                            options: makes,
                            values: values
                        });
                    });
                } else {
                    // Api.getVehicleYears().then(function(years) {
                        dispatcher.dispatch({
                            actionType: 'vehicle.years.success',
                            options: vehicleStore.getYears(),
                            values: values
                        });
                    // });
                }
            }
        }

    }

    return Actions;
});