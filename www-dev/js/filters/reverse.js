'use strict';

angular.module('TenLua').filter('reverse', function() {
	return function(items) {
		return items.slice().reverse();
	};
});
