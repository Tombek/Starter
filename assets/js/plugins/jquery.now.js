/*
* jQuery Now event
*
* @version v1.0
*
*/

;(function(){
	jQuery.event.special.now = {
		setup: function(a, b, cb) {
			var self = this;
			setTimeout(function (argument) {
				$(self).trigger('now').off('now');
			});
		}
	};
})(jQuery, window);