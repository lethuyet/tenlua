<?php

$id = $_GET['id'];
if($id != session_id())
{
  session_destroy();
  session_id($id);
  session_start();
}


?>

<script>
	var rootScope = window.opener.$(window.opener.document).scope();
	var authSrv = rootScope.authSrv;
	var $loginModal = window.opener.$('.login-modal');
	var plan = $loginModal.length ? $loginModal.scope().user.plan : '';

<?php

if($_SESSION['oauth_rs'])
{
   $usid =  $_SESSION['oauth_rs']['u_sid'];
   $attr = $_SESSION['oauth_rs']['u_attr'];
  ?>
  // window.opener.u_sid = '<?php echo $usid; ?>';
  // window.opener.localStorage.sid = '<?php echo $usid; ?>';
  // if(window.opener.lastpage)
  // {
  //   window.opener.location.href= window.opener.mainpath + window.opener.lastpage;
  //   window.opener.location.reload();
  // }
  // else
  //   window.opener.location.href= window.opener.mainpath;


	// Neu login thanh cong:
	authSrv.saveSessionAndConfirmLogin(['<?php echo $usid; ?>'], plan);

  <?php
}else
{
   ?>
    // window.opener.alert(window.opener.l[919]);
 	authSrv.loginError('', 500);

<?php
}
?>

rootScope.$apply();
window.close();

</script>