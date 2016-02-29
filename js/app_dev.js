var params = {
	api: false, // if true api from server will be used
	assets: false, // if true assets from server will be used
	live: false, // if true live server will be used, otherwise dev server will be used
	sa: false, // if true will be loaded in store version
	optim: false // if true optimized/minified js will be used
};

// update params base on url
var urlParams = window.location.search.replace('?', '').split('&');
var urlParamsLength = urlParams.length;
for (var i = 0; i < urlParamsLength; i++) {
	params[urlParams[i]] = true;
}

// local settings for different domains
var localSettings = {
	'wlwidget.mrp2': {
		apikey: '73ae3b76653aabf5eea018b1a98532a2',
		scriptPlace: 'http://wlwidget.mrp2',
		apiBaseUrl: 'http://gmtwl.mrp/api/v1/'
	},
	'tcwidget.local': {
		apikey: 'cbc3d812f6d6ede9b34278d8b6532c59',
		scriptPlace: 'http://tcwidget.local',
		apiBaseUrl: 'http://gmtwl.local/api2_dev.php/'
	},
	'tcwidget.dev': {
		apikey: 'cbc3d812f6d6ede9b34278d8b6532c59',
		scriptPlace: 'http://tcwidget.dev',
		apiBaseUrl: 'http://gmtwl.dev/api2_dev.php/'
	},
	'tcwidget.srt': {
		apikey: 'cbc3d812f6d6ede9b34278d8b6532c59',
		scriptPlace: 'http://tcwidget.srt',
		apiBaseUrl: 'http://gmtwl.srt/api/v1/'
	}
};
var serverSettings = {
	apikey: params.live ? '4bfb8dedd92803b26e401bb4e0eff242' : '4bfb8dedd92803b26e401bb4e0eff242',
	scriptPlace: params.live ? 'https://app.tireconnect.ca' : 'https://dev.tireconnect.ca/app',
	apiBaseUrl: params.live ? 'https://wl.tireconnect.ca/api2.php/' : 'https://dev.tireconnect.ca/api2.php/'
};

var domain = window.location.host;
var hasLocalSettigns = typeof localSettings[domain] !== 'undefined';
var settings = {
	apikey: (params.api || !hasLocalSettigns ? serverSettings.apikey : localSettings[domain].apikey),
	scriptPlace: (params.assets || !hasLocalSettigns ? serverSettings.scriptPlace : localSettings[domain].scriptPlace),
	apiBaseUrl: (params.api || !hasLocalSettigns ? serverSettings.apiBaseUrl : localSettings[domain].apiBaseUrl)
};


requirejs([ (params.optim ? (settings.scriptPlace + '/js/widget.js') : 'app') ], function() {
	
	TCWidget.init({
	  apikey: settings.apikey,
	  container: 'content',
	  sa: params.sa,
	  scriptPlace: settings.scriptPlace,
	  apiBaseUrl:  settings.apiBaseUrl
	});
});