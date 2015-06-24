'use strict';

angular.module('TenLua')
	.directive('slideshow', function(filesSrv, $q, PROTOCOL) {
		return {
			restrict: 'A',
			templateUrl: 'template/slideshow.html',
			replace: true,
			link: function postLink(scope, element, attrs) {

				scope.jwplayerId = 'playerQAgkvRhmEVvP';
				scope.jwplayerSetup = {
					// type: 'mp4',
					// primary: 'html5',
					primary: 'flash',
					width: '100%',
					height: '100%',
					aspectratio: '16:9',
					autostart: true,
					fallback: false,
					flashplayer: 'js/conditional-resource/jwplayer.flash.6.10.swf',
					html5player: 'js/conditional-resource/jwplayer.html5.6.10.js'
					// file: 'http://s05.tenlua.vn/video/g2SoFtDyqfFMHlBbe2g9RqiisVbacqPzzG7fU1srP28,/ni4zgfe8d3ye6u1XiPzQp0uxnYjJBT_G3aYMi_zCqYQ,/MFdrmSaWTTb5lbmOE2_mI65HSK7TTBSTOBTkCbpoNRU,/youtube-il-divo-the-power-of-love.flv',
					// image: 'http://s05.tenlua.vn/image/g2SoFtDyqfFMHlBbe2g9RqiisVbacqPzzG7fU1srP28,/ni4zgfe8d3ye6u1XiPzQp0uxnYjJBT_G3aYMi_zCqYQ,/MFdrmSaWTTb5lbmOE2_mI65HSK7TTBSTOBTkCbpoNRU,/youtube-il-divo-the-power-of-love.jpg',
					// title: 'YouTube - Il Divo - The Power Of Love.flv'
				}

				function getJwplayer(){
					var defered = $q.defer();
					if(typeof jwplayer !== 'undefined'){
						defered.resolve(jwplayer(scope.jwplayerId));
					} else {
						// $.getScript('js/conditional-resource/jwplayer.6.10.js',function(){
						// 	defered.resolve(jwplayer(scope.jwplayerId));
						// })
						$.ajax({
							dataType: "script",
							cache: true,
							url: 'js/conditional-resource/jwplayer.6.10.js'
						}).done(function(){
							defered.resolve(jwplayer(scope.jwplayerId));
						});
					}
					return defered.promise;
				}

				function removeJwplayer(nodeToBeShown){
					var defered = $q.defer();
					if(typeof jwplayer !== 'undefined'){
						if(nodeToBeShown !== filesSrv.slideShowingNode && jwplayer(scope.jwplayerId).getState()){
							// element.removeClass('viewing-video');
							jwplayer(scope.jwplayerId).stop();
							jwplayer(scope.jwplayerId).remove();
							defered.resolve();
						} else if (!filesSrv.slideShowingNode){
							jwplayer(scope.jwplayerId).stop();
							jwplayer(scope.jwplayerId).onReady(function(){
								jwplayer(scope.jwplayerId).remove();
								defered.resolve();
							});
							// defered.reject();
						}
						// if(jwplayer(scope.jwplayerId)){
						// 	jwplayer(scope.jwplayerId).remove();
						// }
					} else {
						defered.resolve();
					}
					return defered.promise;
				}

				function loadSlideshowVideo(){
					angular.extend(scope.jwplayerSetup, {
						file: filesSrv.slideShowingNode.video,
						image: getSizedImage(),
						title: filesSrv.slideShowingNode.name
					});
					if(filesSrv.isVideoHard(filesSrv.slideShowingNode)){
						scope.jwplayerSetup.type = 'mp4';
						// scope.jwplayerSetup.primary = 'flash';
					} else {
						delete scope.jwplayerSetup.type;
						// scope.jwplayerSetup.primary = 'flash';
					}
					getJwplayer().then(function(player){
						// element.addClass('viewing-video');
						player.setup(scope.jwplayerSetup);
					});
				};

				function loadSlideshowMusic(){
					angular.extend(scope.jwplayerSetup, {
						file: filesSrv.slideShowingNode.music,
						title: filesSrv.slideShowingNode.name
					});
					delete scope.jwplayerSetup.type;
					getJwplayer().then(function(player){
						player.setup(scope.jwplayerSetup);
					});
				};

				function loadSlideshowImage(){
					filesSrv.slideShowingNode.viewingImage = getSizedImage();
				};

				function loadSlideshowDoc(){
					scope.docSrc = PROTOCOL + '//docs.google.com/viewer?hl=vi&embedded=true&url=' + encodeURIComponent(filesSrv.slideShowingNode.doc);
				};

				function getSizedImage(){
					var image = null;
					var viewPortWidth = $(window).width();
					var viewPortHeight = $(window).height();
					if(viewPortWidth < 768){
						image = filesSrv.slideShowingNode.imageSmall;
					} else if(viewPortWidth >= 768 && viewPortWidth < 1600){
						image = filesSrv.slideShowingNode.imageMedium;
					} else {
						image = filesSrv.slideShowingNode.imageLarge;
					}
					return image;
				}

				scope.slideshowHasItem = function(){
					return filesSrv.slideShowingNode && filesSrv.currentNodesList && typeof filesSrv.currentNodesList.slideShowingNodes != 'undefined' && filesSrv.currentNodesList.slideShowingNodes.length;
				}

				scope.showNode = function(nodeToBeShown){
					if(filesSrv.isVideo(filesSrv.slideShowingNode) || filesSrv.isMusic(filesSrv.slideShowingNode)){
						removeJwplayer(nodeToBeShown).then(function(){
							filesSrv.openNode(nodeToBeShown);
						});
					} else {
						filesSrv.openNode(nodeToBeShown);
					}
				}

				scope.showPrevNode = function(){
					if(filesSrv.isVideo(filesSrv.slideShowingNode)){
						removeJwplayer().then(function(){
							filesSrv.slideShowPrevNode();
						});
					} else {
						filesSrv.slideShowPrevNode();
					}
				}

				scope.showNextNode = function(){
					if(filesSrv.isVideo(filesSrv.slideShowingNode)){
						removeJwplayer().then(function(){
							filesSrv.slideShowNextNode();
						});
					} else {
						filesSrv.slideShowNextNode();
					}
				}

				$(window).on('filesSrv.slideshow', $.debounce(50, function() {
					if (filesSrv.slideShowingNode) {
						// removeJwplayer().then(function(){
							if(filesSrv.isVideo(filesSrv.slideShowingNode)){
								loadSlideshowVideo();
							} else if(filesSrv.isPicture(filesSrv.slideShowingNode)){
								loadSlideshowImage();
								scope.$digest();
							} else if(filesSrv.isMusic(filesSrv.slideShowingNode)){
								loadSlideshowMusic();
							} else {
								loadSlideshowDoc();
								scope.$digest();
							}
							// scope.$digest();
						// });
					}
				}));

				$(window).on(orientationEvent, $.debounce(500, function() {
					if (filesSrv.slideShowingNode) {
						loadSlideshowImage();
						scope.$digest();
					}
				}));

				$(document).on('keydown', $.debounce(30, function(e) {
					if (filesSrv.slideShowingNode) {
						if (e.keyCode == 27) {
							filesSrv.closeSlideshow();
							scope.$apply();
						} else{
							if(filesSrv.isPicture(filesSrv.slideShowingNode) || filesSrv.isVideo(filesSrv.slideShowingNode)){
								if (e.keyCode == 37) {
									// filesSrv.slideShowPrevNode();
									scope.showPrevNode();
									scope.$apply();
								} else if (e.keyCode == 39) {
									// filesSrv.slideShowNextNode();
									scope.showNextNode();
									scope.$apply();
								}
							}
						}
					}
				}));

				// // $(document).on('click', '#Slideshow .preview > .jwplayer', function(e){
				// // 	e.stopPropagation();
				// // });
				// $(document).on('click tap', '#Slideshow .preview > div', function(e){
				// 	e.stopPropagation();
				// });

				// Hammer('#Slideshow .arrows-wrap .arrow.prev').on('tap', function(e){
				// 	// e.gesture.preventDefault();
				// 	// e.gesture.stopDetect();
				// 	e.stopPropagation();
				// 	e.gesture.stopPropagation()
				// 	scope.showPrevNode();
				// 	scope.$apply();
				// });

				// Hammer('#Slideshow .arrows-wrap .arrow.next').on('tap', function(e){
				// 	// e.gesture.preventDefault();
				// 	// e.gesture.stopDetect();
				// 	e.stopPropagation();
				// 	e.gesture.stopPropagation()
				// 	scope.showNextNode();
				// 	scope.$apply();
				// });

				Hammer('#Slideshow .preview > div').on('tap', function(e){
					e.stopPropagation();
					e.gesture.stopPropagation();
					e.gesture.stopDetect();
				});


				// $(document).on('click', '#Slideshow .preview', function(e){
				// 	element.toggleClass('full');
				// });
				Hammer('#Slideshow .preview').on('dragleft dragright swipeleft swiperight', function(e){
					if($('html').is('.viewing-picture')){
						e.gesture.preventDefault();
						switch (e.type) {
							case 'swipeleft':
								e.gesture.stopDetect();
								e.preventDefault();
								scope.showNextNode();
								scope.$apply();
								break;
							case 'swiperight':
								e.gesture.stopDetect();
								e.preventDefault();
								scope.showPrevNode();
								scope.$apply();
							 	break;
						}
					}
				}).on('tap', function(e){
					if($('html').is('.viewing-picture')){
						element.toggleClass('full');
					}
				});

				// element.find('.preview').click(function(e){
				// 	element.toggleClass('full');
				// });/*.children('div').click(function(e){
				// 	e.stopPropagation();;
				// });*/


				$.rightofscreen = function(ele, container, settings) {
					var fold = $(container).width() + $(container).scrollLeft();
					return fold <= $(ele).position().left + $(container).scrollLeft() - settings.threshold;
				};

				$.leftofscreen = function(ele, container, settings) {
					var left = $(container).scrollLeft();
					return left >= $(ele).position().left + $(container).scrollLeft() + $(ele).width() - settings.threshold;
				};

				var $filmStrip = element.find('.film-strip').horiScroll();

				scope.$watch('filesSrv.slideShowingNode', function(showingNode) {
					// if(showingNode && filesSrv.currentNodesList && typeof filesSrv.currentNodesList.slideShowingNodes != 'undefined' && filesSrv.currentNodesList.slideShowingNodes.length){
					if(showingNode){
						$('html').addClass('slideshow-mode');
						if(filesSrv.isMusic(filesSrv.slideShowingNode)){
							$('html').addClass('viewing-music');
						} else if(filesSrv.isVideo(filesSrv.slideShowingNode)){
							$('html').addClass('viewing-video');
						} else if(filesSrv.isPicture(filesSrv.slideShowingNode)){
							$('html').addClass('viewing-picture');
						} else if(filesSrv.isDoc(filesSrv.slideShowingNode)){
							$('html').addClass('viewing-doc');
						}
					}

					if(scope.slideshowHasItem() && !filesSrv.isMusic(filesSrv.slideShowingNode) && !filesSrv.isDoc(filesSrv.slideShowingNode)){
						setTimeout(function(){
							// $('html').addClass('slideshow-mode');
							var $node = $filmStrip.find('.file-img').eq(filesSrv.indexOfSlideShowingNode());
							var _node = $node[0];
							var nodeWidth = $node.width();
							var filmStripWidth = $filmStrip.width();
							var scrollOffset = -filmStripWidth / 2 + nodeWidth / 2;
							setTimeout(function(){
								if ($.leftofscreen(_node, $filmStrip[0], {threshold: 0}) || $.rightofscreen(_node, $filmStrip[0], {threshold: 0})) {
									$filmStrip.scrollTo(_node, 300, {
										axis: 'x',
										offset: scrollOffset
									});
								}
							},800);
						},0);
					} else if(!showingNode){
						$('html').removeClass('slideshow-mode viewing-music viewing-video viewing-picture viewing-doc');
						element.removeClass('full');
						removeJwplayer();
						scope.docSrc = '';
					}
				});

			} // end link: function postLink
		};
	});
