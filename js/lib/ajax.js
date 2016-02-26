define(['config', 'isMobile'], function(config, isMobile) {
	var instance = null;

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
		}

		$private.isObject = function isObject( data ) {
		  return '[object Object]' === Object.prototype.toString.call( data );
		};

		return $public;
	}

	var isIE = function () {
	  var myNav = navigator.userAgent.toLowerCase();
	  return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
	}


	// var promise = function() {
 //        var response = null;

 //        var methods = {
 //            success: [],
 //            error: []
 //        };

 //        this.resolve = function(resp) {
 //            response = resp;
 //            success();
 //        };

 //        this.reject = function(resp) {
 //        	response = resp;
 //        	error();
 //        }

 //        var processResponse = function(type) {
 //            if (response) {
 //            	var count = methods[type].length;
 //                for (var i = 0; i < count; i++) {
 //                    response = methods[type][i](response);    
 //                }
 //                response = null;
 //                methods.success = [];
 //                methods.error = [];
 //            }
 //        } 

 //        var success = function() {
 //            processResponse('success');
 //        }

 //        var error = function() {
 //        	processResponse('error');
 //        }

 //        this.then = function(onFulfilled, onRejected) {
 //        	if (onFulfilled && typeof onFulfilled == 'function') {
 //            	methods.success.push(onFulfilled);
 //            	success();
 //        	}
 //        	if (onRejected && typeof onRejected == 'function') {
 //            	methods.error.push(onRejected);
 //            	error();
 //        	}
            
 //            return this;
 //        }
 //    };


	var ajax2 = function() {
		var self = this;

		this.beforeSend = function(){};
		this.error = function(e){};
		this.complete = function(){};

		// var ajaxCounter = 0;
		// this.isBusy = function() {
		// 	return ajaxCounter > 0;
		// };

		this.make = function(params) {
			var url = config.apiBaseUrl + params.url + (/\?/.test(params.url) ? '&' : '?') + 'key=' + config.apikey + (config.sessionId ? '&session_id=' + config.sessionId : '')
			var a;

			self.beforeSend();
			// ajaxCounter++;

			var ajax_a = new Ajax();
			var data = params.data || {}
			switch (params.method || 'get') {
				case 'get':
					a = ajax_a.get( url, data );
					break;
				case 'post':
					a = ajax_a.post( url, data );
					break;
			}

			var p = new Promise(function(resolve, reject) {
				a.done(function(response, xhr) {
					resolve(response);
				});
				a.error(function(response, xhrObject) {
					reject(response);
					params.error ? params.error(response, xhrObject) : self.error(response, xhrObject);
				});
				a.always(function(response, xhrObject) {
					// ajaxCounter--;
					params.complete ? params.complete(response, xhrObject) : self.complete(response, xhrObject);
				});
			});


			return p;
		}
	}

	ajax2.getInstance = function(){
        if(instance === null){
            instance = new ajax2();
        }
        return instance;
    };

	return ajax2.getInstance();
});