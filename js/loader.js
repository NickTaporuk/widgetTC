define([
	'react',
	'MicroEvent'
], function(
	React,
	microEvent
) {

	// var config = require('config');

	// var mobileLiterals = {
	// 	'popups/Prices': true,
	// 	'SearchForm': true,
	// 	'SearchResults': true,
	// 	'Tire': true
	// };

	// var appsLiterals = {
	// 	'in_store': {
	// 		'desktop': {
	// 			'popups/Prices': true,
	// 			'popups/QuoteForm': true
	// 		},
	// 		'mobile': {
	// 			'popups/Prices': true
	// 		}
	// 	}
	// };

	return {
		load: function(name, req, onload, _config) {
			// var deskPath = 'components/desktop/' + name;
			// var mobPath = 'components/mobile/' + name;
			if (_config.isBuild) {
				// used by optimizer:
				// var paths = [deskPath];
				// if (mobileLiterals[name]) {
				// 	paths.push(mobPath);
				// }

				// Object.keys(appsLiterals).map(function(app) {
				// 	if (appsLiterals[app]['desktop'] && appsLiterals[app]['desktop'][name]) {
				// 		paths.push('components/apps/' + app + '/desktop/' + name);
				// 	}
				// 	if (appsLiterals[app]['mobile'] && appsLiterals[app]['mobile'][name]) {
				// 		paths.push('components/apps/' + app + '/mobile/' + name);
				// 	}
				// });

				// req(paths, function() {
				// 	onload()
				// });
			} else {
				// var isMobile = require('isMobile');

				// var app = config.sa ? 'in_store' : 'default',
				// 	device = isMobile.any ? 'mobile' : 'desktop';

				// var path;
				// if (appsLiterals[app]) {
				// 	if (appsLiterals[app][device] && appsLiterals[app][device][name]) {
				// 		path = 'components/apps/' + app + '/' + device + '/' + name;	
				// 	} else if (isMobile.any && appsLiterals[app]['desktop'] && appsLiterals[app]['desktop'][name]) {
				// 		path = 'components/apps/' + app + '/desktop/' + name;
				// 	}
				// }
				// if (!path) {
				// 	path = isMobile.any && mobileLiterals[name] ? mobPath : deskPath;
				// }

				var path = 'js/' + name;

		    	req([path], function (value) {
					if (name.indexOf('components') === 0) {
						value = React.createClass(value);
					} else if (name.indexOf('stores') === 0) {
						value = microEvent.mixin(value);
					}

		            onload( value );
		        });
		    }
		}
	};
});