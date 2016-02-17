define([], function() {
	return {
		priceFormat: function(_number,_decimal,_separator)
		{
		  var decimal = (typeof(_decimal) != 'undefined') ? _decimal : 2;

		  var separator = (typeof(_separator) != 'undefined') ? _separator : '';

		  var r = parseFloat(_number)

		  var exp10 = Math.pow(10, decimal);
		  r = Math.round(r * exp10) / exp10;

		  var rr = Number(r).toFixed(decimal).toString().split('.');

		  var b = rr[0].replace(/(\d{1,3}(?=(\d{3})+(?:\.\d|\b)))/g,"\$1" + separator);
		  r = b + '.' + rr[1];

		  return r;
		},
		printHtml: function(html, cssUrls)
		{
	        var printWindow = window.open('', 'Print', 'left=0,top=0,width=800,height=800,toolbar=0,scrollbars=0,status=0');
	        printWindow.document.write('<html><head><title>Print</title>');
	        if (cssUrls) {
	        	cssUrls.map(function(url){
	        		printWindow.document.write('<link rel="stylesheet" href="' + url + '" type="text/css" />');
	        	});
	       	}
	        printWindow.document.write('</head><body class="' + config.prefix + 'widget">');
	        printWindow.document.write(html);
	        printWindow.document.write('</body></html>');

	        printWindow.document.close(); // necessary for IE >= 10
	        printWindow.focus(); // necessary for IE >= 10

	        printWindow.print();
	        printWindow.close();

	        return true;
	    },
	    loadCss: function(url) {
          var link = document.createElement("link");
          link.type = "text/css";
          link.rel = "stylesheet";
          link.href = url;
          document.getElementsByTagName("head")[0].appendChild(link);
        },
        getOffset: function(elem) {
	    	// (1)
		    var box = elem.getBoundingClientRect()
		    
		    // (2)
		    var body = document.body
		    var docElem = document.documentElement
		    
		    // (3)
		    var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop
		    var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft
		    
		    // (4)
		    var clientTop = docElem.clientTop || body.clientTop || 0
		    var clientLeft = docElem.clientLeft || body.clientLeft || 0
		    
		    // (5)
		    var top  = box.top +  scrollTop - clientTop
		    var left = box.left + scrollLeft - clientLeft
		    
		    return { top: Math.round(top), left: Math.round(left) }
		},
		CN: function() {
			
		}
	}
});