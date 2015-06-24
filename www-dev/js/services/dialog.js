// // USE CASE 1: Message box - when title, body and buttons makes your dialog
//
// var title = "Some title";
// var msg = "<b>Very</b> important question";
// var btns = [{
// 	result: 'CANCEL',
// 	label: 'Cancel'
// }, {
// 	result: 'OK',
// 	label: 'OK',
// 	cssClass: 'btn-primary'
// }];

// dialog.messageBox(title, msg, btns, function(result) {
// 	if (result === 'OK') {
// 		// success!
// 	} else {
// 		// failed...
// 	}
// });


// // USE CASE 2: Passing references to controller - when promise is too much
//
// // dialog controller may refer to important value via $modalInstance.values.importantValue
// dialog.dialog({
// 	templateUrl: '/important_dialog_body.html',
// 	controller: 'ImportantDialogController',
// 	importantValue: $scope.importantValue
// }, function(result) {
// 	if (result === 'OK') {
// 		toastr.success("Everything is ok");
// 	}
// });


// // USE CASES 3: Simpler way to create dialog opening function - when default modal config is enough
//
// // now ng-click="openDialog()" will open dialog
// $scope.openDialog = dialog.simpleDialog('simple_dialog.html',
//                                          'SimpleDialogController'
//                                          // optional result callback function
//                                          [, function (result) { ... }]);



angular.module('TenLua')

.factory('dialog', ['$rootScope', '$modal',
	function($rootScope, $modal) {

		function dialog(modalOptions, closeFn, dismissFn) {
			var dialog = $modal.open(modalOptions);
			if (closeFn) dialog.result.then(closeFn, dismissFn);
			dialog.values = modalOptions;
			return dialog;
		}

		function modalOptions(templateUrl, controller, scope) {
			return {
				templateUrl: templateUrl,
				controller: controller,
				scope: scope
			};
		}

		return {
			/**
			 * Creates and opens dialog.
			 */
			dialog: dialog,

			/**
			 * Returns 0-parameter function that opens dialog on evaluation.
			 */
			simpleDialog: function(templateUrl, controller, closeFn, dismissFn) {
				return function() {
					return dialog(modalOptions(templateUrl, controller), closeFn, dismissFn);
				};
			},

			/**
			 * Opens simple generic dialog presenting title, message (any html) and provided buttons.
			 */
			messageBox: function(icon, title, message, buttons, closeFn, dismissFn) {
				var defaultButtons = [{
					result: true,
					label: 'OK',
					cssClass: 'btn-success'
				}];
				var scope = angular.extend($rootScope.$new(false), {
					icon: icon,
					title: title,
					message: message,
					buttons: buttons ? buttons : defaultButtons
				});
				return dialog(modalOptions("template/message-box.html", 'MessageBoxController', scope), function() {
					var value = closeFn ? closeFn() : undefined;
					scope.$destroy();
					return value;
				}, function() {
					var value = dismissFn ? dismissFn() : undefined;
					scope.$destroy();
					return value;
				});
			}
		};
	}
])

.controller('MessageBoxController', ['$scope', '$modalInstance',
	function($scope, $modalInstance) {
		$scope.close = function(result) {
			if(result){
				$modalInstance.close();
			} else {
				$modalInstance.dismiss();
			}
		}
		// $scope.dismiss = function(reason) {
		// 	$modalInstance.dismiss(reason);
		// }
	}
]);
