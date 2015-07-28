<?php
require('config/globalconfig.php');
require("classes/user_payment.php");
require('classes/user_transfer_mark.php');
//echo common_functions::getDateTime();
//echo strtotime('2013-03-20 10:12:12');
//return;
//echo common_functions::getDatetimeFromTimeStamp('Y-m-d H:i:s',1363107599);
//$strActiveDate = 1363749132;
//Xoa thong tin session duoc tang kem
//$newAllowMaxDateUser = strtotime ( '+7 day' , $strActiveDate ) ;
//echo common_functions::getDatetimeFromTimeStamp('Y-m-d 23:59:59',1364403599);
//return;
//echo common_functions::hc_decode('b2f5af4743667ib6ek3nb8dc3614gnMO');
unset($_SESSION['info-app-gift']);
unset($_SESSION['confirm-app-gift']);
$arrListAppForAdults = array(8,7,21,20);
$arrListAppForChildren = array(50,51,52,53);
//End Xoa thong tin session duoc tang kem
$c_userInfo = $_SESSION[consts::SES_C_USERINFO];
$payment = new user_payment($objConnection);
$app_id = common_functions::hc_decode($_pgR['aid']);
/*(in_array($app_id,$arrListAppForAdults))
{
    $app_id = 55;
}
elseif(in_array($app_id,$arrListAppForChildren))
{
    $app_id = 56;
}*/
$infoApp = $payment->getInfoAppByAppID($app_id);
if($infoApp)
{
    $appName = $infoApp['0']['title'];
    $discount_plan = $infoApp['0']['discount_plan'];
    $discount = $payment->getDiscountByDiscoutPlan($discount_plan);
    //echo $discount,'-';
    //$tempDiscount = $discount;
    $hasDiscount = true;
    if($discount ===false)
    {
        $discount = 0;
        $hasDiscount = false;
    }
    //Xy ly cho truong hop tang user moi va user cu
    if($c_userInfo)
    {
        /*$tmpDiscount = $discount;
        if($c_userInfo)
        {
            $discount = common_functions::getInfoSpecialSaleForNewUserAndOldUser($objConnection,$c_userInfo['user_id'],$app_id);
        }
        if(!$discount)
        {
            $discount = $tmpDiscount;
        }*/
        //echo $discount,'-';
        //echo $c_userInfo['active_date'];
        $typeMess = common_functions::getMessForNewUserAndOldUser(strtotime($c_userInfo['active_date']),$app_id);
        //echo $typeMess;
        if($typeMess == 1 || $typeMess == 2)
        {
            //echo 'test';
            $hasDiscount = true;
        }
        elseif($typeMess == 3 || $typeMess == 4|| $typeMess == 1|| $typeMess == 2)
        {
            $tempDiscount = true;
        }
        else
        {
        	//$hasDiscount = false;
        	$tempDiscount = false;
        }
    }
    $group_id = $c_userInfo[consts::SES_USER_GROUP_ID];
    if(!$group_id)
    {
    	$group_id = 0;
    }	
    if($c_userInfo)
    {
        if($group_id.'' == '0')
        {
            $discount = 0;
        }
        else
        {
            $discount = 50;
            $tempDiscount = true;
            $typeMess = 100;
        }
    }
    else
    {
        $group_id =0;
        $discount = 0;
    }
    //echo $discount;
    //echo $typeMess;
    //echo $typeMess;
    //return;
    //Ket thuc xy ly cho truong hop tang user moi va user cu
    $arrListCurrentDiscount = $payment->getInfoDiscountByAppIDAndDiscountAmount($app_id,$discount,$group_id);
    /*echo "<pre>";
    var_dump($arrListCurrentDiscount);
    echo "</pre>";*/
    $arrListNoDiscount = $payment->getInfoDiscountByAppIDAndDiscountAmount($app_id,0,$group_id,true);
    $sms = $arrListCurrentDiscount['sms'];
    $best_buy = $arrListCurrentDiscount['best_buy'];
    $arrCurrentDiscount = $arrListCurrentDiscount['discount'];
    $arrAppGift = $arrListCurrentDiscount['have_gift'];
    $arrNoDiscount = $arrListNoDiscount['discount'];
    $plusBluemember = $infoApp[0]['benefit_blue_member'];
    //Lay thong tin BLue member
    $arrPayMethod = $payment ->getPaymentMethod('');
    $arrItemPayMethod = $payment->getOutputHTMLInfoPaymethod($arrPayMethod,$app_id,$sms,$arrCurrentDiscount[$sms]);
    //var_dump($c_userInfo);
    $arrPayMethod = $payment ->getPaymentMethod('');
    $rateCard = 0;
    $rateSMS = 0;
    foreach($arrPayMethod as $key => $iTem)
    {
        if($iTem['pay_code'] == 'card')
        {
            $rateCard = $iTem['rate'];
        }
        if($iTem['pay_code'] == 'sms')
        {
            $rateSMS = $iTem['rate'];
        }

    }
    //Process Join HC
    $discountJoinHC = $payment->validateStatusJoinHC();
    if($discountJoinHC)
    {
        $arrInfoUserJoinHC = common_functions::getUserById(common_functions::deFormatUserID($_COOKIE['ctv_id']),$objConnection);

        $fullNameJoinHC = $arrInfoUserJoinHC['full_name'];
        $userIDJoinHC = $arrInfoUserJoinHC['user_id'];
        $urlUserJoinHC = common_functions::makeURL('profile.php','','?uid='.common_functions::hc_encode(common_functions::deFormatUserID($_COOKIE['ctv_id'])));
        //$titleInfoUserJoinHC = '<h6><i class="icon-gift icon-large"></i> Bạn được giảm thêm <strong>'.$discountJoinHC.'%</strong>  vì được giới thiệu từ CTV <a target="_blank" href="'.$urlUserJoinHC.'">'.$fullNameJoinHC.'</a>. Tìm hiểu <a target="_blank" href="'.common_functions::makeURL('help.php?txttut=12').'">cách trở thành CTV và kiếm tiền trên HelloChao</a>.</h6>';
        $titleInfoUserJoinHC = '<h6 style="font-size: 14px; color: #333;"><i class="icon-gift icon-large"></i> Bạn được giảm thêm <strong>'.$discountJoinHC.'%</strong>  vì được giới thiệu từ CTV <a target="_blank" href="'.$urlUserJoinHC.'">'.$fullNameJoinHC.'</a>. Tìm hiểu <a target="_blank" href="'.common_functions::makeURL('help.php?txttut=12').'">cách trở thành CTV và kiếm tiền trên HelloChao</a>.</h6>';
        $flagJoinHC = true;

    }
    else
    {
        $flagJoinHC = false;
    }
    //Process Join HC End
}
else
{
    $flagDisablePayment = true;
}
//For test
$arrEnableTest = array('h~55008','n~216504','b~51926','s~43459','t~7');
/*$c_userInfo = $_SESSION[consts::SES_C_USERINFO];
$userID = $c_userInfo['user_id'];
if(!in_array($userID,$arrListTest))
{
    $arrAppGift = array();
}*/
//End for test
?>
<div class="buying-wrap" data-title="<?php echo common_functions::noSign($GLOBALS['_mainFrame']->_apps[$app_id]['title']);?>">

    <div class="buying-content">
    <?php
        if(!$c_userInfo)
        {
            echo '<input type="hidden" name="hdflag" value="1" />';
        }
        if($app_id)
        {
            echo '<input type="hidden" name="appid" value="'.common_functions::hc_encode($app_id).'" />';
            echo '<input type="hidden" name="appname" value="'.$appName.'" />';
        }
    ?>
        <ul class="accordion-list">
            <li class="accordion-item step-buying-product">
                <span class="pop-handle"><!-- <i>1</i> --></span>
                <!-- <div class="accordion-item-inner"> -->
				<!-- thuyet commented above and added below (on 4-March-2015) -->
                <div class="accordion-item-inner" style="opacity:0">
				<!-- end thuyet add -->
                    <a class="btn-close popupDiv-close" href="#"><i class="icon-remove"></i></a>
                    
                    <div class="row titlegroup" style="margin: 10px 0 30px;">
                        <!-- <h3 class="left six">Đăng ký học gồm 2 bước đơn giản sau: </h3> -->
                        <div class="left four" style="float: none; margin: 0 auto;">
                            <ul class="registerSteps"> 
                                <li class="step1">
                                    <div>Đăng ký tài khoản học</div>
                                </li>
                                <li class="step2 active">
                                    <div>Thanh toán</div>
                                </li>                            
                            </ul>
                        </div>
                    </div>
                    <div class="pop-head">
                        <!--h5 class="subheader">Thanh toán</h5-->
                        <h3>1) Chọn gói thanh toán</h3>
                    </div>
                    <div class="pop-content">
                        <?php
                                if($c_userInfo['user_mark']>0)
                                {
                                    echo '<div class="wallet status-xu">
                                            <i class="icon-credit-card icon-large"></i> Bạn đang có <a href="#" onclick="return false" title="Xu là gì?" id="is-xu"><strong class="current-xu">'.$c_userInfo['user_mark'].'</strong><strong>  xu</strong> (~<span class="current-xu">'.$c_userInfo['user_mark'].'</span>.000 VNĐ) <i class="icon-info-sign"></i></a>
                                        </div>';
                                }
                                else
                                {
                                    echo '<div class="wallet status-xu" style="display:none;">
                                            <i class="icon-credit-card icon-large" ></i> Bạn đang có <a href="#" onclick="return false" title="Xu là gì?" id="is-xu"><strong class="current-xu">'.$c_userInfo['user_mark'].'</strong><strong>  xu</strong> (~<span class="current-xu">'.$c_userInfo['user_mark'].'</span>.000 VNĐ) <i class="icon-info-sign"></i></a>
                                        </div>';
                                }
                            ?>
                        <?php
                            if($tempDiscount)
                            {
                                //echo 'âfdfasdf';
                                if($typeMess == 1)
                                {
                                    echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên mới nên Hellochao khuyến mãi <strong>'.$discount.'%</strong></h6>';
                                }
                                elseif($typeMess == 2)
                                {
                                    echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên cũ nên HelloChao khuyến mãi <strong>'.$discount.'%</strong></h6>';
                                }
                                elseif($typeMess == 3)
                                {
                                    echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên cũ nên được HelloChao tặng kèm ứng dụng khi thanh toán</h6>';
                                }
                                elseif($typeMess == 4)
                                {
                                    echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên mới nên được HelloChao tặng kèm ứng dụng khi thanh toán</h6>';
                                }
                                else
                                {
                                    echo '<h6><i class="icon-gift icon-large"></i> HelloChao đang khuyến mãi <strong>'.$discount.'%</strong></h6>';
                                }
                            }
                            if($flagJoinHC)
                            {
                                echo $titleInfoUserJoinHC;
                            }
                        ?>
                        <div class="focused-zone">
                            <div class="row">
                                <div class="two columns"><i class="icon-large <?php echo $infoApp['0']['icon'];?>"></i></div>
                                <div class="ten columns">
                                    <p><?php echo $appName?></p>
                                    <form>
                                        <ul>
                                        <?php
                                            foreach($arrCurrentDiscount as $key => $value)
                                            {
                                                if($key!=$sms)
                                                {
                                                    $currentMoney = $arrCurrentDiscount[$key] * $rateCard;
                                                }
                                                else
                                                {
                                                    $currentMoney = $arrCurrentDiscount[$key] * $rateSMS;
                                                }
                                                if($key!=$best_buy)
                                                {
                                                    //echo ' khong co<br>';
                                                    $selectedOption = '';
                                                }
                                                else
                                                {
                                                    //echo 'co<br>';
                                                    $selectedOption = 'checked="true"';
                                                    if($arrAppGift[$key] && $hasDiscount)
                                                    {
                                                        //echo 'test';
                                                        //echo $app_id,'<Br>',$discount,'<br>',$arrAppGift[$key],'<br>';
                                                        $strListGift = $payment-> showHTMLInfoGiftByApp($app_id,$discount,$arrAppGift[$key],$group_id);
                                                        //echo $strListGift;
                                                    }
                                                }
                                                if($arrAppGift && $hasDiscount)
                                                {
                                                    if($arrAppGift[$key])
                                                    {
                                                        $strInfo = ' <span style="color:red;font-style: italic;">(Có tặng kèm)</span> ';
                                                        $strShowGift = 'onclick="buyingPopup.showGiftApp(\''.common_functions::hc_encode($app_id).'\',\''.common_functions::hc_encode($discount).'\',\''.common_functions::hc_encode($arrAppGift[$key]).'\');"';
                                                    }
                                                    else
                                                    {
                                                        $strInfo = '';
                                                        $strShowGift = 'onclick="buyingPopup.hideGiftApp();"';
                                                    }
                                                }
                                                $currentMoney = $payment->buildVNDMoneyPayment($currentMoney);
                                                if($discountJoinHC)
                                                {
                                                    $currentMoney = $currentMoney*(100-$discountJoinHC)/100;
                                                }
                                                $currentMoney = number_format($currentMoney,0,',','.');
                                                $noDiscountMoney = $arrNoDiscount[$key] * $rateCard;
                                                $noDiscountMoney = $payment->buildVNDMoneyPayment($noDiscountMoney);
                                                $noDiscountMoney = number_format($noDiscountMoney,0,',','.');
                                                //echo $arrCurrentDiscount[$key],'-',$arrNoDiscount[$key],"<br>";
                                                if($key!=$sms)
                                                {
                                                    if($currentMoney == $noDiscountMoney || !$noDiscountMoney)
                                                    {
                                                        echo
                                                            '<li>
                                                                <label>
                                                                    <input type="radio" name="buying-options" '.$selectedOption.' '.$strShowGift.' value="'.$key.'" id="buying-option'.$key.'" data-buying-option="services">
                                                                    '.$key.' ngày học ('.$currentMoney.' VNĐ)'.$strInfo.'
                                                                </label>
                                                            </li>';
                                                    }
                                                    else
                                                    {
                                                        echo
                                                            '<li>
                                                                <label>
                                                                    <input type="radio" name="buying-options" '.$selectedOption.' '.$strShowGift.' value="'.$key.'" id="buying-option'.$key.'" data-buying-option="services">
                                                                    '.$key.' ngày học (<span class="strikethrough">'.$noDiscountMoney.' VNĐ</span> chỉ còn '.$currentMoney.' VNĐ)'.$strInfo.'
                                                                </label>
                                                            </li>';
                                                    }
                                                }
                                                else
                                                {
                                                    echo
                                                        '<li>
                                                            <label>
                                                                <input type="radio" name="buying-options" id="buying-option2" '.$strShowGift.' data-buying-option="sms">
                                                                '.$sms.' ngày học (15.000 VNĐ / 1 tin nhắn)
                                                            </label>
                                                        </li>';
                                                }
                                            }
                                        ?>
                                        <?php
                                            //Lop hoc
                                            if($app_id == 8)
                                            {
                                        ?>
                                            <!--li>
                                                <label>
                                                    <input type="radio" name="buying-options" id="buying-option3" data-buying-option="hccard">
                                                    Thẻ học tiếng Anh HelloChao
                                                    <img class="hc-card" src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL;?>hellochao-card-blue.gif" height="22" width="34" alt=""/>
                                                    <img class="hc-card" src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL;?>hellochao-card-orange.gif" height="22" width="34" alt=""/>
                                                </label>
                                            </li-->
                                        <?php
                                            }
                                        ?>
                                            <li>
                                                <label>
                                                    <input type="radio" onclick="buyingPopup.hideGiftApp();" name="buying-options" id="buying-option3" data-buying-option="hccard">
                                                    Thẻ tặng hoặc mua trên deal (Nhommua, Hotdeal...)
                                                </label>
                                            </li>
                                        </ul>
                                    </form>
                                </div>
                            </div>
                    </div>
                    <div class="row" style="margin-bottom: 10px;">
                        <div class="twelve columns appBenefitsContent" id="show-info-gift">
                            <?php echo $strListGift; ?>    
                        </div>
                    </div>
                    <div  id="note-payment" ><strong style="color: red; text-decoration: underline;">Lưu ý</strong>: HelloChao có nhiều ứng dụng khác nhau. Bạn vui lòng xem kỹ thông tin để tránh thanh toán nhầm ứng dụng.
Ứng dụng bạn đang thanh toán là: <strong style="color: red;"><?php echo $appName?></strong></div>
                    </div>
                    <div class="pop-foot">
                        <a class="icon-arrow-right" href="#"></a>
                    </div>
                </div>
            </li>


            <li class="accordion-item step-payment-services">
                <span class="pop-handle"><!-- <i>2</i> --></span>
                <div class="accordion-item-inner">
                    <a class="btn-close popupDiv-close" href="#"><i class="icon-remove"></i></a>
                    <div id="step-case-services" class="step-case" data-buying-option="services" style="display: block;">
                        <div class="pop-head">
                            <div class="row titlegroup" style="margin: 10px 0 30px;">
                                <!-- <h3 class="left six">Đăng ký học gồm 2 bước đơn giản sau: </h3> -->
                                <div class="right five" style="float: none; margin: 0 auto;">
                                    <ul class="registerSteps"> 
                                        <li class="step1">
                                            <div>Đăng ký tài khoản học</div>
                                        </li>
                                        <li class="step2 active">
                                            <div>Thanh toán</div>
                                        </li>                            
                                    </ul>
                                </div>
                            </div>
                            <!-- <h3>2) Chọn hình thức thanh toán</h3> -->
							<!-- thuyet commented above (4/March/2015) -->
                        </div>
                        <div class="pop-content">
							<h2 style="font-weight: bold; margin-top: 20px; margin-bottom: 20px; text-align: center;"><?php echo $appName?></h2>
							<center style="margin-bottom: 20px">
								<?php
								if($tempDiscount || $flagJoinHC || count($arrAppGift) > 0){
								?>
								<div class="discount-wrap" style="font-size: 14px; border: 1px solid #e1e1e1; padding: 15px 20px; margin: 0 auto 20px; width: 100%; border-radius: 10px; background: rgb(255, 248, 218); text-align: left;">
								    
                                    <!--h3 style="margin-bottom:0px;">Khuyến mãi:</h3-->
                                    <?php
                                        //Lop hoc
                                        if( in_array($app_id,array(8,50)))
                                        {
                                    ?>
                                    <div style="color: red;text-align: center;padding: 5px;font-weight: bold;line-height: 20px;font-size:14px;">
                                        HOT: Tặng thêm 2 THÁNG  khi THANH TOÁN TRONG HÔM NAY.  Thanh toán ngay ! 
                                    </div>
                                    <?php 
                                        }
                                    ?>
									<?php
									if($tempDiscount)
									{
										//echo 'âfdfasdf';
										if($typeMess == 1)
										{
											echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên mới nên Hellochao khuyến mãi <strong>'.$discount.'%</strong></h6>';
										}
										elseif($typeMess == 2)
										{
											echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên cũ nên HelloChao khuyến mãi <strong>'.$discount.'%</strong></h6>';
										}
										elseif($typeMess == 3)
										{
											echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên cũ nên được HelloChao tặng kèm ứng dụng khi thanh toán</h6>';
										}
										elseif($typeMess == 4)
										{
											echo '<h6><i class="icon-gift icon-large"></i> Bạn là thành viên mới nên được HelloChao tặng kèm ứng dụng khi thanh toán</h6>';
										}
										else
										{
											echo '<h6><i class="icon-gift icon-large"></i> HelloChao đang khuyến mãi <strong>'.$discount.'%</strong></h6>';
										}
									}
									if($flagJoinHC)
									{
										echo $titleInfoUserJoinHC;
									}
									?>
									<div class="gift-apps-list" style="padding-top: 5px;<?php if( in_array($app_id,array(8,50))) echo 'display:none;';?>">
                                        
										<strong>Ứng dụng tặng kèm:</strong>
										<ul style="margin: 5px 0 0 3px">
										</ul>
									</div>
								</div>
								<?php
								}
								?>
								<?php
                                if($c_userInfo['user_mark']>0)
                                {
                                    echo '<div class="wallet status-xu">
                                            <i class="icon-credit-card icon-large"></i> Bạn đang có <a href="#" title="Xu là gì?" id="is-xu"><strong class="current-xu">'.$c_userInfo['user_mark'].'</strong><strong>  xu</strong> (~<span class="current-xu">'.$c_userInfo['user_mark'].'</span>.000 VNĐ) <i class="icon-info-sign"></i></a>, giờ cần chi trả thêm:
                                        </div>';
                                }
                                else
                                {
                                    echo '<div class="wallet status-xu" style="display:none;">
                                            <i class="icon-credit-card icon-large" ></i> Bạn đang có <a href="#" title="Xu là gì?" id="is-xu"><strong class="current-xu">'.$c_userInfo['user_mark'].'</strong><strong>  xu</strong> (~<span class="current-xu">'.$c_userInfo['user_mark'].'</span>.000 VNĐ) <i class="icon-info-sign"></i></a>, giờ cần chi trả thêm:
                                        </div>';
                                }
								?>
							</center>
                            <div class="focused-zone">
                                <dl class="tabs five-up payment-services mobile clearfix">
                                    <dd class="active">
                                        <a class="logo_cards changePaymethod"  href="#paymentServiceMobileCard">
                                            <span id="mobile-money">100.000 VNĐ</span>
                                            <img src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL?>logo-vina-mobile.png">
                                        </a>
                                    </dd>
                                    
                                    <dd>
                                        <a class="logo_ebanking changePaymethod" href="#paymentService6">
                                            <span id="ebanking-money">100.000 VNĐ</span>
                                            <img src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL?>logo-ebanking.png">
                                        </a>
                                    </dd>
                                    <dd>
                                        <a class="logo_nganluong changePaymethod" href="#paymentService2">
                                            <span id="nganluong-money">100.000 VNĐ</span>
                                            <img src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL?>logo-nganluong.png">
                                        </a>
                                    </dd>
                                    <dd>
                                        <a class="logo_baokim changePaymethod" href="#paymentService3">
                                            <span id="baokim-money">100.000 VNĐ</span>
                                            <img src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL?>logo-baokim.png">
                                        </a>
                                    </dd>
                                    <dd>
                                        <a class="logo_paypal changePaymethod" href="#paymentService4">
                                            <span id="paypal-money">15 USD</span>
                                            <img src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL?>logo-paypal.png">
                                        </a>
                                    </dd>
                                    <!--dd>
                                        <a class="logo_ebanking changePaymethod" href="#paymentService6">
                                            <span id="ebanking-money">100.000 VNĐ</span>
                                            <img src="<?php echo consts::FOLDER_IMAGE_PAYMENT_URL?>logo-vnbc.png">
                                        </a>
                                    </dd-->
                                </dl>

                            </div>

                            <ul class="tabs-content">
                                <li id="paymentServiceMobileCardTab" style="display: block; " class="active">
                                    <div id="cardMessReturn"></div>
                                    <div style="width: 100%; text-align:center; font-style: italic;">Điền đầy đủ thông tin vào các ô bên dưới, (<span style="color:#FF0000">*</span>) là bắt buộc nhập</div>
                                    <form action="" class="form-payment-cards">
                                        <div class="row">
                                            <div class="three columns">
                                                <label for="txtnumbercard" class="inline right">Mã số thẻ cào (<span style="color:#FF0000">*</span>)</label>
                                            </div>
                                            <div class="nine columns">
                                                <input type="text" name="txtnumbercard" id="txtnumbercard" placeholder="Không nhập khoảng trắng và dấu -" required>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="three columns">
                                                <label class="inline right">Loại thẻ (<span style="color:#FF0000">*</span>)</label>
                                            </div>
                                            <div class="nine columns radios-list">
                                                <!-- <label class="four columns" for="HCCard"><input type="radio" id="HCCard" name="rdonetwork" value="HCCard"> HelloChao</label> -->
                                                <label class="columns" for="VMS"><input type="radio" id="VMS" name="rdonetwork" value="VMS"> Mobile Fone</label>
                                                <label class="columns" for="VNP"><input type="radio" id="VNP" name="rdonetwork" value="VNP"> Vina Phone</label>
                                                <label class="columns end" for="xucard"><input type="radio" id="xucard" name="rdonetwork" value="xucard"> HelloChao Xu</label>
                                            </div>
                                        </div>
                                        <div class="row" id="serial" style="display: none;">
                                            <div class="three columns">
                                                <label for="txtnumberserial" class="inline right">Số seri (Serial) (<span style="color:#FF0000">*</span>)</label>
                                            </div>
                                            <div class="nine columns">
                                                <input type="text" name="txtnumberserial" id="txtnumberserial" maxlength="20">
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="three columns">
                                                <label for="txtphone" class="inline right">Số điện thoại (<span style="color:#FF0000">*</span>)</label>
                                            </div>
                                            <div class="nine columns">
                                                <input type="text" name="txtphone" id="txtphone" placeholder="VD: 0976569710 (dùng liên lạc khi gặp sự cố)">
                                            </div>
                                        </div>
                                        <!--div class="row">
                                            <div class="three columns">
                                                <label for="txtemail" class="inline right">Email</label>
                                            </div>
                                            <div class="nine columns">
                                                <input type="text" name="txtemail" id="txtemail">
                                            </div>
                                        </div-->
                                        <input type="hidden" name="txtemail" id="txtemail">
                                        <div class="row">
                                            <div class="three columns">
                                                <label for="txtCardCode" class="inline right">Mã bảo mật (<span style="color:#FF0000">*</span>)</label>
                                            </div>
                                            <div class="nine columns">
                                                <img class="capcha topup" id="imgSecCode" src="<?php echo common_functions::makeURL('capcha.php','','?type=3&random='.common_functions::getTimeStamp());?>">
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="nine columns push-three">
                                                <input type="text" class="input-text txtCode six" maxlength="5" id="txtCardCode" name="txtCardCode" placeholder="Nhập mã bảo mật ở trên">
                                            </div>
                                        </div>
                                    </form>

                                </li>
                                
                                <li id="paymentService2Tab">
                                
                                    <?php echo $arrItemPayMethod['nganluong'];?>
                                    <div class="alert-box secondary">Thanh toán sẽ hoàn thành trong khoảng từ 10 phút đến 24 giờ.<br>

                                        <a href="http://nganluong.vn" id="process-nganluong" class="button outsideServiceBtn">Thực hiện giao dịch trên NganLuong.vn</a>
                                    </div>
                                </li>
                                <li id="paymentService3Tab">
                                    <?php echo $arrItemPayMethod['baokim'];?>
                                    <div class="alert-box secondary">Thanh toán sẽ hoàn thành trong khoảng từ 10 phút đến 24 giờ.<br>

                                        <a href="http://baokim.vn" id="process-baokim" class="button outsideServiceBtn">Thực hiện giao dịch trên BaoKim.vn</a>
                                    </div>
                                </li>
                                <li id="paymentService4Tab">
                                    <?php echo $arrItemPayMethod['paypal'];?>
                                    <div class="alert-box secondary">Thanh toán sẽ hoàn thành trong khoảng từ 10 phút đến 24 giờ.<br>

                                        <a href="http://paypal.com" id="process-paypal" class="button outsideServiceBtn">Thực hiện giao dịch trên PayPal</a>
                                    </div>
                                </li>
                                <li id="paymentService6Tab">
                                <?php
                                    /*if(!in_array($c_userInfo['user_id'],$arrEnableTest))
                                    {
                                        echo'Hình thức thanh toán này đang trong giai đoạn nâng cấp';
                                    }
                                    else
                                    {*/
                                ?>
                                    <div class="row">
                                            <div class="three columns">
                                                <label for="txtphone" class="inline right">Số điện thoại (<span style="color:#FF0000">*</span>)</label>
                                            </div>
                                            <div class="nine columns">
                                                <input type="text" name="txtphone" id="txtphone" placeholder="VD: 0976569710 (dùng liên lạc khi gặp sự cố)">
                                            </div>
                                        </div>
                                    <?php echo $arrItemPayMethod['ebanking'];?>
                                    <div class="alert-box secondary">Thanh toán sẽ hoàn thành trong khoảng từ 10 phút đến 24 giờ.<br>

                                        <a href="http://vnbc.com.vn" id="process-ebanking" class="button outsideServiceBtn">Thực hiện giao dịch bằng Internet Banking</a>
                                    </div>
                                <?php
                                //}
                                ?>
                                </li>
                            </ul>

                        </div>
                        <div class="pop-foot">
                            <!-- <a class="icon-arrow-left" href="#" style="display:none"></a>
                            <a class="icon-arrow-right" href="#"></a> -->
							<!-- thuyet commented above and added below (on 4-March-2015) -->
							<a class="icon-arrow-left" href="#" style="display:none"></a>
                            <a class="icon-arrow-right" href="#"></a>
							<!-- end thuyet add -->
                        </div>
                    </div>

                    <div id="step-case-hccard" class="step-case" data-buying-option="hccard">
                        <div class="pop-head">
                            <div class="row titlegroup">
                                <h3 class="left six">Đăng ký học gồm 2 bước đơn giản sau: </h3>
                                <div class="right five">
                                    <ul class="registerSteps"> 
                                        <li class="step1">
                                            <div>Đăng ký tài khoản học</div>
                                        </li>
                                        <li class="step2 active">
                                            <div>Thanh toán</div>
                                        </li>                            
                                    </ul>
                                </div>
                            </div>
                            <h3>2) Nhập thông tin thẻ cào HelloChao</h3>
                        </div>
                        <div class="pop-content">
                            <div id="cardMessReturn"></div>
                            <div style="width: 100%; text-align:center; font-style: italic;">Điền đầy đủ thông tin vào các ô bên dưới, (<span style="color:#FF0000">*</span>) là bắt buộc nhập</div>
                            <form action="" class="form-payment-cards">
                                <div class="row">
                                    <div class="three columns">
                                        <label for="txtnumbercard" class="inline right">Mã số thẻ cào (<span style="color:#FF0000">*</span>)</label>
                                    </div>
                                    <div class="nine columns">
                                        <input type="text" name="txtnumbercard" maxlength="20" id="txtnumbercard" placeholder="Không nhập khoảng trắng và dấu -" required>
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="three columns">
                                        <label for="txtphone" class="inline right">Số điện thoại (<span style="color:#FF0000">*</span>)</label>
                                    </div>
                                    <div class="nine columns">
                                        <input type="text" name="txtphone" maxlength="12" id="txtphone" placeholder="VD: 0976569710 (dùng liên lạc khi gặp sự cố)">
                                    </div>
                                </div>
                                <!--div class="row">
                                    <div class="three columns">
                                        <label for="txtemail" class="inline right">Email</label>
                                    </div>
                                    <div class="nine columns">
                                        <input type="text" name="txtemail" id="txtemail" />
                                    </div>
                                </div-->
                                <input type="hidden" name="txtemail" id="txtemail" />
                                <div class="row">
                                    <div class="three columns">
                                        <label for="txtCardCode" class="inline right">Mã bảo mật (<span style="color:#FF0000">*</span>)</label>
                                    </div>
                                    <div class="nine columns">
                                        <img class="capcha topup" id="imgSecCode" src="<?php echo common_functions::makeURL('capcha.php','','?type=3&random='.common_functions::getTimeStamp());?>">
                                    </div>
                                </div>
                                <div class="row">
                                    <div class="nine columns push-three">
                                        <input type="text" maxlength="5" class="input-text txtCode six" id="txtCardCode" name="txtCardCode" placeholder="Nhập mã bảo mật ở trên">
                                    </div>
                                </div>
                            </form>

                        </div>
                        <div class="pop-foot">
                            <a class="icon-arrow-left" href="#"></a>
                            <a class="icon-arrow-right" href="#"></a>
                        </div>
                    </div>


                    <div id="step-case-sms" class="step-case" data-buying-option="sms">
                        <div class="pop-head">
                            <div class="row titlegroup">
                                <h3 class="left six">Đăng ký học gồm 2 bước đơn giản sau: </h3>
                                <div class="right five">
                                    <ul class="registerSteps"> 
                                        <li class="step1">
                                            <div>Đăng ký tài khoản học</div>
                                        </li>
                                        <li class="step2 active">
                                            <div>Thanh toán</div>
                                        </li>                            
                                    </ul>
                                </div>
                            </div>
                            <h3>2) Soạn tin nhắn theo cú pháp</h3>
                        </div>
                        <div class="pop-content">
                            <!--Để có <?php echo $sms;?> ngày học thử <strong><?php echo $appName; ?></strong> bạn hãy soạn tin nhắn theo cú pháp sau:-->
                            <?php echo $arrItemPayMethod['sms'];?>
                        </div>
                        <div class="pop-foot">
                            <a class="icon-arrow-left" href="#"></a>
                            <?php
                                if($c_userInfo['user_mark']<$arrCurrentDiscount[$sms])
                                {
                                    echo '<a href="#" class="icon-ok refresh-after-payment"></a>';
                                }
                            ?>

                        </div>
                    </div>

                </div>
            </li>

            <li class="accordion-item step-payment-services-confirm">
                <span class="pop-handle"><!-- <i>3</i> --></span>
                <div class="accordion-item-inner">
                    <a class="btn-close popupDiv-close" href="#"><i class="icon-remove"></i></a>
                    <div class="pop-head">
                        <div class="row titlegroup" style="margin: 10px 0 30px;">
                            <!-- <h3 class="left six">Đăng ký học gồm 2 bước đơn giản sau: </h3> -->
                            <div class="right five" style="float: none; margin: 0 auto;">
                                <ul class="registerSteps"> 
                                    <li class="step1">
                                        <div>Đăng ký tài khoản học</div>
                                    </li>
                                    <li class="step2 active">
                                        <div>Thanh toán</div>
                                    </li>                            
                                </ul>
                            </div>
                        </div>
                        <!-- <h3>3) Xác nhận giao dịch</h3> -->
                    </div>
                    <div class="pop-content">
						<h3 style="text-align:center; margin: 10px 0 30px;">Xác nhận giao dịch</h3>
                        <div class="focused-zone">
                            <div class="result result-confirm">
                                <p id="title-confirm">Bạn có chắc muốn thực hiện giao dịch?</p>
                                <a href="#" class="button button-yes">Yes</a>
                                <a href="#" class="secondary button popupDiv-close button-no">No</a>
                            </div>
                            <div class="result result-msg">
                                <p class="msg">Giao dịch thành công !</p>
                                <a href="#" class="button refresh-after-payment">Đóng lại</a>
                            </div>
                        </div>
                    </div>
                    <div class="pop-foot">
                        <a class="icon-arrow-left" href="#"></a>
                    </div>

                </div>
            </li>
        </ul>
        <!-- / .accordion-list -->
    </div>
    <!-- / .buying-content -->

</div>
<!-- / .buying-wrap -->

<script>(function() {
  var _fbq = window._fbq || (window._fbq = []);
  if (!_fbq.loaded) {
    var fbds = document.createElement('script');
    fbds.async = true;
    fbds.src = '//connect.facebook.net/en_US/fbds.js';
    var s = document.getElementsByTagName('script')[0];
    s.parentNode.insertBefore(fbds, s);
    _fbq.loaded = true;
  }
  _fbq.push(['addPixelId', '363703490479173']);
})();
window._fbq = window._fbq || [];
window._fbq.push(['track', 'openPopupPayment', {}]);
</script>
<noscript><img height="1" width="1" alt="" style="display:none" src="https://www.facebook.com/tr?id=363703490479173&amp;ev=openPopupPayment" /></noscript>