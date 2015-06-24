 angular.module('TenLua')
 	.service('MetaInformation', function() {
 		var metaDescription = '';
 		var metaKeywords = '';
 		return {
 			metaDescription: function() {
 				return metaDescription;
 			},
 			metaKeywords: function() {
 				return metaKeywords;
 			},
 			reset: function() {
 				metaDescription = '';
 				metaKeywords = '';
 			},
 			setMetaDescription: function(newMetaDescription) {
 				metaDescription = newMetaDescription;
 			},
 			appendMetaKeywords: function(newKeywords) {
 				for (var key in newKeywords) {
 					if (metaKeywords === '') {
 						metaKeywords += newKeywords[key].name;
 					} else {
 						metaKeywords += ', ' + newKeywords[key].name;
 					}
 				}
 			}
 		};
 	});
