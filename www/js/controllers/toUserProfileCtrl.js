app.controller('toUserProfileCtrl', function($scope,$state,$stateParams){
	 var userdata=$stateParams.toUserData;
	 $scope.toUserProfileName=userdata.name;
	 $scope.toUserProfileImage=userdata.avatar;
	 $scope.toUserProgileAbout=userdata.about;
	 $scope.toUserProfileworkAt=userdata.workAt;

})
