app.controller('UserProfileCtrl', function($scope,$state,$stateParams,UserService,$ionicHistory,$ionicActionSheet,$cordovaCamera,CouchDBServices,$ionicLoading){

	$scope.goBack = function(){
		$ionicHistory.goBack();
	}

	$scope.update_profile={
       _id:UserService.getLoginUser(),
       name:UserService.getUser().name,
       about:UserService.getUser().about,
       email:UserService.getUser().email,
       fbid:UserService.getUser().fbid,
       phone:UserService.getLoginUser(),
       country:UserService.getUser().country,
       gender:UserService.getUser().gender,
       isActive:UserService.getUser().isActive,
       avatar:UserService.getUser().avatar,
       workAt:UserService.getUser().workAt,
       status:UserService.getUser().status
    };

    $scope.editprofile= function(){
    	
		 var editProfile = $ionicActionSheet.show({
            titleText: '<font color="black">Choose Picture Source</font>',
            buttons: [
                {
                    text: '<button class="button button-positive"><i class="icon ion-camera">                               </i>Camera</button>',
                    type: 'button'
                },
                {
                    text: '<i class="icon ion-images"></i>Photo Gallery',
                    type: 'button button-positive'
                }
            ],
            cancelText: 'Cancel',
            buttonClicked: function (index) {
                if (index === 0) {
	                 var options = {
	                    quality: 75,
	                    destinationType: Camera.DestinationType.DATA_URL,
	                    sourceType: Camera.PictureSourceType.CAMERA,
	                    allowEdit: true,
	                    encodingType: Camera.EncodingType.JPEG,
	                    targetWidth: 300,
	                    targetHeight: 300,
	                    popoverOptions: CameraPopoverOptions,
	                    saveToPhotoAlbum: false
	                } 
	                 editProfile();         

                }  if (index === 1) {
                  //alert("inside gallary");
                   var options = {
                   quality: 75,
                   destinationType: Camera.DestinationType.DATA_URL,
                   sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
                   allowEdit: true,
                   encodingType: Camera.EncodingType.JPEG,
                   targetWidth: 300,
                   targetHeight: 300,
                   popoverOptions: CameraPopoverOptions,
                   saveToPhotoAlbum: false
                   };
                    editProfile();    
                             
                }
                 $cordovaCamera.getPicture(options).then(function (imageData) {
                 	    $scope.update_profile.avatar = "data:image/jpeg;base64," +imageData;

                       $scope.sendImage($scope.update_profile.avatar)
                       }, function (err) {
                       // An error occured. Show a message to the user
                 });
			}
         });

    }

    $scope.sendImage= function(image) {
	    var profileData={
               _id:UserService.getLoginUser(),
               name:UserService.getUser().name,
               about:UserService.getUser().about,
               email:UserService.getUser().email,
               fbid:UserService.getUser().fbid,
               phone:UserService.getLoginUser(),
               country:UserService.getUser().country,
               gender:UserService.getUser().gender,
               isActive:UserService.getUser().isActive,
               avatar:image,
               workAt:UserService.getUser().workAt,
               status:UserService.getUser().status
        };
                     
            CouchDBServices.updatuserprofile(profileData).then(function(res){
                    UserService.setUser({
                     name:res.name,
                     email:res.email,
                     fbid:res.fbid,
                     phone:res.phone,
                     country:res.country,
                     gender:res.gender,
                     isActive:res.isActive,
                     avatar:res.avatar,
                     //avatar:"http://192.168.1.9:1337/user/upload/"+res.fileName+"/",
                     status:res.status,
                     about:res.about,
                     workAt:res.workAt,
                     id:res._id,
                    })

                    $scope.$apply();
                     
                 })  
    }

    $scope.saveProfile = function(){
           $ionicLoading.show({
           	template:"Profile Uploading...."
           }) 
	      CouchDBServices.updatuserprofile($scope.update_profile).then(function(res){
	       		$ionicLoading.hide();	
	            UserService.setUser({
	             name:res.name,
	             email:res.email,
	             fbid:res.fbid,
	             phone:res.phone,
	             country:res.country,
	             gender:res.gender,
	             isActive:res.isActive,           
	             avatar:UserService.getUser().avatar,
	             status:res.status,
	             about:res.about,
	             workAt:res.workAt,
	             id:res._id,
	        })
     })
	}      

})
