define([
    'dispatcher',
    'promise',
    'ajax',
    'isMobile',
    'validate',
    'moment',
    'load!actions/constants',
    'config'
], function(
    dispatcher,
    Promise,
    ajax,
    isMobile,
    validate,
    moment,
    constants,
    config
) {

    ajax.beforeSend = function() {
        dispatcher.sub.dispatch({
            actionType: constants.BEFORE_REQUEST
        });
    };

    ajax.complete = function() {
        dispatcher.sub.dispatch({
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
            return ajax.make({
                url: 'location/list',
                cache: true
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_LOCATIONS_SUCCESS,
                    locations: response.data.locations
                });
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
                return ajax.make({
                    url: 'location/' + locationId + '/config',
                    cache: true
                }).then(function(response) {
                    dispatch(response.data);
                });
            } else {
                return Promise.resolve({
                        call_number: null
                    }).then(function(response) {
                        dispatch(response);
                    });
            }
        },

        loadTireParameters: function() {
            return ajax.make({
                url: 'tire/parameters',
                cache: true
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_TIRE_PARAMETERS_SUCCESS,
                    options: response.data
                });
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

            return ajax.make({
                url: 'tire/' + method,
                data: searchParams,
                method: 'post'
            }).then(function(response) {
                var results = response.data;
                dispatcher.dispatch({
                    actionType: constants.SEARCH_TIRES_SUCCESS,
                    tires: results.tires,
                    totalCount: results.nb_results,
                    filters: results.filters,
                    page: results.page
                });

                return response.data;
            });
        },

        loadTire: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId
            }).then(function(response){
                dispatcher.dispatch({
                    actionType: constants.LOAD_TIRE_SUCCESS,
                    tire: response.data
                });
            });
        },

        getVehicleOptions: function(values, updateField) {
            var fields = ['year', 'make', 'model', 'trim'];
            var index = updateField ? fields.indexOf(updateField) : 3;
            var allOptions = {};   
            values = values || {};
            
            for (var i = 0; i < 4; i++) {
                var field = fields[i];
                values[field] = index < i || !values[field] ? '' : values[field];
                allOptions[field] = [];
                if (!updateField && !values[field]) {
                    index = i-1;
                    updateField = fields[index];
                }
            }

            var dispatch = function() {
                dispatcher.dispatch({
                    actionType: constants.GET_VEHICLE_OPTIONS_SUCCESS,
                    options: allOptions,
                    values: values
                });
                
            }

            var promises = [];
            if (values.trim) {
                promises.push(ajax.make({
                    url: 'vehicle/tireSizes',
                    data: values,
                    cache: true
                }).then(function(response) {
                    var options = [];
                    response.data.values.map(function(option) {
                        options.push({
                            value: option.cartireid,
                            description: option.fitment + ' ' + option.size_description
                        });
                    });
                    allOptions.car_tire_id = options;
                }));
            }

            if (values.model) {
                promises.push(ajax.make({
                    url: 'vehicle/trims',
                    data: values,
                    cache: true
                }).then(function(response) {
                    allOptions.trim = prepareVehicleResponse(response);
                }));
            }

            if (values.make) {
                promises.push(ajax.make({
                    url: 'vehicle/models',
                    data: values,
                    cache: true
                }).then(function(response) {
                    allOptions.model = prepareVehicleResponse(response);
                }));
            }

            if (values.year) {
                promises.push(ajax.make({
                    url: 'vehicle/makes',
                    data: values,
                    cache: true
                }).then(function(response) {
                    allOptions.make = prepareVehicleResponse(response);
                }));
            }

            promises.push(ajax.make({
                url: 'vehicle/years',
                cache: true
            }).then(function(response) {
                allOptions.year = prepareVehicleResponse(response);
                return allOptions.year
            }));

            return Promise.all(promises).then(function(responses) {
                dispatch();
            })
        },

        loadDealerInfo: function() {
            return ajax.make({
                url: 'dealer/list',
                cache: true
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_DEALER_INFO_SUCCESS,
                    info: response.data.dealers[0]
                });
            });
        },

        loadDealerConfig: function() {
            return ajax.make({
                url: 'dealer/config',
                data: {wdg:true},
                cache: true
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_DEALER_CONFIG_SUCCESS,
                    config: response.data
                });
            });
        },

        loadQuote: function(tireId, quantity, services, withDiscount, customDiscount, track) {
            return ajax.make({
                url: 'quote/display',
                method: 'post',
                data: {
                    tire_id: tireId,
                    quantity: quantity,
                    optional_services: services || 'use_default',
                    with_discount: withDiscount || false,
                    custom_discount: customDiscount || null,
                    track: track || null
                }
            }).then(function(response) {
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

                return quote;
            });
        },

        sendAppointment: function(data) {
            var dispatchError = function(errors) {
                dispatcher.dispatch({
                    actionType: constants.SEND_APPOINTMENT_ERROR,
                    errors: errors
                });
            };

            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone']);  
            if (validationErrors) {
                return Promise.reject(validationErrors).catch(function(response) {
                    dispatchError(response);    
                });
            } else {
                return ajax.make({
                    url: 'quote/appointment',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    dispatcher.dispatch({
                        actionType: constants.SEND_APPOINTMENT_SUCCESS,
                        title: 'Thank you!', 
                        content: response.notice
                    });
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        dispatchError(response.errors);
                    } else {
                        ajax.error(response);
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

            var validationErrors = validateParamsForQuote(data, !config.sa && data.name !== undefined ? ['name', 'email', 'phone'] : []);
            if (validationErrors) {
                return Promise.reject(validationErrors).catch(function(response) {
                    dispatchError(response);    
                });
            } else {
                var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
                ajax.make({
                    url: 'quote/print',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    WinPrint.focus();
                    WinPrint.document.write(response.data.html);
                    WinPrint.document.close();
                    dispatcher.dispatch({
                        actionType: constants.PRINT_QUOTE_SUCCESS
                    });
                }).catch(function(response) {
                    WinPrint.close();
                    if (response.error_code == 400001) {
                        dispatchError(response.errors);
                    } else {
                        ajax.error(response);
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
            
            var validationErrors = validateParamsForQuote(data, !config.sa && data.name !== undefined ? ['name', 'email', 'phone'] : ['email']);
            if (validationErrors) {
                return Promise.reject(validationErrors).catch(function(response) {
                    dispatchError(response);    
                });
            } else {
                return ajax.make({
                    url: 'quote/email',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    dispatcher.dispatch({
                        actionType: constants.EMAIL_QUOTE_SUCCESS,
                        title: response.notice,
                        content: ''
                    });
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        dispatchError(response.errors);
                    } else {
                        ajax.error(response);
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

            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone']);
            if (validationErrors) {
                return Promise.reject(validationErrors).catch(function(response) {
                    dispatchError(response);    
                });
            } else {
                return ajax.make({
                    url: 'quote/request',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    dispatcher.dispatch({
                        actionType: constants.REQUEST_QUOTE_SUCCESS,
                        title: 'Thank you!',
                        content: response.notice
                    });
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        dispatchError(response.errors);
                    } else {
                        ajax.error(response);
                    }
                });
            }
        },

        orderCreate: function(data) {
            return ajax.make({
                url: 'order',
                method: 'post',
                data: data
            }).then(function(response) {
                var orderInfo = response.data;
                orderInfo.actionType = constants.ORDER_CREATE_SUCCESS;

                dispatcher.dispatch(orderInfo);

                return response.data;
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
                return Promise.reject(validationErrors).catch(function(response) {
                    dispatchError(response);    
                });
            } else {
                return ajax.make({
                    url: 'order/' + orderId + '/checkout',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    var orderInfo = response.data;
                    orderInfo.actionType = constants.ORDER_CHECKOUT_SUCCESS;
                    dispatcher.dispatch(orderInfo);

                    // auto payment
                    return Api.orderPayment(orderId, data.token, true).then(function(order) {
                        return order;
                    }).catch(function(r) {
                        // if payment is not success return order received by checkout method
                        return response.data;
                    });
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        dispatchError(response.errors);
                    } else {
                        ajax.error(response);
                    }
                    return response;
                });
            }
        },

        orderPayment: function(orderId, token, throwError) {
            return ajax.make({
                url: 'order/' + orderId + '/payment',
                method: 'post',
                data: {token: token},
                useGlobalError: false
            }).then(function(response) {
                var info = response.data;
                info.notice = response.notice;
                info.actionType = constants.ORDER_PAYMENT_SUCCESS;
                dispatcher.dispatch(info);

                return info;
            }).catch(function(response) {
                if (response.error_code == 400001) {
                    dispatcher.dispatch({
                        actionType: constants.ORDER_PAYMENT_ERROR,
                        errors: {number: response.errors.token}
                    });
                } else {
                    ajax.error(response);
                }
                if (throwError) {
                    throw new Error();
                }
            });
        },

        loadFullStock: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId + '/fullStock',
                cache: true
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_FULL_STOCK_SUCCESS,
                    stock: response.data.stock,
                    tireId: tireId
                });
            });
        },

        loadStock: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId + '/stock'
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_STOCK_SUCCESS,
                    branches: response.data.branches,
                    tireId: tireId
                }); 
            });
        },

        loadReviews: function(tireId, offset) {
            offset = offset || 0;

            return ajax.make({
                url: 'tire/' + tireId + '/reviews',
                data: { offset: offset, limit: 5 },
                cache: true
            }).then(function(response) {
                dispatcher.dispatch({
                    actionType: constants.LOAD_REVIEWS_SUCCESS,
                    data: response.data,
                    tireId: tireId,
                    offset: offset
                });
            });
        },

        setSession: function() {
            return ajax.make({
                url: 'session',
                method: 'post',
                data: {is_returned: config.isReturnedUser, source: (config.sa ? 'instore' : 'website') }
            }).then(function(response) {
                return response.data.session_id;
            });
        }
    };

    return Api;

});