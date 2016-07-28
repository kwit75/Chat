app.controller('ChatingCtrl', function($scope,$ionicModal, $stateParams,$ionicLoading,
                                       $cordovaGeolocation,$cordovaLocalNotification,$cordovaCapture, VideoService,$cordovaCamera, socket,$sanitize,$ionicHistory, $state, $rootScope, $ionicPopup, $ionicScrollDelegate, $timeout, $interval, $ionicPopover,UserService,$ionicViewService,$ionicModal,$ionicPopover,MessagesService,$cordovaSQLite,CouchDBServices) {
// alert("stateParams "+ JSON.stringify($scope.toUser))
$scope._toUserDetail= UserService.getToUserData();
  $scope.$on('$ionicView.enter', function() {
$scope._toUserDetail= UserService.getToUserData();
     sqlitedb = $cordovaSQLite.openDB("my.db");

    //update readFlage
    var updatereadflag="UPDATE tbl_message SET readUnreadFlg='0' where(senderId='"+userid+"' and receiverId='"+tousrid+"') or (senderId='"+tousrid+"' and receiverId='"+userid+"')";
    $cordovaSQLite.execute(sqlitedb, updatereadflag, []).then(function(res){
    })

  })
 $cordovaLocalNotification.clear($scope._toUserDetail.phone).then(function (result) {

 })


$ionicModal.fromTemplateUrl('templates/sendContact.html', {
    scope: $scope,
    animation: 'fade-in'
  }).then(function(modal) {
    $scope.modal = modal;
  });
  $scope.openModal = function() {

  };
  $scope.closeModal = function() {
    $scope.modal.hide();
  };
  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });

 $scope.openMap=function(lat,long){
  window.open("geo:"+lat+","+long+"?q="+lat+","+long);
 }

 $scope.showprofile= function(){
  $state.go('touserprofile',{toUserData:$scope._toUserDetail})
 }

$ionicPopover.fromTemplateUrl('templates/popover.html', {
                     scope: $scope,
                     }).then(function(popover) {
                             $scope.popover = popover;
                             });
  $scope.camera = function(){
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
    };

  $scope.popover.hide()
  $cordovaCamera.getPicture(options).then(function (imageData) {
             $scope.imgURI = "data:image/jpeg;base64," +imageData;
             sendImage($scope.imgURI);
             }, function (err) {
             // An error occured. Show a message to the user
             });
  }

  $scope.gallery= function(){

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
  $scope.popover.hide()

  $cordovaCamera.getPicture(options).then(function (imageData) {

         $scope.imgURI = "data:image/jpeg;base64," +imageData;
         sendImage($scope.imgURI);
         }, function (err) {
         // An error occured. Show a message to the user
         });
  }




  $scope.captureVideo = function() {
    $cordovaCapture.captureVideo().then(function(videoData) {
      VideoService.saveVideo(videoData).success(function(data) {

        var audioFile = videoData[0],
          fileReader = new FileReader(),
          file;
        fileReader.onload = function (readerEvt) {


          var base64 = readerEvt.target.result;
          console.log(base64);

          $scope.video1 = "data:video/mp4;base64," +base64;
          sendImage($scope.video1);
        };
        //fileReader.reasAsDataURL(audioFile); //This will result in your problem.
        file = new window.File(audioFile.name, audioFile.localURL,
          audioFile.type, audioFile.lastModifiedDate, audioFile.size);
        fileReader.readAsDataURL(file); //This will result in the solution.


        // here we will send video.

        $scope.$apply();
      }).error(function(data) {
        console.log('ERROR: ' + data);
      });
    });
  };


  $scope.urlForClipThumb = function(clipUrl) {

    if (clipUrl!='data:video/mp4;base64,[object Object]') {

      return PKVideoThumbnail.createThumbnail(clipUrl,
        "IGNORE",
        {
          mode: "base64",
          quality: .8,
          position: 5.0, // iOS only
          resize: {height: 200, width: 200}
        });
    } else return 'none';
    /*
    var name = clipUrl.substr(clipUrl.lastIndexOf('/') + 1);
    var trueOrigin = cordova.file.dataDirectory + name;
    var sliced = trueOrigin.slice(0, -4);
    return sliced + '.png';
    */
  }

  $scope.showClip = function(clip) {
    console.log('show clip: ' + clip);
  }

  $scope.myGoBack = function()
  {
    $ionicHistory.goBack();
  }

  var usernm=UserService.getUser().name;
  var userid=UserService.getLoginUser();
  var useravatar=UserService.getUser().avatar;

  var tousrnm = $scope._toUserDetail.name;
  var tousrid= $scope._toUserDetail.phone;
  var tousravatar= $scope._toUserDetail.avatar;

  $scope.toUser = {
  _id: tousrid,
  pic: tousravatar,
  username: tousrnm
  }
  // this could be on $rootScope rather than in $stateParams
  $scope.user = {
  _id: userid,
  pic: useravatar,
  username: usernm
  };

$scope.shareContact = function(){

  $scope.popover.hide()
  navigator.contacts.pickContact(function(contact){
        $scope.modal.show();
        $scope.contactData=JSON.stringify(contact);
        $scope.displayName=contact.displayName;
        if(contact.phoneNumbers!=null)
        {
           $scope.contactNumber=contact.phoneNumbers[0].value;
        }
        else if(contact.emails!=null)
        {
            $scope.contactNumber=contact.emails[0].value;
        }
        else
        {
          $scope.contactNumber=null;
        }

          console.log('The following contact has been selected:' + JSON.stringify(contact));


    },function(err){
        console.log('Error: ' + err);
    });
}

$scope.isSendContact=function(){
  $scope.modal.hide();
  var toId=$scope.toUser._id;
  var text=$scope.contactData;
  var username=$scope.user.username;
  var userId=$scope.user._id;
  var simg= $scope.user.pic;
  var rimg= $scope.toUser.pic;
  var whisperedMsg = "/w "+ $scope.toUser._id+" " ;
  socket.emit('send message',{ message:whisperedMsg + text,isType:3})
  socket.emit('stop typing',{ oppUser:$scope.toUser._id});
  customMsg(userId,toId,text,userId,'0','3');

}

$scope.saveContact = function(contact){

var alertPopup = $ionicPopup.confirm({
     title: 'Save Contact',
     template: 'Are you sure to save this contact'
   });

   alertPopup.then(function(res) {
    if(res)
    {
      var myContact = navigator.contacts.create();
      myContact.displayName=contact.displayName;
      myContact.name=contact.name;
      myContact.nickname=contact.nickname;

      //phone Number
      var phoneNumbers = [];
      if(contact.phoneNumbers!=null)
      {
        for(var i=0;i<contact.phoneNumbers.length;i++)
        {
          phoneNumbers[i]=contact.phoneNumbers[i];
        }
        myContact.phoneNumbers=phoneNumbers;
      }
      //email
      var emails = [];
      if(contact.emails!=null)
      {
        for(var i=0;i<contact.emails.length;i++)
        {
          emails[i]=contact.emails[i];
        }
        myContact.emails=emails;
      }
       //address

      var addresses = [];
      if(contact.addresses!=null)
      {
        for(var i=0;i<contact.addresses.length;i++)
        {
          addresses[i]=contact.addresses[i];
        }
        myContact.addresses=addresses;
      }
      myContact.save(onSaveSuccess, onSaveError);

      function onSaveSuccess(contact) {
         alert("Save Success");
      }

      function onSaveError(contactError) {
         alert("Error = " + contactError.code);
      }
    }
   });



}

$scope.shareLocation = function(){
  $scope.popover.hide()
    $ionicLoading.show({
    template:'Please wait while getting your current position..'
    })
   var onSuccess = function(position) {
        $ionicLoading.hide();
        var lat=position.coords.latitude;
        var long=position.coords.longitude;

        var toId=$scope.toUser._id;
        var text={"lat":lat,"long":long};
        var username=$scope.user.username;
        var userId=$scope.user._id;
        var simg= $scope.user.pic;
        var rimg= $scope.toUser.pic;
        var whisperedMsg = "/w "+ $scope.toUser._id+" " ;
        socket.emit('send message',{ message:whisperedMsg + JSON.stringify(text),isType:2})
        socket.emit('stop typing',{ oppUser:$scope.toUser._id});
        customMsg(userId,toId,text,userId,'0','2');

    };

    // onError Callback receives a PositionError object
    //
    function onError(error) {
      $ionicLoading.hide();
        alert('code: '    + error.code    + '\n' +
              'message: ' + error.message + '\n');
    }
    var posOptions = {timeout: 10000, enableHighAccuracy: false};

    navigator.geolocation.getCurrentPosition(onSuccess, onError,posOptions);


// $ionicLoading.show({
// template:'Please wait while getting your current position..'
// })
// if (window.cordova) {
//     cordova.plugins.diagnostic.isLocationEnabled(function(enabled) {
//         if(!enabled)
//         {
//           $ionicLoading.hide();
//             $ionicPopup.alert({
//              title: 'GPS is disabled',
//              template: 'Show location settings?'
//            }).then(function(res){
//             if(res)
//             {
//             cordova.plugins.diagnostic.switchToLocationSettings();
//             }
//            });
//         }
//     }, function(error) {
//         alert("The following error occurred: " + error);
//     });
// }
// var posOptions = {timeout: 10000, enableHighAccuracy: false};
//        $cordovaGeolocation.getCurrentPosition(posOptions)
//         .then(function (position) {
//           $ionicLoading.hide();
//           var lat  = position.coords.latitude;
//           var long = position.coords.longitude;

          // var toId=$scope.toUser._id;
          // var text={"lat":lat,"long":long};
          // var username=$scope.user.username;
          // var userId=$scope.user._id;
          // var simg= $scope.user.pic;
          // var rimg= $scope.toUser.pic;
          // customMsg(userId,toId,text,userId,'0','2');
//         }, function(err) {
//           alert("Someting Wrong Please try again")
//           $ionicLoading.hide();
//         });

 }

  function sendImage(imgeURI)
  {
  var jsonObject = {
  'imageData':imgeURI,
  'imageMetaData': '1234',
  'toUserId':tousrid
  };

  socket.emit('user image', jsonObject);
  var toId=$scope.toUser._id;
  var userId=$scope.user._id;
  var img=imgeURI;

  customMsg(userId,toId,img,userId,'0','1');

  }


  var self=this;
  var connected= true;
  var typing = false;
  var lastTypingTime;
  var TYPING_TIMER_LENGTH = 400;
  //Add colors
  var COLORS = [
               '#e21400', '#91580f', '#f8a700', '#f78b00',
               '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
               '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
               ];

  //initializing messages array
  self.messages=[]

  //function called when user hits the send button
  self.sendMessage=function(){

  socket.emit('send message', self.message)

  addMessageToList($stateParams.nickname,true,self.message)
  socket.emit('stop typing',{ oppUser:$scope.toUser._id});
  self.message = ""
  }

  //function called on Input Change
  self.updateTyping=function(){
  sendUpdateTyping()
  }

  // Display message by adding it to the message list
  function addMessageToList(username,style_type,message){
    username = $sanitize(username)
    removeChatTyping(username)
    // var color = style_type ? getUsernameColor(username) : null self.messages.push({content:$sanitize(message),style:style_type,username:username,color:color})

  }

  //Generate color for the same user.
  function getUsernameColor (username) {
    // Compute hash code
    var hash = 7;
    for (var i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + (hash << 5) - hash;
    }
    // Calculate color
    var index = Math.abs(hash % COLORS.length);
    return COLORS[index];
  }

  // Updates the typing event
  function sendUpdateTyping(){
    if(connected){
    if (!typing) {
    typing = true;
    socket.emit('typing',{ oppUser:$scope.toUser._id,currentUser:$scope.user._id});
    }
    }
    lastTypingTime = (new Date()).getTime();
    $timeout(function () {
            var typingTimer = (new Date()).getTime();
            var timeDiff = typingTimer - lastTypingTime;
            if (timeDiff >= TYPING_TIMER_LENGTH && typing) {
            socket.emit('stop typing',{ oppUser:$scope.toUser._id});
            typing = false;
            }
            }, TYPING_TIMER_LENGTH)
  }

  // Adds the visual chat typing message
  function addChatTyping (data) {
    self.messages = data.currentUser + " is typing";
    $scope.chatstatus = 'typing...';
  }

  // Removes the visual chat typing message
  function removeChatTyping (username) {
    self.messages = "";
    $scope.chatstatus = 'online';

  }

  function message_string(number_of_users)
  {
  return number_of_users === 1 ? "there's 1 participant":"there are " + number_of_users + " participants"
  }

  $scope.input = {
   message: localStorage['userMessage-' + $scope.toUser._id] || ''
  };

  var messageCheckTimer;

  var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
  var footerBar; // gets set in $ionicView.enter
  var scroller;
  var txtInput; // ^^^

  socket.on('typing', function (data) {
           addChatTyping(data);
           });

  // Whenever the server emits 'stop typing', kill the typing message
  socket.on('stop typing', function (data) {
           removeChatTyping("");
           });

  $scope.$on('$ionicView.enter', function() {
            console.log('UserMessages $ionicView.enter');

            $scope.getMessages(0);

            $timeout(function() {
                     footerBar = document.body.querySelector('#userMessagesView .bar-footer');
                     scroller = document.body.querySelector('#userMessagesView .scroll-content');
                     txtInput = angular.element(footerBar.querySelector('textarea'));
                     }, 0);
            messageCheckTimer = $interval(function() {

                                          }, 20000);
  });

  $scope.$on('$ionicView.leave', function() {

            console.log('leaving UserMessages view, destroying interval');
            if (angular.isDefined(messageCheckTimer)) {
            $interval.cancel(messageCheckTimer);
            messageCheckTimer = undefined;
            }
  });

  $scope.$on('$ionicView.beforeLeave', function() {
            if (!$scope.input.message || $scope.input.message === '') {
            localStorage.removeItem('userMessage-' + $scope.toUser._id);
            }
  });

  $scope.messages=[];

  $scope.getMessages = function(offset){
    $scope.offset=offset;
    var selectchat="SELECT * FROM tbl_message where(senderId='"+userid+"' and receiverId='"+tousrid+"') or (senderId='"+tousrid+"' and receiverId='"+userid+"') order by id DESC LIMIT "+$scope.offset+", 5" ;
    $scope.offset=+$scope.offset+10;
    $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
         if(res.rows.length >0)
         {
         for(var i=0; i<res.rows.length; i++)
         {
         //alert(i);
         console.log("SELECTED -> " + res.rows.item(i).id + " " + res.rows.item(i).senderId);

         if(res.rows.item(i).imgFlag=='2' || res.rows.item(i).imgFlag=='3')
         {
         var latlong=JSON.parse(res.rows.item(i).message);
         $scope.messages.unshift(
                              {
                              "_id":res.rows.item(i).id,
                              "date":res.rows.item(i).dateCreated,
                              "senderId":res.rows.item(i).senderId,
                              "receiverId":res.rows.item(i).receiverId,
                              "loginUid":res.rows.item(i).loginUserId,
                              "text":latlong,
                              "contactName":'',
                              "imgFlag":res.rows.item(i).imgFlag
                              });

         $timeout(function() {
                 // viewScroll.scrollBottom(true);
                 $ionicScrollDelegate.scrollBottom();
                  }, 0);
         }
         else
         {
         $scope.messages.unshift(
                              {
                              "_id":res.rows.item(i).id,
                              "date":res.rows.item(i).dateCreated,
                              "senderId":res.rows.item(i).senderId,
                              "receiverId":res.rows.item(i).receiverId,
                              "loginUid":res.rows.item(i).loginUserId,
                              "text":res.rows.item(i).message,
                              "contactName":'',
                              "imgFlag":res.rows.item(i).imgFlag
                              });

         $timeout(function() {
                 // viewScroll.scrollBottom(true);
                 $ionicScrollDelegate.scrollBottom();
                  }, 0);
         }
         }
         }
         var jsonArray = JSON.parse(JSON.stringify($scope.messages))
         return jsonArray;
         }, function (err) {
         console.error("-********error------"+JSON.stringify(err));
         });
                $scope.$broadcast('scroll.refreshComplete');

  }

  $scope.$on('whispermsg', function(event,args){
      if(args.nick&&args.message)
      {
        //data.nick,true,data.msg
        var msgs;
        if(args.imgFlag==2)
        {
            msgs=JSON.parse(args.message)
        }
        else
        {
            msgs=args.message;
        }
        var senderId=args.nick;
        var msg=msgs;
        var toId=$scope.toUser._id;
        var touid=$scope.toUser._id;
        var userId=$scope.user._id;
        var imgFlag=args.imgFlag;
        if(senderId==touid)
        {
        var unrdflag='0';
        customMsg(senderId,userId,msg,userId,unrdflag,imgFlag);
        }
        else
        {
        var unrdflag='1';
        MessagesService.insertMsg({
                  senderId:senderId,
                  receiverId:userId,
                  message:msg,
                  loginUserId:userId,
                  unReadflag:'1',
                  imgFlag:imgFlag
              });
        var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+args.nick+"' and readUnreadFlg='1'";
          $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
             var _msg;
            if(args.imgFlag==2)
            {
              _msg='Location';
            }
            else if(args.imgFlag==3)
            {
              _msg='Location';
            }
            else{
              _msg=args.message;
            }
            CouchDBServices.getUserDetails(senderId).then(function(doc){
            var userInfo={
                  id:args.nick,
                  title:doc.name,
                  text:_msg,
                  badge:res.rows.item(0).buge,
                  data:doc,
                 }
                 $cordovaLocalNotification.schedule(userInfo).then(function (result) {
                 });
              })
          })


        }

       // insert msg here
      }
  });

  $scope.$on('whisperimg', function(event,args){
          if(args.nick&&args.image)
          {
              //data.nick,true,data.msg
              var senderId=args.nick;
              var img=args.image;
              var touid=$scope.toUser._id;
              var userId=$scope.user._id;
              var imgFlag='1';

              if(senderId==touid)
              {
              var unrdflag='0';
              customMsg(senderId,userId,img,userId,unrdflag,imgFlag);
              }
              else
              {
              var unrdflag='1';
              MessagesService.insertMsg({
                  senderId:senderId,
                  receiverId:userId,
                  message:img,
                  loginUserId:userId,
                  unReadflag:'1',
                  imgFlag:imgFlag
              });
             var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+args.nick+"' and readUnreadFlg='1'";
              $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
              CouchDBServices.getUserDetails(senderId).then(function(doc){
                  var userInfo={
                    id:args.nick,
                    title:doc.name,
                    text:'Image',
                    badge:res.rows.item(0).buge,
                    data:doc,
                  }
                  $cordovaLocalNotification.schedule(userInfo).then(function (result) {
                  });
                })
              })

              }
          }
  });


  $scope.$watch('input.message', function(newValue, oldValue) {
             //  socket.emit('typing',{ oppUser:$scope.toUser._id});
             console.log('input.message $watch, newValue ' + newValue);
             if (!newValue) newValue = '';
             localStorage['userMessage-' + $scope.toUser._id] = newValue;
  });

  $ionicModal.fromTemplateUrl('templates/modal.html', function (modal) {
    $scope.gridModal = modal;
  }, {
    scope: $scope,
    animation: 'slide-in-up'
  });

  $scope.openModal11 = function (data) {
    console.log('Modal opened');
    $scope.inspectionItem = data;
    $scope.gridModal.show();
  };
  $scope.closeModal11 = function () {
    $scope.gridModal.hide();
  };

  $scope.sendMessage = function(sendMessageForm) {
      var whisperedMsg = "/w "+ $scope.toUser._id+" " ;
      socket.emit('send message',{ message:whisperedMsg + $scope.input.message,isType:0})
      socket.emit('stop typing',{ oppUser:$scope.toUser._id});

      var toId=$scope.toUser._id;
      var toUname=$scope.toUser.username;
      var text=$scope.input.message;
      var username=$scope.user.username;
      var userId=$scope.user._id;
      var simg= $scope.user.pic;
      var rimg= $scope.toUser.pic;

      customMsg(userId,toId,text,userId,'0','0');
      // insert msg here

      keepKeyboardOpen();

      $scope.input.message = '';

      $timeout(function() {
              keepKeyboardOpen();
      $ionicScrollDelegate.scrollBottom();
             // viewScroll.scrollBottom(true);
              }, 0);

  };

  function customMsg(sid,rid,text,loginUid,unread,imgFlag)
  {
      //alert('custommsge'+sid);
      var message = {};
      var msgData;
      if(imgFlag==3)
      {
          var _text=JSON.parse(text);
       }
      else
      {
          var _text=text
      }

      message.contactName='';
      message.text=_text;
      message._id = String(new Date().getTime());
      message.date = new Date();
      message.senderId = sid;
      message.receiverId=rid;
      message.loginUid=loginUid;
      message.imgFlag=imgFlag;
      $scope.messages.push(message);
      $timeout(function() {
              keepKeyboardOpen();
$ionicScrollDelegate.scrollBottom();

             // viewScroll.scrollBottom(true);
              }, 0);
      var ms=JSON.stringify($scope.messages);
        MessagesService.insertMsg({
                  senderId:sid,
                  receiverId:rid,
                  message:text,
                  loginUserId:loginUid,
                  unReadflag:unread,
                  imgFlag:imgFlag
        });

      console.log("*****************message array********"+ms);
  }

  function keepKeyboardOpen() {
    console.log('keepKeyboardOpen');
    txtInput.one('blur', function() {
                console.log('textarea blur, focus back on it');
                txtInput[0].focus();
                });
  }

  // $scope.onMessageHold = function(e, itemIndex, message) {
  // console.log('onMessageHold');
  // console.log('message: ' + JSON.stringify(message, null, 2));
  // $ionicActionSheet.show({
  //                       buttons: [{
  //                                 text: 'Copy Text'
  //                                 }, {
  //                                 text: 'Delete Message'
  //                                 }],
  //                       buttonClicked: function(index) {
  //                       switch (index) {
  //                       case 0: // Copy Text
  //                       //cordova.plugins.clipboard.copy(message.text);

  //                       break;
  //                       case 1: // Delete
  //                       // no server side secrets here :~)
  //                       $scope.messages.splice(itemIndex, 1);
  //                       $timeout(function() {
  //                                viewScroll.resize();
  //                                }, 0);

  //                       break;
  //                       }

  //                       return true;
  //                       }
  //                       });
  // };

  $scope.$on('taResize', function(e, ta) {
          console.log('taResize');
          if (!ta) return;

          var taHeight = ta[0].offsetHeight;
          console.log('taHeight: ' + taHeight);

          if (!footerBar) return;

          var newFooterHeight = taHeight + 10;
          newFooterHeight = (newFooterHeight > 44) ? newFooterHeight : 44;

          footerBar.style.height = newFooterHeight + 'px';
          scroller.style.bottom = newFooterHeight + 'px';
          });

})
// fitlers
.filter('nl2br', ['$filter', function($filter) {
                  return function(data) {
                  if (!data) return data;
                  return data.replace(/\n\r?/g, '<br />');
                  };
                  }
                  ])
// directives
.directive('autolinker', ['$timeout', function($timeout) {
  return {
  restrict: 'A',
  link: function(scope, element, attrs) {
  $timeout(function() {
           var eleHtml = element.html();
           if (eleHtml === '') {
           return false;
           }
           var text = Autolinker.link(eleHtml, {
                                      className: 'autolinker',
                                      newWindow: false
                                      });

           element.html(text);

           var autolinks = element[0].getElementsByClassName('autolinker');

           for (var i = 0; i < autolinks.length; i++) {
           angular.element(autolinks[i]).bind('click', function(e) {
                                              var href = e.target.href;
                                              console.log('autolinkClick, href: ' + href);

                                              if (href) {
                                              //window.open(href, '_system');
                                              window.open(href, '_blank');
                                              }

                                              e.preventDefault();
                                              return false;
                                              });
           }
           }, 0);
  }
  }
  }
  ])
function onProfilePicError(ele) {
    this.ele.src = ''; // set a fallback
}
// configure moment relative time
moment.locale('en', {
              relativeTime: {
              future: "in %s",
              past: "%s ago",
              s: "%d sec",
              m: "a minute",
              mm: "%d minutes",
              h: "an hour",
              hh: "%d hours",
              d: "a day",
              dd: "%d days",
              M: "a month",
              MM: "%d months",
              y: "a year",
              yy: "%d years"
              }
              });
