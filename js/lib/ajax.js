define(['config', 'promise', 'lodash'], function(config, Promise, _) {
    function Ajax() {
        var $public = {};
        var $private = {};

        $private.methods = {
          done: function() {},
          error: function() {},
          always: function() {}
        };

        $public.get = function get( url, data ) {
          var data = $private.objectToQueryString( data );
          url += (url.indexOf('?') === -1 ? '?' : '&') + data;
          return $private.XHRConnection( 'GET', url );
        };
        $public.post = function post( url, data ) {
          return $private.XHRConnection( 'POST', url, data );
        };

        $public.put = function put( url, data ) {
          return $private.XHRConnection( 'PUT', url, data );
        };

        $public.delete = function del( url, data ) {
          return $private.XHRConnection( 'DELETE', url, data );
        };

        $private.XHRConnection = function XHRConnection( type, url, data ) {
            // console.log(("onload" in new XMLHttpRequest()));
          if (!isIE() || isIE() > 9) {
            var xhr =  new XMLHttpRequest();  
            var contentType = 'application/x-www-form-urlencoded';
            // var contentType = 'text/plain';
            xhr.open( type, url || '', true );
            // xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            xhr.setRequestHeader( 'Content-Type', contentType );
            xhr.addEventListener( 'readystatechange', $private.ready, false );
          } else {
              if (document.location.protocol !== 'https:') {
                  url = url.replace('https', 'http');
              }
            var xhr = new XDomainRequest();
            xhr.open( type, url || '' );
            xhr.onload = function() {
              $private.methods.always
                .apply( $private.methods, $private.parseResponse( xhr ) );
              $private.methods.done
                .apply( $private.methods, $private.parseResponse( xhr ) );
            };
            xhr.onerror = function() {
              $private.methods.always
                .apply( $private.methods, $private.parseResponse( xhr ) );
              $private.methods.error
                .apply( $private.methods, $private.parseResponse( xhr ) );
            };
            xhr.ontimeout = function () { };
            xhr.onprogress = function () { };
          }
          xhr.send( $private.objectToQueryString( data ) );
          return $private.promises();
        };

        $private.ready = function ready() {
          var xhr = this;
          var DONE = 4;
          if( xhr.readyState === DONE ) {
            xhr.removeEventListener( 'readystatechange', $private.ready, false );
            $private.methods.always
              .apply( $private.methods, $private.parseResponse( xhr ) );
            if( xhr.status >= 200 && xhr.status < 300 ) {
              return $private.methods.done
                .apply( $private.methods, $private.parseResponse( xhr ) );
            }
            $private.methods.error
              .apply( $private.methods, $private.parseResponse( xhr ) );
          }
        };

        $private.parseResponse = function parseResponse( xhr ) {
          var result;
          try { result = JSON.parse( xhr.responseText ); }
          catch( e ) { result = xhr.responseText; }
          return [ result, xhr ];
        };

        $private.promises = function promises() {
          var allPromises = {};
          Object.keys( $private.methods ).forEach(function( promise ) {
            allPromises[ promise ] = $private.generatePromise.call( this, promise );
          }, this );
          return allPromises;
        };

        $private.generatePromise = function generatePromise( method ) {
          return function( callback ) {
            return ( $private.methods[ method ] = callback, this );
          };
        };

        $private.objectToQueryString = function objectToQueryString( data ) {
          return $private.isObject( data )
            ? $private.getQueryString( data )
            : data;
        };

        $private.getQueryString = function getQueryString(obj, prefix) {
          var str = [];
          for(var p in obj) {
            if (obj.hasOwnProperty(p)) {
              var k = prefix ? prefix + "[" + p + "]" : p, v = obj[p];
              str.push(typeof v == "object" ?
                $private.getQueryString(v, k) :
                encodeURIComponent(k) + "=" + encodeURIComponent(v));
            }
          }
          return str.join("&");
        };

        $private.isObject = function isObject( data ) {
          return '[object Object]' === Object.prototype.toString.call( data );
        };

        return $public;
    }

    var isIE = function () {
      var myNav = navigator.userAgent.toLowerCase();
      return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    };

    var widgetAjax = function() {
        var self = this;

        var caching = function(url, params) {

            var getKey = function() {
                // return (url + JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, '');
                return caching.getKey(url, params);
            };

            this.addToCache = function(response) {
                caching.cache[getKey()] = response;
            };

            this.getFromCache = function() {
                var response = caching.cache[getKey()];
                return response || null;
            };

            this.addToOneTimeCache = function(response) {
                caching.oneTimeCache[url] = {
                    key: getKey(),
                    response: response
                };
            };

            this.getFromOneTimeCache = function() {
                return caching.oneTimeCache[url] && caching.oneTimeCache[url].key == getKey()
                    ? caching.oneTimeCache[url].response : null;
            };

        };
        caching.cache = {};
        caching.oneTimeCache = {};
        caching.getKey = function(url, params) {
            return (url + JSON.stringify(params)).replace(/[^a-zA-Z0-9]/g, '');
        };

        var inProcessPromises = {};

        var inProcess = function (url, data, val) {
            if (val !== undefined) {
                inProcessPromises[caching.getKey(url, data)] = val;
            } else {
                return inProcessPromises[caching.getKey(url, data)] || false;
            }
        };

        this.beforeSend = function(){};
        this.error = function(e){};  
        this.complete = function(){};

        this.clearCache = function() {
            caching.cache = {};
            caching.oneTimeCache = {};
        };
        
        this.make = function(params) {
            var url = (!(/http/.test(params.url)) ? config.apiBaseUrl : '') + params.url + (/\?/.test(params.url) ? '&' : '?') + 'key=' + config.apikey + (config.sessionId ? '&session_id=' + config.sessionId : '');
            var data = params.data || {};
            var a;

            if (inProcess(url, data)) {
                return inProcess(url, data);
            };

            self.beforeSend();

            var ajax_a = new Ajax();

            var useGlobalError = params.useGlobalError !== undefined ? params.useGlobalError : true;

            var error = function(response, xhrObject) {
                params.error ? params.error(response, xhrObject) : self.error(response, xhrObject);
            };

            var always = function(response, xhrObject) {
                inProcess(url, data, false);
                params.complete ? params.complete(response, xhrObject) : self.complete(response, xhrObject);
            };

            var promise = new Promise(function(resolve, reject) {

                var cacheResponseFor = _.cloneDeep(data);
                if (params.ignoreInCache) {
                    params.ignoreInCache.map(function(param) {
                        delete cacheResponseFor[param];
                    });
                }
                var cache = new caching(url, cacheResponseFor);

                var responseFromCache = '';
                if (params.oneTimeCache) {
                    responseFromCache = cache.getFromOneTimeCache();
                } else if (params.cache) {
                    responseFromCache = cache.getFromCache();
                }

                if (responseFromCache) {
                    resolve(responseFromCache);
                    always(responseFromCache);
                    return;
                }

                switch (params.method || 'get') {
                    case 'get':
                        a = ajax_a.get( url, data );
                        break;
                    case 'post':
                        a =ajax_a.post( url, data );
                        break;
                }

                a.done(function(response, xhr) {
                    if (params.oneTimeCache) {
                        cache.addToOneTimeCache(response);
                    } else if (params.cache) {
                        cache.addToCache(response);
                    }

                    resolve(response, xhr);
                });

                a.error(function(response, xhrObject) {
                    if (useGlobalError) {
                        error(response, xhrObject);
                    } else {
                        reject(response, xhrObject);
                    }
                });

                a.always(always);

            });

            inProcess(url, data, promise);

            return promise;
        }
    }

    return new widgetAjax();
});