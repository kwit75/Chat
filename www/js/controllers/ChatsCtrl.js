app.controller('ChatsCtrl',function($scope,socket,$timeout,$ionicModal,$cordovaContacts,$ionicListDelegate,$ionicScrollDelegate,$state,$rootScope,$ionicLoading,$cordovaLocalNotification,$ionicHistory,MessagesService,UserService,socket,$cordovaSQLite,CouchDBServices,$timeout) {



$ionicHistory.clearHistory();


$scope.scrollTop = function() {
    $ionicScrollDelegate.scrollTop();
  };
  	$scope.perviouschat=[];

	$scope.$on("$ionicView.enter", function(event, data){
	   // handle event
	   if(window.localStorage['isTimeout']==1)
		{
			socket.emit('new user', UserService.getLoginUser(), function(data){
                 if(data){
                  } else{
                  alert('That username is already taken!  Try again.');
                 }
              });
			window.localStorage['isTimeout']=0;
			$timeout(function(){
				chatrefresh();
			},0)
		}
		else
		{
			chatrefresh();

		}
	});

	var cleanUp = $scope.$on('refreshChats',function(event,args){

		$scope.loadChats(args)

	})

	$scope.$on('$destroy', function() {
          cleanUp();
      });

    var count=0;
	var isFind=false;
	socket.emit('request load old msgs',UserService.getLoginUser(),function(args){
		for(var i=0;i<args.length;i++)
		{

			 (function(i) {
			    setTimeout(function() {
			    	alert('msg'+args[i].msg)
			    	alert('imgFlag'+args[i].imgFlag)
			     MessagesService.insertMsg({
		                      senderId:args[i].nick,
		                      receiverId:UserService.getLoginUser(),
		                      message:args[i].msg,
		                      loginUserId:UserService.getLoginUser(),
		                      unReadflag:'1',
		                      imgFlag:args[i].imgFlag
		                }).then(function(result){
		                	chatrefresh();
		                });
					    }, i * 1000);
			  })(i);

		}

	})

	$scope.deleteChat=function(chatData)
	{
		var deleteQuery="delete from tbl_message where(senderId='"+chatData.phone+"' or receiverId='"+chatData.phone+"') ";
		 $cordovaSQLite.execute(sqlitedb, deleteQuery, []).then(function(res) {

		 	chatrefresh();
		 })
		 $ionicListDelegate.closeOptionButtons();

	}

	$scope.loadChats = function(args){

		var dataArray={};
		var isFind=false;
		if(args.imgFlag==1)
		{
			$scope._msg='Image'
		}
		else if(args.imgFlag==2)
		{
			$scope._msg='Location'
		}
		else
		{
			$scope._msg=args.message;
		}
		MessagesService.insertMsg({
                      senderId:args.nick,
                      receiverId:UserService.getLoginUser(),
                      message:args.message,
                      loginUserId:UserService.getLoginUser(),
                      unReadflag:'1',
                      imgFlag:args.imgFlag
                });
       var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+args.nick+"' and readUnreadFlg='1'";
        $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
			CouchDBServices.getUserDetails(args.nick).then(function(doc){
	           var userInfo={
	                id:args.nick,
	                title:doc.name,
	                text:$scope._msg,
	                badge:res.rows.item(0).buge,
	                data:doc,
	            }
	              $cordovaLocalNotification.schedule(userInfo).then(function (result) {
	              })
       		})
       	})



		for(var i=0;i<$scope.perviouschat.length;i++)
		{

			if($scope.perviouschat[i].phone===args.nick){
				$scope.perviouschat[i].message=args.message;
				$scope.perviouschat[i].imgFlag=args.imgFlag ;
				$scope.perviouschat[i].readUnreadFlg=$scope.perviouschat[i].readUnreadFlg+1;
			   	$scope.perviouschat[i].time=moment(new Date()).format("hh:mm:ss:A")
			   	isFind=true;
			    break;
			}

		}
		if(!isFind)
		{

			CouchDBServices.getUserDetails(args.nick).then(function(doc){
				var dataArray={};
				dataArray.name=doc.name;
			    dataArray.message=args.message;
			    dataArray.imgFlag=args.imgFlag;
			    dataArray.time=moment(new Date()).format("hh:mm:ss:A");
			    dataArray.avatar=doc.avatar;
			    dataArray.email=doc.email;
			    dataArray.phone=doc.phone;
			    dataArray.status=doc.status;
			    dataArray.workAt=doc.workAt;
			    dataArray.about=doc.about;
				dataArray.isUser=1;
				dataArray.readUnreadFlg=1;
			    $scope.perviouschat.push(dataArray);
			})
		}
	$scope.scrollTop()
	}

	$scope.getMessage=function(data)
	{
		if(data.imgFlag==1)
		{
			return  "<i class='ion-ios-camera'></i> Image";

		}
		else if(data.imgFlag==2)
		{
			return  "<i class='ion-ios-location'></i> Location";

		}
		else if(data.imgFlag==3)
		{
			return  "<i class='ion-android-contact'></i> Contact";
		}
		else
		{
			return data.message;
		}


	}

	function chatrefresh()
	{
		$scope.perviouschats=[];
	    var username=UserService.getUser().name;
		var userid=UserService.getLoginUser();
		var useravatar=UserService.getUser().avatar;
		var selectchat="SELECT *, SUM(readUnreadFlg) as unReadCount FROM tbl_message where(senderId='"+userid+"' or receiverId='"+userid+"') group by chatId ORDER BY dateCreated DESC";
		//var selectchat="SELECT m1.* FROM tbl_message AS m1 LEFT JOIN tbl_message AS m2 ON (m1.chatId = m2.chatId AND m1.dateCreated < m2.dateCreated) WHERE m2.dateCreated IS NULL order by dateCreated DESC";
		 $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(data) {
			if(data.rows.length >0)
			{
				for(i=0; i<data.rows.length; i++)
 				{
 					var senderDetails = JSON.parse(data.rows.item(i).senderDetails)
 					var receiverDetails = JSON.parse(data.rows.item(i).receiverDetails)
   					var dataArray={};
  			        //var countUchat="select * from tbl_message where chatId='"+data.rows.item(i).chatId+"' and readUnreadFlg='1'" ;

					// $cordovaSQLite.execute(sqlitedb, countUchat, []).then(function(res) {
					// 	dataArray.unreadmessage=res.rows.length
					// })
				    if(data.rows.item(i).senderId!=data.rows.item(i).loginUserId)
					{
						 dataArray.name=senderDetails.name;
						 dataArray.message=data.rows.item(i).message;
						 dataArray.imgFlag=data.rows.item(i).imgFlag;
						 dataArray.time=moment(data.rows.item(i).dateCreated).format("hh:mm:ss:A");
						 dataArray.avatar=senderDetails.avatar;
						 dataArray.email=senderDetails.email;
						 dataArray.phone=senderDetails.phone;
						 dataArray.status=senderDetails.status;
						 dataArray.workAt=senderDetails.workAt;
						 dataArray.about=senderDetails.about;
 						 dataArray.isUser=senderDetails.isUser;
 						 dataArray.readUnreadFlg=data.rows.item(i).unReadCount;
						 $scope.perviouschats.push(dataArray);
					}
					else
					{
						 dataArray.name=receiverDetails.name;
						 dataArray.message=data.rows.item(i).message;
						 dataArray.imgFlag=data.rows.item(i).imgFlag;
						 dataArray.time=moment(data.rows.item(i).dateCreated).format("hh:mm:ss:A");
						 dataArray.avatar=receiverDetails.avatar;
						 dataArray.email=receiverDetails.email;
						 dataArray.phone=receiverDetails.phone;
						 dataArray.status=receiverDetails.status;
						 dataArray.workAt=receiverDetails.workAt;
						 dataArray.about=receiverDetails.about;
						 dataArray.isUser=receiverDetails.isUser;
 						 dataArray.readUnreadFlg=data.rows.item(i).unReadCount;

						 $scope.perviouschats.push(dataArray);
					}
				}
				setTimeout(function() {
		          $scope.$apply(function() {
		           $scope.perviouschat=$scope.perviouschats
		          });
		        });
		    }
		    else
		    {
		    	setTimeout(function() {
		          $scope.$apply(function() {
		           $scope.perviouschat=$scope.perviouschats
		          });
		        });
		    }
		}, function (err) {
		console.error(JSON.stringify(err))
		});
	}
	$scope.chating = function(toUserData){

		if(toUserData.isUser==1)
		{
	      UserService.setToUserData(toUserData);
			$state.go('chating')
			for(var i=0;i<$scope.perviouschat.length;i++)
			{
				if($scope.perviouschat[i].phone===toUserData.phone){
					$scope.perviouschat[i].readUnreadFlg=0;
				    break;
				}
			}
		}
	  }
})
