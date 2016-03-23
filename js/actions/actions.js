define([
    'dispatcher',
    'load!stores/resultsStore',
    'load!stores/searchStore',
    'load!stores/locationsStore',
    'load!stores/customerStore',
    'actions/api'
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
            // action 1
            Api.loadLocations();
            // action 2
            Api.loadTireParameters();
            // action 3
            Api.getVehicleYears();
            // action 4
            Api.loadDealerConfig();
            // action 5
            Api.loadDealerInfo();  

            var curLocId = locationsStore.getCurLocId();
            if (curLocId) {
                // action 6
                Api.loadLocationConfig(curLocId);
            }
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

                Api.loadLocationConfig(id);

                // var section = searchStore.getActiveSection();
                // var searchParams = searchStore.getParamsForSearch();             
                // Api.searchTires(section, searchParams);
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
            search: function(addParams, step) {
                dispatcher.dispatch({
                    actionType: 'tire.search',
                    step: step || 2
                });

                var location = locationsStore.getCurrentLocation();
                if (location) {
                    var section = searchStore.getActiveSection();
                    // var searchParams = searchStore.getSectionValues(section);
                    // if (searchParams.base_category) {
                    //     delete searchParams.base_category;
                    // }
                    // searchParams.location_id = location.id;
                    // searchParams.items_per_page = resultsStore.getItemsPerPage();

                    // searchParams.display = searchStore.getValue('common', 'display');
                    // searchParams.order_by = searchStore.getValue('common', 'order_by');
                    // searchParams.filters = {
                    //     'brand': searchStore.getValue('common', 'brand'),
                    //     'light_truck': searchStore.getValue('common', 'light_truck'),
                    //     'run_flat': searchStore.getValue('common', 'run_flat'),
                    //     'category': searchStore.getValue('common', 'category')
                    // };
                    // searchParams.needed_filters = ['brand', 'run_flat', 'light_truck', 'category'];

                    // if (addParams) {
                    //     searchParams = _.assign(searchParams, addParams);
                    // }
                    var searchParams = searchStore.getParamsForSearch();                    
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
            },
            select: function(tire, selQuantity, supplier) {
                dispatcher.dispatch({
                    actionType: 'tire.select',
                    tireId: tire.id,
                    selQuantity: selQuantity,
                    supplier: supplier
                });

                var withDiscount = tire.discount && tire.discount.added_by_default;
                Api.loadQuote((supplier ? supplier.tire_id : tire.id), selQuantity, 'use_default', withDiscount, null, true);
            },
            enlargeImage: function(image, model) {
                dispatcher.dispatch({
                    actionType: 'tire.enlarge',
                    image: image,
                    model: model
                });
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
                    values: values
                });

                values = customerStore.getParamsForQuote('appointment');
                Api.sendAppointment(values);
            },
            emailForm: function(values) {
                dispatcher.dispatch({
                    actionType: 'quote.emmail.form.show',
                    values: values || {}
                });
            },
            email: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values
                });

                var data = customerStore.getParamsForQuote('email');
                Api.emailQuote(data);
            },
            print: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values || {}
                });

                values = customerStore.getParamsForQuote('print');
                Api.printQuote(values);
            },
            request: function(values) {
                dispatcher.dispatch({
                    actionType: 'customer.values.update',
                    values: values || {}
                });

                values.tire_id = customerStore.getSelectedTireId();
                values.quantity = customerStore.getSelectedQuantity();

                Api.requestQuote(values);
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

                Api.orderCreate({
                    tires: [{
                        id: customerStore.getSelectedTireId(),
                        quantity: customerStore.getSelectedQuantity(),
                        with_discount: quote.discount ? quote.discount.applied : false,
                        optional_services: optionalServices
                    }]
                });
            },

            payment: function(values) {
                dispatcher.dispatch({
                    actionType: 'order.payment',
                    values: values
                });

                var order = customerStore.getOrder();

                if (order.status === 'initiated') {
                    Api.orderCheckout(order.order_id, values);
                } else {
                    Api.orderPayment(order.order_id, values.token);
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