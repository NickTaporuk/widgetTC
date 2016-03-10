define([
    'dispatcher',
    'ajax',
    'load!actions/constants'
], function(
    dispatcher,
    ajax,
    constants
) {

    ajax.beforeSend = function() {
        dispatcher.dispatch({
            actionType: constants.BEFORE_REQUEST
        });
    };

    ajax.complete = function() {
        dispatcher.dispatch({
            actionType: constants.RESPONSE_RECEIVED
        });
    };
    ajax.error = function(error) {
        console.log(error);
        dispatcher.dispatch({
            actionType: constants.ERROR_RESPONSE,
            error: error
        });
    };

    function prepareVehicleResponse(response) {
        var newOptions = [];
        response.data.values.map(function(val, i) {
            newOptions.push({
                'value': val,
                'description': val
            });
        });

        return newOptions;
    }

    Api = {
        loadLocations: function() {
            ajax.make({
                url: 'location/list',
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_LOCATIONS_SUCCESS,
                        locations: response.data.locations
                    });
                }
            });
        },

        loadTireParameters: function() {
            ajax.make({
                url: 'tire/parameters',
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_TIRE_PARAMETERS_SUCCESS,
                        options: response.data
                    });
                }
            });
        },

        searchTires: function(type, searchParams) {
            var method;
            switch (type) {
                case 'size':
                    method = 'searchBySize';
                    break;
                case 'vehicle':
                    method = 'searchByCarTire';
                    break;
                case 'part_number':
                    method = 'searchByPartNumbers';
                    if (!searchParams.part_numbers && searchParams.part_number) {
                        searchParams.part_numbers = [searchParams.part_number];
                        delete searchParams.part_number;
                    }
                    break;
            }

            ajax.make({
                url: 'tire/' + method,
                data: searchParams,
                method: 'post',
                success: function(response) {
                    var results = response.data;
                    dispatcher.dispatch({
                        actionType: constants.SEARCH_TIRES_SUCCESS,
                        tires: results.tires,
                        totalCount: results.nb_results,
                        filters: results.filters,
                        page: results.page
                    });
                }
            });
        },

        getVehicleYears: function() {
            var values = {year: '', make: '', model: '', trim: ''};
            ajax.make({
                url: 'vehicle/years',
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.GET_VEHICLE_YEARS_SUCCESS,
                        options: prepareVehicleResponse(response),
                        values: values
                    });
                }
            });
        },

        getVehicleMakes: function(year) {
            var values = {year: year, make: '', model: '', trim: ''};
            if (year) {
                ajax.make({
                    url: 'vehicle/makes',
                    data: {year: year},
                    success: function(response) {
                        dispatcher.dispatch({
                            actionType: constants.GET_VEHICLE_MAKES_SUCCESS,
                            options: prepareVehicleResponse(response),
                            values: values
                        });
                    }
                });
            }
        },
        getVehicleModels: function(year, make) {
            if (make) {
                var values = {year: year, make: make, model: '', trim: ''};
                ajax.make({
                    url: 'vehicle/models',
                    data: {year: year, make: make},
                    success: function(response) {
                        dispatcher.dispatch({
                            actionType: constants.GET_VEHICLE_MODELS_SUCCESS,
                            options: prepareVehicleResponse(response),
                            values: values
                        });
                    }
                });
            }
        },
        getVehicleTrims: function(year, make, model) {
            if (model) {
                var values = {year: year, make: make, model: model, trim: ''};
                ajax.make({
                    url: 'vehicle/trims',
                    data: values,
                    success: function(response) {
                        dispatcher.dispatch({
                            actionType: constants.GET_VEHICLE_TRIMS_SUCCESS,
                            options: prepareVehicleResponse(response),
                            values: values
                        });
                    }
                });
            }
        },
        getVehicleTireSizes: function(year, make, model, trim) {
            if (trim) {
                var values = {year: year, make: make, model: model, trim: trim};
                ajax.make({
                    url: 'vehicle/tireSizes',
                    data: values,
                    success: function(response) {
                        var options = [];
                        response.data.values.map(function(option) {
                            options.push({
                                value: option.cartireid,
                                description: option.fitment + ' ' + option.size_description
                            });
                        });

                        dispatcher.dispatch({
                            actionType: constants.GET_VEHICLE_TIRES_SUCCESS,
                            options: options,
                            values: values
                        });
                    }
                });
            }
        },

        loadDealerInfo: function() {
            ajax.make({
                url: 'dealer/list',
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_DEALER_INFO_SUCCESS,
                        info: response.data.dealers[0]
                    });
                }
            });
        },

        loadDealerConfig: function() {
            ajax.make({
                url: 'dealer/config',
                data: {wdg:true},
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_DEALER_CONFIG_SUCCESS,
                        config: response.data
                    });
                }
            });
        },

        loadQuote: function(tireId, quantity, services, withDiscount, customDiscount) {
            ajax.make({
                url: 'quote/display',
                method: 'post',
                data: {
                    tire_id: tireId,
                    quantity: quantity,
                    optional_services: services || 'use_default',
                    with_discount: withDiscount || false,
                    custom_discount: customDiscount || null
                },
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_QUOTE_SUCCESS,
                        tireId: tireId,
                        quantity: quantity,
                        customDiscount: customDiscount,
                        quote: response.data
                    });
                }
            });
        },

        sendAppointment: function(data) {
            ajax.make({
                url: 'quote/appointment',
                method: 'post',
                data: data,
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.SEND_APPOINTMENT_SUCCESS,
                        title: 'Thank you!', 
                        content: response.notice
                    });
                }
            });
        },

        printQuote: function(data) {
            var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
            ajax.make({
                url: 'quote/print',
                method: 'post',
                data: data,
                success: function(response) {
                    WinPrint.focus();
                    WinPrint.document.write(response.data.html);
                    WinPrint.document.close();
                    dispatcher.dispatch({
                        actionType: constants.PRINT_QUOTE_SUCCESS
                    });
                }
            });
        },

        emailQuote: function(data) {
            ajax.make({
                url: 'quote/email',
                method: 'post',
                data: data,
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.EMAIL_QUOTE_SUCCESS,
                        title: response.notice,
                        content: ''
                    });
                }
            });
        },

        requestQuote: function(data) {
            ajax.make({
                url: 'quote/request',
                method: 'post',
                data: data,
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.REQUEST_QUOTE_SUCCESS,
                        title: 'Thank you!',
                        content: response.notice
                    });
                }
            });
        },

        orderCreate: function(data) {
            ajax.make({
                url: 'order',
                method: 'post',
                data: data,
                success: function(response) {
                    var orderInfo = response.data;
                    orderInfo.actionType = constants.ORDER_CREATE_SUCCESS;

                    dispatcher.dispatch(orderInfo);
                }
            });
        },
        orderCheckout: function(orderId, data) {
            ajax.make({
                url: 'order/' + orderId + '/checkout',
                method: 'post',
                data: data,
                success: function(response) {
                    var orderInfo = response.data;
                    orderInfo.actionType = constants.ORDER_CHECKOUT_SUCCESS;
                    dispatcher.dispatch(orderInfo);

                    Api.orderPayment(orderId, data.token); // auto payment if success
                }, 
                error: function(response) {
                    if (response.error_code == 400001) {
                        dispatcher.dispatch({
                            actionType: constants.ORDER_CHECKOUT_ERROR,
                            errors: response.errors
                        });
                    } else {
                        ajax.error(response);
                    }
                }
            });
        },
        orderPayment: function(orderId, token) {
            ajax.make({
                url: 'order/' + orderId + '/payment',
                method: 'post',
                data: {token: token},
                success: function(response) {
                    var info = response.data;
                    info.notice = response.notice;
                    info.actionType = constants.ORDER_PAYMENT_SUCCESS;
                    dispatcher.dispatch(info);
                },
                error: function(response) {
                    if (response.error_code == 400001) {
                        dispatcher.dispatch({
                            actionType: constants.ORDER_PAYMENT_ERROR,
                            errors: {number: response.errors.token}
                        });
                    } else {
                        ajax.error(response);
                    }
                }
            });
        },

        loadFullStock: function(tireId) {
            ajax.make({
                url: 'tire/' + tireId + '/fullStock',
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_FULL_STOCK_SUCCESS,
                        stock: response.data.stock,
                        tireId: tireId
                    });
                }
            });
        },

        loadStock: function(tireId) {
            ajax.make({
                url: 'tire/' + tireId + '/stock',
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_STOCK_SUCCESS,
                        branches: response.data.branches,
                        tireId: tireId
                    }); 
                }
            });
        },

        loadReviews: function(tireId, offset) {
            ajax.make({
                url: 'tire/' + tireId + '/reviews',
                data: { offset: offset || 0, limit: 5 },
                success: function(response) {
                    dispatcher.dispatch({
                        actionType: constants.LOAD_REVIEWS_SUCCESS,
                        data: response.data,
                        tireId: tireId
                    }); 
                }
            })
        }
    };

    return Api;

});