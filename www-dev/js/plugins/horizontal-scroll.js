(function ($) {
	$.fn.horiScroll = function(){
		return this.each(function(){
			var containerIsHTML = $(this).is('html');

			function containerWheel(e){
				e.preventDefault();
				var $container=$(this),
					Delta=$container.data('iDelta');
				if(Delta==0){
					Delta += e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/120 : -e.originalEvent.detail/3;
					$container.data('iDelta',Delta);
					if(containerIsHTML)
						doScrollHTML(true,$container);
					else
						doScroll(true,$container);
				} else {
					clearTimeout($container.data('timerContainerScroll'));
					Delta += e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/120 : -e.originalEvent.detail/3;
					$container.data('iDelta',Delta);
					if(containerIsHTML){
						$container.data('timerContainerScroll', setTimeout(function(){
							doScrollHTML(null,$container);
						}, 70));
					} else {
						$container.data('timerContainerScroll', setTimeout(function(){
							doScroll(null,$container);
						}, 70));
					}
				}
			};

			function doScroll(firstTime,container){
				var jumpStep=400,
					$container=$(container),
					intendedJump = $container.data('iDelta') */* 200;*/(firstTime ? 500 : jumpStep),
					remainLeft = $container.scrollLeft(),
					remainRight = $container[0].scrollWidth - ( remainLeft + $container.width() ),
					iScroll=$container.data('intScroll');
				iScroll -= intendedJump;
				iScroll = Math.min(($container[0].scrollWidth - $container.width()), Math.max(0, iScroll));
				$container.data('intScroll',iScroll);
				if(!firstTime){
						$container.stop().animate({scrollLeft: iScroll}, {easing: 'easeOutCubic', duration:800} );
						$container.data('iDelta',0);
				} else {
						$container.stop().animate({scrollLeft: iScroll}, {easing: 'easeOutCubic', duration:700} );
				}
			};

			function doScrollHTML(firstTime,container){
				var jumpStep=400,
					$container=$(container),
					viewportWidth = $(window).width();
					intendedJump = $container.data('iDelta') */* 200;*/(firstTime ? 500 : jumpStep),
					remainLeft = $(window).scrollLeft(),
					remainRight = $container[0].scrollWidth - ( remainLeft + viewportWidth ),
					iScroll=$container.data('intScroll');
				iScroll -= intendedJump;
				iScroll = Math.min(($container[0].scrollWidth - viewportWidth), Math.max(0, iScroll));
				$container.data('intScroll',iScroll);
				if(!firstTime){
						$('html, body').stop().animate({scrollLeft: iScroll}, {easing: 'easeOutCubic', duration:800} );
						$container.data('iDelta',0);
				} else {
						$('html, body').stop().animate({scrollLeft: iScroll}, {easing: 'easeOutCubic', duration:700} );
				}
			};

			$(this).data({'iDelta':0, 'intScroll':0})
			if(containerIsHTML){
				$(window).on('scroll', function(){
					$('html').data('intScroll',$(window).scrollLeft());
				});
			} else {
				$(this).on('scroll', function(){
					$(this).data('intScroll',$(this).scrollLeft());
				});
			}

			$(this).on('mousewheel DOMMouseScroll', containerWheel);

			$(this).on('mousewheel DOMMouseScroll', '.preventMouseWheelOut', function(e) {
				e.stopPropagation();
			});
		});
	};

})(jQuery);