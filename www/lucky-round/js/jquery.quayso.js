//Bạn cần đặt function quanh $ để tránh trường hợp bị trùng lặp
(function($){

	// Đặt các giá trị mặc định
	var options;
	var defaults = {
		minDegree: 19800,//Số độ cần để quay
		plugDegree:0,//số vòng quay thêm, dựa vào vị trí bắt đầu của bánh xe
		round:50,//số vòng quay đến khi dừng
		//degreeItem: 45,//số độ của từng Item
		animateTimer:10,//thoi gian animate tinh bang giay
		numberItem:8,//số lượng quà 
		finished:function(){},
		action:'',//link post ajax,
		pos:0,//vị trí trúng thưởng trên bánh xe
		posRoot:1,//Vị trí bắt đầu của vòng quay
		data:[]
	};
	
	//set ket qua vị trí
	
	$.fn.start=function(pos){	
		defaults.pos=pos;
		



		//tinh degree
		var dggg=options.degreeItem*(defaults.pos)-options.degreeItem/2;
		
		dggg+=options.minDegree+options.plugDegree;
		//dggg=options.degree;
		
		var obj=$(this);
		

		obj.find(".ld-vongtron").css({'-webkit-transform':' rotate(-'+dggg+'deg)',
												'-moz-transform':' rotate(-'+dggg+'deg)',
												'-ms-transform':' rotate(-'+dggg+'deg)',
												'-o-transform':' rotate(-'+dggg+'deg)',
												'transform':' rotate(-'+dggg+'deg)',
												'-webkit-transition':options.animateTimer+'s',
												'-moz-transition':options.animateTimer+'s',
												'-ms-transition':options.animateTimer+'s',
												'-o-transition':options.animateTimer+'s',
												'transition':options.animateTimer+'s'
												});

	   setTimeout(function(){
			//alert("Bạn sẽ tặng quà cho "+arrData['name']);
			//window.location.href="/quayso/";
			options.finished();
	   },(options.animateTimer+0)*1000);
		
	};


	
	// Thông báo phương thức tới jQuery
 	$.fn.extend({ 
 		
		
		
 		//Đây là phần bạn viết tên plugin
 		luckydraw: function(options1) {
 			


			options = $.extend(defaults, options1);
			options.numberItem=options.data.length;
			options.degreeItem=360/options.numberItem;
			options.finished=options.finished;
			options.minDegree=options.round*360;			
			options.plugDegree=options.degreeItem*options.posRoot-options.degreeItem/2;
			

			//console.log(options);
			

			// Kiểm tra từng element và xử lý
    		return this.each(function() {
				//console.log(options);
				var obj=$(this);
				 obj.addClass("circle")
					.addClass("animate-enter")
					.addClass("ld-quayso");

				obj.html('<div class="ld-vongtron animate-enter"></div>'+
						'<div class="ld-kim" onclick="quayso()"></div>');

				obj.find(".ld-vongtron").css({'-webkit-transform':' rotate('+options.plugDegree+'deg)',
												'-moz-transform':' rotate('+options.plugDegree+'deg)',
												'-ms-transform':' rotate('+options.plugDegree+'deg)',
												'-o-transform':' rotate('+options.plugDegree+'deg)',
												'transform':' rotate('+options.plugDegree+'deg)'});
				
			
				 

    		});
    	}
	});
})($);
