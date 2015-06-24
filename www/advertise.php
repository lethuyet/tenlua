<!DOCTYPE html>

<html>
<head>
    <title>tenlua.vn - advertise</title>
    <style>
    	body{
    		text-align: center;
    		padding: 0;
    		margin: 0;
    	}
    	div{
    		margin: 0 auto;
    	}
    </style>
	<script type="text/javascript">
	<!--
		document=parent.document;
	//-->
	</script>

</head>
<body>
<?php
if(!$_REQUEST['screen'])
{
    $_REQUEST['screen'] = 'desktop';
}
if(!$_REQUEST['size'])
{
    $_REQUEST['size'] = 'normal';
}
//var_dump($_REQUEST);
header('Content-Type: text/html; charset=utf-8');
include('nusoap.php');
$client = new nusoap_client('http://api2.tenlua.vn/ws-advertise.php?wsdl',false);
$namespace= "http://api2.tenlua.vn/";
$client->soap_defencoding = 'UTF-8';
/*CallHCRequestKey*/
$soapaction_request = "http://api2.tenlua.vn/getAds";
$params_request = array('page'=>$_REQUEST['page'],'pos'=>$_REQUEST['pos'],'screen'=>$_REQUEST['screen'],'size'=>$_REQUEST['size']);
$content = $client->call('getAds', $params_request,$namespace,$soapaction_request);
//echo $content;return;
if(!$content)
{
    return;
}
$content = json_decode($content);
if($content)
{
    foreach($content as $k=>$v)
    {
        echo '<div>'.$v->content.'</div>';
    }
}
?>
</body>
</html>