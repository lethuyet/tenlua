<?php
$nid =  $_GET['nodeId'];
 
if($nid){
	$nodeJson = file_get_contents("http://api2.tenlua.vn/filemanager/index/getnodesv?nid={$nid}");
	if($nodeJson)
	   {
	        $nodeInfo = json_decode($nodeJson,1);
	        if($nodeInfo['type']){
	        	//folder


	        }else{
	        	?>	

	        	<!DOCTYPE html>
				<html>
				  <head>
				    <meta charset="utf-8">
				    <meta http-equiv="X-UA-Compatible" content="IE=edge">
				    <meta name="viewport" content="width=device-width, initial-scale=1">
				    <title><?php echo $nodeInfo['name']?></title>
				    <meta content="<?php echo $nodeInfo['name']?>" name="keywords" >
				    <meta property="og:description" content="tenlua.vn - <?php echo $nodeInfo['name']?>" />			    				    
				    <meta property="og:site_name" content="tenlua.vn" />
				    <?php if($nodeInfo['image']): ?>
				    <meta property="og:image" content="<?php echo $nodeInfo['image']?>"/>	
				    <?php endif; ?>	
				    <?php if($nodeInfo['video']): ?>
				    	<meta property="og:type" content="video" />
        				<meta property="og:video" content="<?php echo $nodeInfo['video']?>" />
				    <?php endif; ?> 	
				  </head>
				  <body>				  
				  </body>
				</html>

	        	<?php

	        }	        
	    }
}