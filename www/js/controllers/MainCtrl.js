
app.controller('MainCtrl', function($scope, $state,socket,$timeout,$cordovaToast,$cordovaSms,$ionicPopover,$ionicHistory,$rootScope,CouchDBServices,ContactsServices,$ionicLoading,MessagesService,UserService) {
            // Called to navigate to the main app
var refreshContact = $rootScope.$on('refreshContact',function(){
  alert('refreshContact')
    var countrycode=window.localStorage['countryCode'];
  $rootScope.fetchContacts(countrycode);
})
$scope.$on('$destroy', function() {
      refreshContact();
});


  $scope.sendSms=function(sendto){

    var options = {
      replaceLineBreaks: false, // true to replace \n by a new line, false by default
      android: {
        intent: 'INTENT'  // send SMS with the default SMS app
        //intent: ''        // send SMS without open any other app
      }
    };
    
    var message = 'Invitation message'
    $cordovaSms
      .send(sendto, message, options)
      .then(function() {
        // Success! SMS was sent
        console.log('Success');
      }, function(error) {
        // An error occurred
        console.log(error);
      });//then
  }

$scope.updateUserInfo = function(simContacts,isToster){
        // check phone number exits or not
        CouchDBServices.getDocuments(simContacts).then(function(appUsers){
          // console.log("fetched app users"+JSON.stringify(appUsers));
          if(appUsers.rows.length!=0)
          {
              angular.forEach(appUsers.rows,function(user){

                  if('doc' in user){

                      if(user.doc!=null){

                          CouchDBServices.updateContactPouchDB(user.doc.phone,user.doc).then(function(success){

                              console.log("updated remote contacts, saving to local storage"+JSON.stringify(success));
                                  // $state.go('tab.chats');


                           },function(err){
                              console.log("error when updating document");
                              q.reject(err);
                          });

                      }
                    }

              })

          }


          if($ionicHistory.currentStateName()=='contact-number')
          {

              $ionicLoading.hide();
              $state.go('tab.chats');
          }
          else
          {
            $ionicLoading.hide();
            $timeout(function(){
            $rootScope.$broadcast('updateContact')

            },1500)
          }

          if(isToster)
          {
              $cordovaToast.showShortCenter('Your contact update successfully...').then(function(success) {
                // success
              }, function (error) {
                // error
              });
          }

        })
}

$rootScope.fetchContacts = function(_countryCode,isToster){
       $rootScope.isLoadUpdateSpinner=true;
       if($ionicHistory.currentStateName()=='tab.contact')
       {
            $scope.popover.hide();
       }
      ContactsServices.getSimJsonContacts(_countryCode).then(function(responce){

          $scope.simContacts=responce.mobiles;
          $scope.simJsonContacts=responce.phones;
          // alert("Before Insert >>>"+$scope.simJsonContacts);
          // insert data into pouchDb
          CouchDBServices.insertContactPouchDB($scope.simJsonContacts).then(function(res){
          // alert("After Insert >>>"+res);
             $scope.updateUserInfo($scope.simContacts,isToster);
          })
      })

};


})
