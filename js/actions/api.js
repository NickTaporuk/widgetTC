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
        dispatcher.ajax.dispatch({
            actionType: constants.BEFORE_REQUEST
        });
    };

    ajax.complete = function() {
        dispatcher.ajax.dispatch({
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


    var Api = {
        loadLocations: function() {
            if (config.locationId) {
                return ajax.make({
                    url: 'location/' + config.locationId,
                    cache: true
                }).then(function (response) {
                    return [response.data];
                });
            }

            return ajax.make({
                url: 'location/list',
                cache: true
            }).then(function(response) {
                return response.data.locations;
            });
        },

        loadLocation: function(locationId) {
            return Api.loadLocations().then(function(locations) {
                var location = null;
                locations.map(function(loc) {
                    if (loc.id == locationId) {
                        location = loc;
                    }
                });
                return location;
            });
        },

        loadLocationConfig: function(locationId) {
            // we need location config only for mobile version (to gate call number) for now
            if (isMobile.any) {
                return ajax.make({
                    url: 'location/' + locationId + '/config',
                    cache: true
                }).then(function(response) {
                    return response.data;
                });
            } else {
                return Promise.resolve({
                    call_number: null
                }).then(function(response) {
                    return response;
                });
            }
        },

        loadTireParameters: function() {
            return ajax.make({
                url: 'tire/parameters',
                cache: true
            }).then(function(response) {
                return response.data;
            });
        },

        searchTires: function(searchParams) {
            if (!searchParams) {
                return;
            }
            var searchParams = _.cloneDeep(searchParams);

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
                method: 'post',
                oneTimeCache: true
            }).then(function(response) {
                return response.data;
            });
        },

        loadTire: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId,
                oneTimeCache: true
            }).then(function(response){
                return response.data;
            });
        },

        loadVehicleOptions: function(values, updateField) {
            var fields = ['year', 'make', 'model', 'trim', 'car_tire_id'];
            var index = updateField ? fields.indexOf(updateField) : 3;
            var allOptions = {};   
            values = values || {};
            
            for (var i = 0; i < 5; i++) {
                var field = fields[i];
                values[field] = index < i || !values[field] ? '' : values[field];
                allOptions[field] = [];
                if (!updateField && !values[field]) {
                    index = i - 1;
                    updateField = fields[index];
                }
            }

            var promises = [];
            if (values.trim) {
                promises.push(ajax.make({
                    url: 'vehicle/tireSizes',
                    data: {year: values.year, make: values.make, model: values.model, trim: values.trim},
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
                    data: {year: values.year, make: values.make, model: values.model},
                    cache: true
                }).then(function(response) {
                    allOptions.trim = prepareVehicleResponse(response);
                }));
            }

            if (values.make) {
                promises.push(ajax.make({
                    url: 'vehicle/models',
                    data: {year: values.year, make: values.make},
                    cache: true
                }).then(function(response) {
                    allOptions.model = prepareVehicleResponse(response);
                }));
            }

            if (values.year) {
                promises.push(ajax.make({
                    url: 'vehicle/makes',
                    data: {year: values.year},
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
            }));

            return Promise.all(promises).then(function() {
                return allOptions;
            });
        },

        loadDealerInfo: function() {
            var load = function(dealerId) {
                return ajax.make({
                    url: 'dealer/list',
                    cache: true
                }).then(function(response) {
                    if (dealerId && response.data.dealers.length > 1) {
                        var dealerInfo;
                        response.data.dealers.map(function(dealer) {
                            if (dealer.id == dealerId) {
                                dealerInfo = dealer;
                            }
                        });
                        return dealerInfo;
                    }
                    return response.data.dealers[0];
                });
            };

            if (config.locationId) {
                return Api.loadLocation(config.locationId).then(function(location) {
                    return load(location.dealer_id);
                });
            }

            return load();
        },

        loadDealerConfig: function() {
            var load = function(dealerId) {
                return ajax.make({
                    url: 'dealer/' + (dealerId ? dealerId+'/' : '') + 'config',
                    data: {wdg:true},
                    cache: true
                }).then(function(response) {
                    return response.data;
                });
            };

            if (config.locationId) {
                return Api.loadLocation(config.locationId).then(function(location) {
                    return load(location.dealer_id);
                });
            }

            return load();
        },

        loadQuote: function(tireId, quantity, services, withDiscount, customDiscount, vehicle, track) {
            return ajax.make({
                url: 'quote/display',
                method: 'post',
                data: {
                    tire_id: tireId,
                    quantity: quantity,
                    optional_services: services,
                    with_discount: withDiscount || false,
                    custom_discount: customDiscount || null,
                    vehicle: vehicle || null,
                    track: track || null
                },
                oneTimeCache: true,
                ignoreInCache: ['track']
            }).then(function(response) {
                var quote = response.data;
                quote.tire_id = tireId;
                quote.tires_count = quantity;
                if (quote.discount) {
                    quote.discount.tried_to_apply = withDiscount;
                    quote.discount.is_custom = customDiscount ? true : false;
                }

                var objToArr = ['services', 'optional_services'];
                for (var i = 0; i < 2; i++) {
                    var objName = objToArr[i];
                    if (quote[objName]) {
                        if (!_.isArray(quote[objName])) {
                            var services = [];
                            Object.keys(quote[objName]).map(function(service) {
                                quote[objName][service].key = service;
                                services.push(quote[objName][service]);
                            });
                            quote[objName] = services;
                        }
                    } else {
                        quote[objName] = [];
                    }
                }

                if (quote.shop_supply_fee && Object.keys(quote.shop_supply_fee).length > 0) {
                    quote.services.push({
                        name: quote.shop_supply_fee.name,
                        description: '',
                        link: '',
                        total_price: quote.shop_supply_fee.total_value
                    });

                    delete quote.shop_supply_fee;
                }

                return quote;
            });
        },

        sendAppointment: function(data) {
            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone']);
            if (validationErrors) {
                return Promise.reject(validationErrors);
            } else {
                return ajax.make({
                    url: 'quote/appointment',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    return { title: response.notice, content: '' };
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        return Promise.reject(response.errors);
                    } else {
                        ajax.error(response);
                    }
                });
            }
        },

        printQuote: function(data) {
            var validationErrors = validateParamsForQuote(data, !config.sa && data.name !== undefined ? ['name', 'email', 'phone'] : []);
            if (validationErrors) {
                return Promise.reject(validationErrors);
            } else {
                var WinPrint = window.open('', '', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
                return ajax.make({
                    url: 'quote/print',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    WinPrint.focus();
                    WinPrint.document.write(response.data.html);
                    WinPrint.document.close();
                    return { title: response.notice, content: '' };
                }).catch(function(response) {
                    WinPrint.close();
                    if (response.error_code == 400001) {
                        return Promise.reject(response.errors);
                    } else {
                        ajax.error(response);
                    }
                });
            }
        },

        emailQuote: function(data) {
            var validationErrors = validateParamsForQuote(data, !config.sa && data.name !== undefined ? ['name', 'email', 'phone'] : ['email']);
            if (validationErrors) {
                return Promise.reject(validationErrors);
            } else {
                return ajax.make({
                    url: 'quote/email',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    return { title: response.notice, content: '' };
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        return Promise.reject(response.errors);
                    } else {
                        ajax.error(response);
                    }
                });
            }
        },
        
        callQuote: function(tireId) {
            return ajax.make({
                url: 'quote/call',
                method: 'post',
                data: { tire_id: tireId },
                useGlobalError: false
            }).catch(function (response) {
                return;
            });
        },

        requestQuote: function(data) {
            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone']);
            if (validationErrors) {
                return Promise.reject(validationErrors);
            } else {
                return ajax.make({
                    url: 'quote/request',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    return { title: 'Thank you!', content: response.notice };
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        return Promise.reject(response.errors);
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
                return response.data;
            });
        },

        orderCheckout: function(orderId, data) {
            var validationErrors = validateParamsForQuote(data, ['name', 'email', 'phone', 'vehicle.trim']);
            if (validationErrors) {
                return Promise.reject(validationErrors);
            } else {
                return ajax.make({
                    url: 'order/' + orderId + '/checkout',
                    method: 'post',
                    data: data,
                    useGlobalError: false
                }).then(function(response) {
                    return response.data;
                }).catch(function(response) {
                    if (response.error_code == 400001) {
                        return Promise.reject(response.errors);
                    } else {
                        ajax.error(response);
                    }
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
                return info;
            }).catch(function(response) {
                if (response.error_code == 400001) {
                    return Promise.reject({number: response.errors.token});
                } else {
                    ajax.error(response);
                }
            });
        },

        loadFullStock: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId + '/fullStock',
                cache: true
            }).then(function(response) {
                return response.data.stock;
            });
        },

        loadStock: function(tireId) {
            return ajax.make({
                url: 'tire/' + tireId + '/stock'
            }).then(function(response) {
                return response.data.branches
            });
        },

        loadReviews: function(tireId, offset) {
            offset = offset || 0;

            return ajax.make({
                url: 'tire/' + tireId + '/reviews',
                data: { offset: offset, limit: 5 },
                cache: true
            }).then(function(response) {
                return response.data;
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