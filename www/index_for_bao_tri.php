<?php
$ip = getenv('HTTP_CLIENT_IP')?:
getenv('HTTP_X_FORWARDED_FOR')?:
getenv('HTTP_X_FORWARDED')?:
getenv('HTTP_FORWARDED_FOR')?:
getenv('HTTP_FORWARDED')?:
getenv('REMOTE_ADDR');

//echo $ip;
if($ip!='203.162.100.19' && $ip!='113.187.25.12' && $ip!='123.23.52.54' && $ip!='113.162.173.220' && $ip!='203.162.96.67' && $ip!='1.54.75.105' && $ip!='116.100.53.83' && $ip!='14.161.12.219' && $ip!='14.161.12.217' && $ip!='115.78.133.253')
{
    header('Location: baotri.php', true, 303);
}
else
{
    header('Location: index.html', true, 303);
}

?>