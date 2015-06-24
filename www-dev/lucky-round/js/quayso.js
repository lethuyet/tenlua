var _api_domain = 'http://api2.tenlua.vn/';
var _root_domain = 'http://www.tenlua.vn/';
var _dataLD = [{'90':1},{'180':2},{'365':3},{'0':4},{'7':5},{'30':6}];

function luckyRoundRememberClose(){
	window.localStorage.setItem('ngStorage-LuckyRoundBanner-closeRemembered', '"closed"');
}

function quayso()
{
	
	var ssid=window.localStorage.getItem('ngStorage-AUTH_sessionId');
	//console.log(ssid);

	$.ajax({
		type: "POST",
		url:_api_domain+'user/index/get-gold-for-version2?ssid='+ssid
	})
	.success(function( jsonRespone ) {
		var data=jQuery.parseJSON(jsonRespone);
		switch(data['status']){
			case 1:
				$("#thongbao").html('<center>Chúc mừng bạn nhận được <br><b>"'+data['day']+' ngày GOLD MEMBER"</b> <br>trên tenlua.vn. Hãy khám phá và trải nghiệm những tính năng thú vị với tenlua version 2 nhé!</center>');
				$("#circle").start(data['pos']);
				$("#btnClose2").show();
				$("#btnClose1").hide();
				$("#btnClose3").hide();
				luckyRoundRememberClose();
				break;
			case 2:
				$("#thongbao").html('Bạn hãy đăng nhập để được QSMM nhé!');
				$('#notificationModal').modal("show");
				$("#btnClose1").hide();
				$("#btnClose2").show();
				$("#btnClose3").hide();
				break;
			case 3:
				$("#thongbao").html(' Tài khoản của bạn không hợp lệ. Hãy đăng ký thành viên miễn phí để được tham gia Game!');
				$('#notificationModal').modal("show");
				$("#btnClose1").hide();
				$("#btnClose2").show();
				$("#btnClose3").hide();
				luckyRoundRememberClose();
				break;
			case 4:
				$("#thongbao").html(' Bạn đã nhận được quà rồi. Hãy giới thiệu cho bạn bè bạn tham gia để nhận quà tiếp nhé!');
				$('#notificationModal').modal("show");
				$("#btnClose2").show();
				$("#btnClose1").hide();
				$("#btnClose3").hide();
				luckyRoundRememberClose();
				break;
			case 5:
				$("#thongbao").html('Bạn chưa nhận được quà lần này rồi! Hãy quay lại lần nữa nhé!');
				$("#circle").start(data['pos']);
				
				$("#btnClose1").hide();
				$("#btnClose2").hide();
				$("#btnClose3").show();
				luckyRoundRememberClose();
				break;
			
		}
		
		

//1: Nhận được quà. Chúc mừng bạn nhận được 7 ngày gold member trên tenlua.vn. Chúc bạn khám phá nhiều tính năng hay trên tenlua.vn

	})
	.done(function( msg ) {
		//alert( "Data Saved: " + msg );
	});



}

function resetQS()
{

	
	$("#circle").luckydraw(

		{
			'data':_dataLD,
			'finished':function(){$('#notificationModal').modal("show");}
		}
	);	
}


function init_quayso()
{
	
	
	$("#circle").luckydraw(

		{
			'data':_dataLD,
			'finished':function(){$('#notificationModal').modal("show");}
		}
	);	

	//$("#circle").css({'display':'block'}).luckydraw({finished:function(){alert('thanh cong');}});	

	// $.ajax({
	// 	type: "POST",
	// 	url:_api_domain+'user/index/get-gold-for-version2?ssid='+ssid
	// })
	// .success(function( jsonRespone ) {
	// 	var data=jQuery.parseJSON(jsonRespone);
	// 	console.log(jsonRespone);
	// 	$("#circle").luckydraw({'data':data,finished:function(){alert('thanh cong');}});	
	// })
	// .done(function( msg ) {
	// 	alert( "Data Saved: " + msg );
	// });

//lấy danh sách giải thưởng và kiểm tra xem có dc quay ko  và có bao nhiêu lượt quay
// var req = 
//     { 
// 	  	a: 'user_quayso_info',
//       	r:Math.random()
// 	};
//     api_req([req],
// 	{ 
// 	  	callback : function (json,params)
// 	  	{

// 	  		if ((typeof json == 'number') && (json[0] < 0))
// 			{
			  
// 			}
// 			else
// 			{ 
// 	          if(json['status'] == 0)//không hợp lệ, do chưa đăng nhập
// 	          {
// 	            alert(l[977]);
// 	            return false;
// 	          }
// 	          else
// 	          {
// 	          	//init vong2 quay
// 	            var data=json['data'];
// 				$("#circle").css({'display':'block'}).luckydraw({'data':data,finished:function(){alert('thanh cong');}});	
// 	          }
	          
// 			}


// 	  	}
// 	});	

	
}

// $(document).ready(function(){
// 	var data = [{'7':1},{'0':2},{'365':3},{'180':4},{'90':5},{'30':6}];
// 	$("#circle").luckydraw(
// 		{
// 			'data':data,
// 			'finished':function(){}
// 		}
// 	);	
// });

//$(document).ready(function(){

	//init_quayso();
//});


	
$("#circle").luckydraw(

	{
		'data':_dataLD,
		'finished':function(){$('#notificationModal').modal("show");}
	}
);	