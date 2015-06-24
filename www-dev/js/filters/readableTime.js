'use strict';

angular.module('TenLua').filter('readableTime', function() {
	return function(seconds) {
		if(seconds === Number.POSITIVE_INFINITY) return '';
		var day, format, hour, minute, month, week, year;
		seconds = parseInt(seconds, 10);
		minute = 60;
		hour = minute * 60;
		day = hour * 24;
		week = day * 7;
		year = day * 365;
		month = year / 12;
		format = function(number, string) {
			// string = number === 1 ? string : "" + string + "s";
			return "" + number + " " + string;
		};
		switch (false) {
			case !(seconds < minute):
				return format(seconds, 'giây');
			case !(seconds < hour):
				return format(Math.floor(seconds / minute), 'phút');
			case !(seconds < day):
				return format(Math.floor(seconds / hour), 'giờ');
			case !(seconds < week):
				return format(Math.floor(seconds / day), 'ngày');
			case !(seconds < month):
				return format(Math.floor(seconds / week), 'tuần');
			case !(seconds < year):
				return format(Math.floor(seconds / month), 'tháng');
			default:
				return format(Math.floor(seconds / year), 'năm');
		}
	};
});
