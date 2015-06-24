<!-- <script src="http://static.tenlua.vn/jquery-min-1_1.8_1.1_1.js" type="text/javascript"></script>
<script src="http://s.tenlua.vn/pages/payment.js?v=10" type="text/javascript"></script> -->

<script type="text/javascript">

var paymentModalScope = window.opener.$('.payment-methods-modal').scope();
if(typeof paymentModalScope != 'undefined'){


	<?php
	if($_REQUEST['type']=='captcha')
	{
	?>
			paymentModalScope.failCaptcha();
			paymentModalScope.$apply();
	<?php
	}
	elseif($_REQUEST['type']=='nganluong')
	{
	?>
			// paymentModalScope.doChooseGoldDayByNganLuong();
			paymentModalScope.getGoldInfo();
	<?php
	}
	elseif($_REQUEST['type']=='paypal')
	{
	?>
			// paymentModalScope.doChooseGoldDayByPaypal();
			paymentModalScope.getGoldInfo();
	<?php
	}
	elseif($_REQUEST['type']=='ebanking')
	{
	?>
			// paymentModalScope.doChooseGoldDayByEbanking();
			paymentModalScope.getGoldInfo();
	<?php
	}
	?>


	// paymentModalScope.$apply();
};

window.close();
</script>
