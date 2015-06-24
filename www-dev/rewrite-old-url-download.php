<?php
$domain = 'http://www.tenlua.vn/download';
$url = $domain.'/'.$_REQUEST['node'].'/'.$_REQUEST['slug'];
header('Location: '.$url);
/*$ip = getenv('HTTP_CLIENT_IP')?:
getenv('HTTP_X_FORWARDED_FOR')?:
getenv('HTTP_X_FORWARDED')?:
getenv('HTTP_FORWARDED_FOR')?:
getenv('HTTP_FORWARDED')?:
getenv('REMOTE_ADDR');
if($ip == '115.76.11.241')
{
   $url = $domain.'/'.$_REQUEST['node'].'/'.$_REQUEST['slug'];
   header('Location: '.$url);
}*/
?>