'use strict';

angular.module( 'TenLua' )
	.filter( 'startFrom', function( ) {
		return function( input, start, pageSize ) {
			if(input){
				start = +start; //parse to int
				pageSize = +pageSize;
				while ( start > input.length ) {
					start -= pageSize;
				}
				if ( start < 0 ) {
					start = 0;
				}
				return input.slice( start );
			}
		};
	} );
