define([
    'dispatcher',
    'ajax',
    'isMobile',
    'validate',
    'moment',
    'load!actions/constants',
    'load!stores/vehicleStore',
    'config'
], function(
    dispatcher,
    ajax,
    isMobile,
    validate,
    moment,
    constants,
    vehicleStore,
    config
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

    function validateParamsForQuote(values, requiredParams) {
        var constraints = {
            name: {
                length: {maximum: 255}
            },
            email: {
                email: true,
                length: {maximum: 255}
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
            },
            notes: {
                length: {maximum: 500}
            }
        };

        if (requiredParams) {
            requiredParams.map(function(field) {
                if (!constraints[field]) {
                    constraints[field] = {};
                }
                constraints[field].presence = true;
            });
        }
        return validate(values, constraints);
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

        loadLocationConfig: function(locationId) {
            var dispatch = function(config) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_LOCATION_CONFIG_SUCCESS,
                    config: config
                });
            }
            
            // we need location config only for mobile version (to gate call number) for now
            if (isMobile.any) {
                ajax.make({
                    url: 'location/' + locationId + '/config',
                    success: function(response) {
                        dispatch(response.data);
                    }
                });
            } else {
                dispatch({
                    call_number: null
                });
            }
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

        searchTires: function(searchParams) {
            if (!searchParams) {
                return;
            }
            
            var method;
            if (searchParams.part_number) {
                method = 'searchByPartNumbers';
                if (!searchParams.part_numbers && searchParams.part_number) {
                    searchParams.part_numbers = [searchParams.part_number];
                    delete searchParams.part_number;
                }
            } else if (searchParams.car_tire_id) {
                method = 'searchByCarTire';
            } else {
                method = 'searchBySize';
            }

            searchParams.needed_filters = ['brand', 'run_flat', 'light_truck', 'category'];

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
            var options = vehicleStore.getYears();
            var dispatch = function(response) {
                dispatcher.dispatch({
                    actionType: constants.GET_VEHICLE_YEARS_SUCCESS,
                    options: response,
                    values: values
                });
            }
            if (options.length > 0) {
                dispatch(options);
            } else {
                ajax.make({
                    url: 'vehicle/years',
                    success: function(response) {
                        dispatch(prepareVehicleResponse(response));
                    }
                });
            }
        },

        getVehicleMakes: function(year) {
            var values = {year: year, make: '', model: '', trim: ''};
            var options = vehicleStore.getMakes(year);
            var dispatch = function(response) {
                dispatcher.dispatch({
                    actionType: constants.GET_VEHICLE_MAKES_SUCCESS,
                    options: response,
                    values: values
                });
            }
            if (options.length > 0) {
                dispatch(options);
            } else if (year) {
                ajax.make({
                    url: 'vehicle/makes',
                    data: {year: year},
                    success: function(response) {
                        dispatch(prepareVehicleResponse(response));
                    }
                });
            }
        },

        getVehicleModels: function(year, make) {
            var values = {year: year, make: make, model: '', trim: ''};
            var options = vehicleStore.getModels(year, make);
            var dispatch = function(response) {
                dispatcher.dispatch({
                    actionType: constants.GET_VEHICLE_MODELS_SUCCESS,
                    options: response,
                    values: values
                });
            }
            if (options.length > 0) {
                dispatch(options);
            } else if (make) {
                ajax.make({
                    url: 'vehicle/models',
                    data: {year: year, make: make},
                    success: function(response) {
                        dispatch(prepareVehicleResponse(response));
                    }
                });
            }
        },

        getVehicleTrims: function(year, make, model) {
            var values = {year: year, make: make, model: model, trim: ''};
            var options = vehicleStore.getTrims(year, make, model);
            var dispatch = function(response) {
                dispatcher.dispatch({
                    actionType: constants.GET_VEHICLE_TRIMS_SUCCESS,
                    options: response,
                    values: values
                });
            }
            if (options.length > 0) {
                dispatch(options);
            } else if (model) {
                ajax.make({
                    url: 'vehicle/trims',
                    data: values,
                    success: function(response) {
                        dispatch(prepareVehicleResponse(response));
                    }
                });
            }
        },

        getVehicleTireSizes: function(year, make, model, trim) {
            var values = {year: year, make: make, model: model, trim: trim};
            var options = vehicleStore.getTireSizes(year, make, model, trim);
            var dispatch = function(response) {
                dispatcher.dispatch({
                    actionType: constants.GET_VEHICLE_TIRES_SUCCESS,
                    options: response,
                    values: values
                });
            }
            if (options.length > 0) {
                dispatch(options);
            } else if (trim) {
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
                        dispatch(options);
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

        loadQuote: function(tireId, quantity, services, withDiscount, customDiscount, track) {
            ajax.make({
                url: 'quote/display',
                method: 'post',
                data: {
                    tire_id: tireId,
                    quantity: quantity,
                    optional_services: services || 'use_default',
                    with_discount: withDiscount || false,
                    custom_discount: customDiscount || null,
                    track: track || null
                },
                success: function(response) {
                    var quote = response.data;
                    quote.tire_id = tireId;
                    quote.tires_count = quantity;
                    if (quote.discount) {
                        quote.discount.tried_to_apply = withDiscount;
                        quote.discount.is_custom = customDiscount ? true : false;
                    }
                    dispatcher.dispatch({
                        actionType: constants.LOAD_QUOTE_SUCCESS,
                        tireId: tireId,
                        quantity: quantity,
                        quote: quote
                    });
                }
            });
        },

        sendAppointment: function(data) {
            var dispatchError = function(errors) {
                dispatcher.dispatch({
                    actionType: constants.SEND_APPOINTMENT_ERROR,
                    errors: errors
                });
            };

            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone', 'vehicle_info']);  
            if (validationErrors) {
                dispatchError(validationErrors);
            } else {
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
                    },
                    error: function(response) {
                        if (response.error_code == 400001) {
                            dispatchError(response.errors);
                        } else {
                            ajax.error(response);
                        }
                    }
                });
            }
        },

        printQuote: function(data) {
            var dispatchError = function(errors) {
                dispatcher.dispatch({
                    actionType: constants.PRINT_QUOTE_ERROR,
                    errors: errors
                });
            };

            var validationErrors = validateParamsForQuote(data, data.name ? ['name', 'email', 'phone', 'vehicle_info'] : []);
            if (validationErrors) {
                dispatchError(validationErrors);
            } else {
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
                    },
                    error: function(response) {
                        WinPrint.close();
                        if (response.error_code == 400001) {
                            dispatchError(response.errors);
                        } else {
                            ajax.error(response);
                        }
                    }
                });
            }
        },

        emailQuote: function(data) {
            var dispatchError = function(errors) {
                dispatcher.dispatch({
                    actionType: constants.EMAIL_QUOTE_ERROR,
                    errors: errors
                });
            };

            var validationErrors = validateParamsForQuote(data, data.name ? ['name', 'email', 'phone', 'vehicle_info'] : ['email']);
            if (validationErrors) {
                dispatchError(validationErrors);
            } else {
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
                    },
                    error: function(response) {
                        if (response.error_code == 400001) {
                            dispatchError(response.errors);
                        } else {
                            ajax.error(response);
                        }
                    }
                });
            }
        },

        requestQuote: function(data) {
            var dispatchError = function(errors) {
                dispatcher.dispatch({
                    actionType: constants.REQUEST_QUOTE_ERROR,
                    errors: errors
                });
            };

            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone', 'vehicle_info']);
            if (validationErrors) {
                dispatchError(validationErrors);
            } else {
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
                    },
                    error: function(response) {
                        if (response.error_code == 400001) {
                            dispatchError(response.errors);
                        } else {
                            ajax.error(response);
                        }
                    }
                });
            }
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
            var dispatchError = function(errors) {
                dispatcher.dispatch({
                    actionType: constants.ORDER_CHECKOUT_ERROR,
                    errors: errors
                });
            };

            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone', 'vehicle_info']);
            if (validationErrors) {
                dispatchError(validationErrors);
            } else {
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
                            dispatchError(response.errors);
                        } else {
                            ajax.error(response);
                        }
                    }
                });
            }
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
        },

        setSession: function(callback) {
            ajax.make({
                url: 'session',
                method: 'post',
                data: {is_returned: config.isReturnedUser, source: (config.sa ? 'instore' : 'website') },
                success: function(response) {
                    callback(response.data.session_id);
                }
            });
        }
    };

    return Api;

});