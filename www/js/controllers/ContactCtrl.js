    	
app.controller('ContactCtrl',function($scope,$state,$rootScope,$ionicLoading,$rootScope,UserService,CouchDBServices,ContactsServices,MessagesService,$ionicHistory,socket,$timeout){
    $ionicHistory.clearHistory();
   
    var userInfo = UserService.getUser();

    $scope.verifyContact = function(contactNumber){
      $ionicLoading.show({
        template:'Loading...'
      })
      var _countryCode;
    	if(isNaN(UserService.countrycode))
    	{
    		_countryCode='+91'
    	}
    	else
    	{
    		_countryCode=UserService.countrycode;
    	}
      window.localStorage['countryCode']=_countryCode;
      var country;
      if(UserService.country!='undefined')
      {
          country=UserService.country;
      }
      else
      {
          country='India';
      }
    	var userDetails={
            _id:contactNumber,
            name:userInfo.name,
            phone:contactNumber,
            email:userInfo.email,
            fbId:userInfo.fbid,
            country:country,
            avatar:userInfo.avatar,
            isActive:"1",
            gender:userInfo.gender,
            status:userInfo.status,   
        }

	 	 $rootScope.fetchContacts(_countryCode,false)
     // $rootScope.$broadcast('getContact',{countrycode:_countryCode});
     
    	CouchDBServices.registeruser(userDetails).then(function(responce){
      //  UserService.loginUserId = responce
        //UserService.setLoginUser(responce);
        
        if(responce!=false)
        {
          
          UserService.setUser(responce)
        UserService.setLoginUser(responce._id);
        }
        else
        {
        
        UserService.setLoginUser(contactNumber);
        }
       
        
    	})    

        //Socket Integration
    
         socket.emit('new user',contactNumber,function(data){
               if(data){
               } else{
               alert('That username is already taken!  Try again.');
               }
         })
          }               
})

      
               