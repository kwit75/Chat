// Ionic Starter App
 var sqlitedb=null;
// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// var app=angular.module('starter', ['ionic','starter.services','intlpnIonic','couchDB.services','contacts.services','pouchdb'])

var app= angular.module('starter',
        ['ionic',
         'starter.services',
         'pouchdb',
         'couchDB.services',
         'contacts.services',
         'angularMoment',
         'ngSanitize',
         'btford.socket-io',
         'ngCordova',
         'angularMoment',
         'intlpnIonic',
         'ionicLazyLoadCache',
         ]
    )

.run(function($ionicPlatform,$cordovaSQLite,$state,UserService,socket,$rootScope,MessagesService,$timeout,$ionicHistory, $cordovaLocalNotification,CouchDBServices) {
  $ionicPlatform.ready(function()
  {
       if (ionic.Platform.isIOS()){
          navigator.splashscreen.hide();
          }

      if(window.cordova && window.cordova.plugins.Keyboard){

      // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
      // for form inputs)

      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);

      // Don't remove this line unless you know what you are doing. It stops the viewport
      // from snapping when text inputs are focused. Ionic handles this internally for
      // a much nicer keyboard experience.
      cordova.plugins.Keyboard.disableScroll(true);


    }

    if(window.StatusBar){
      StatusBar.styleDefault();
    }
    // document.addEventListener("resume", function() {
    //             console.log(">>>>>>>>>>>>>>>>>>The application is resuming from the background");
    //         }, false);


        // ##############----scoket----###########//
        socket.on('login', function (data) {
              //Set the value of connected flag
              self.connected = true
              self.number_message= message_string(data.numUsers)

              });
         socket.on('new message', function(data){
                    if(data.msg&&data.nick)
                    {
                    addMessageToList(data.username,true,data.message)
                    }
                    });
         socket.on('user image', function(data){

                    if($ionicHistory.currentStateName()=='chating')
                    {
                      var jGeneratedImg={"nick":data.nick,"image":data.image};
                      $rootScope.$broadcast('whisperimg',jGeneratedImg);
                    }
                     else if($ionicHistory.currentStateName()=='tab.chats'){
                         var jGeneratedMsg ={ "nick" : data.nick , "message" : data.image , "imgFlag":'1' };
                         $rootScope.$broadcast('refreshChats',jGeneratedMsg)
                    }
                    else{
                        var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+data.nick+"' and readUnreadFlg='1'";
                        $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
                            CouchDBServices.getUserDetails(data.nick).then(function(doc){
                              var userInfo={
                                  id:data.nick,
                                  title:doc.name,
                                  text:'Image',
                                  badge:res.rows.item(0).buge+1,
                                  data:doc,
                              }
                              $cordovaLocalNotification.schedule(userInfo).then(function (result) {
                             });
                            })
                         })

                       MessagesService.insertMsg({
                                  senderId:data.nick,
                                  receiverId:UserService.getLoginUser(),
                                  message:data.image,
                                  loginUserId:UserService.getLoginUser(),
                                  unReadflag:'1',
                                  imgFlag:'1'
                        });
                    }
                  });
         socket.on('share contact',function(data){
                    var jGeneratedContact={"nick":data.nick,"contact":data.contact}

                    $scope.$broadcast('whispercontact',jGeneratedContact);
                    });
         socket.on('whisper', function(data){
                  // $timeout(function(){
                  //      $rootScope.$broadcast('refreshChats')
                  //     // chatrefresh()
                  // },2000)
                    var selectchat="SELECT count(*) as buge FROM tbl_message where senderId='"+data.nick+"' and readUnreadFlg='1'";
                    if($ionicHistory.currentStateName()=='chating')
                    {
                      var jGeneratedMsg ={ "nick" : data.nick , "message" : data.msg,"imgFlag":data.isType};
                       $rootScope.$broadcast('whispermsg',jGeneratedMsg);

                    }

                    else if($ionicHistory.currentStateName()=='tab.chats'){
                         var jGeneratedMsg ={ "nick" : data.nick , "message" : data.msg , "imgFlag":data.isType };
                         $rootScope.$broadcast('refreshChats',jGeneratedMsg)
                    }
                    else{

                     MessagesService.insertMsg({
                                senderId:data.nick,
                                receiverId:UserService.getLoginUser(),
                                message:data.msg,
                                loginUserId:UserService.getLoginUser(),
                                unReadflag:'1',
                                imgFlag:data.isType
                      })
                      $cordovaSQLite.execute(sqlitedb, selectchat, []).then(function(res) {
                        var msg;
                        if(data.isType==2)
                        {
                           msg='Location';
                        }
                        else if(data.isType==3)
                        {
                           msg='Location';
                        }
                        else
                        {
                          msg=data.msg;
                        }
                        CouchDBServices.getUserDetails(data.nick).then(function(doc){
                         var userInfo={
                              id:data.nick,
                              title:doc.name,
                              text:msg,
                              badge:res.rows.item(0).buge,
                              data:doc,
                          }
                          $cordovaLocalNotification.schedule(userInfo).then(function (result) {

                          })
                        })
                      })
                    }
                    });

          // Whenever the server emits 'user joined', log it in the chat body
         socket.on('user joined', function (data) {
                    addMessageToList("",false,data.username + " joined")
                    addMessageToList("",false,message_string(data.numUsers))
                    });
         // Whenever the server emits 'user left', log it in the chat body
         socket.on('user left', function (data) {
                    addMessageToList("",false,data.username+" left")
                    addMessageToList("",false,message_string(data.numUsers))
                    });

         // ========== Events

        $rootScope.$on('$cordovaLocalNotification:schedule',
        function (event, notification, state) {

          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:getScheduled',
        function (event, notification, state) {
          // ...
        });
        $rootScope.$on('$cordovaLocalNotification:trigger',
        function (event, notification, state) {
          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:update',
        function (event, notification, state) {
          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:clear',
        function (event, notification, state) {
          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:clearall',
        function (event, state) {
          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:cancel',
        function (event, notification, state) {
          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:cancelall',
        function (event, state) {
          // ...
        });

        $rootScope.$on('$cordovaLocalNotification:click',
        function (event, notification, state) {
          if(notification.data){
           UserService.setToUserData(JSON.parse(notification.data))
           $state.go('chating')
           if($ionicHistory.currentStateName()=='chating')
           {
               $state.go($state.current, {}, {reload: true});
           }

          }
          else
          {
            $state.go('tab.chats');
          }
          // ...
        });
        $rootScope.$on('$cordovaLocalNotification:added',
        function (event, notification, state) {

          // ...
        });

        // =========/ Events


         // ### ---- cordovasqlite -- ### //
     sqlitedb = $cordovaSQLite.openDB({name: "my.db", createFromLocation: 1});
       //   db = window.openDatabase("my.db", "1.0", "Cordova Demo", 200000);
       $cordovaSQLite.execute(sqlitedb, 'CREATE TABLE IF NOT EXISTS "tbl_contact" ("id" INTEGER PRIMARY KEY  NOT NULL ,"name" VARCHAR,"phone" VARCHAR,"avatar" VARCHAR,"isActive" INTEGER, "status" VARCHAR,"fbid" VARCHAR, "country" VARCHAR,"gender" VARCHAR, "resid" VARCHAR)');
       $cordovaSQLite.execute(sqlitedb,'CREATE TABLE "tbl_message" ("id" INTEGER PRIMARY KEY  NOT NULL , "senderId" VARCHAR, "receiverId" VARCHAR, "senderDetails" VARCHAR, "receiverDetails" VARCHAR, "message" TEXT, "dateCreated" DATETIME, "chatId" VARCHAR, "readUnreadFlg" INTEGER, "groupId" INTEGER, "groupOwnerId" INTEGER, "groupMemberId" TEXT DEFAULT (null) , "groupName" TEXT, "isBlocked" INTEGER, "loginUserId" VARCHAR, "imgFlag" INTEGER )')
        // alert("Contacts >>>"+navigator.contacts);
      UserService.setSqldb(sqlitedb);
  });
})

//.constant('SERVER_ADDRESS', 'http://162.243.156.187:5984/registeruser')
//.constant('SERVER_ADDRESS', 'http://104.236.29.212:5984/registeruser')
.constant('SERVER_ADDRESS', 'http://159.203.62.77:5984/registeruser')
.config(function($stateProvider, $urlRouterProvider,$compileProvider) {
    $compileProvider.aHrefSanitizationWhitelist(/^\s*(geo):/);
    $stateProvider
      .state('intro', {
         url: '/',
         templateUrl: 'templates/intro.html',
         controller: 'IntroCtrl',
         onEnter: function($state, UserService,$rootScope,socket,$timeout,$ionicPlatform){

           var _loginStatus=UserService.getLoginUser();
            if(!isNaN(_loginStatus))
               {
                $state.go('tab.chats');
                window.localStorage['isTimeout']=1;
              }

         }
      })

      .state('login', {
        url: '/login',
        templateUrl: 'templates/sign-in.html',
        controller: 'LoginCtrl'
      })

    // .state('login', {
    //     url: '/',
    //     templateUrl: 'templates/sign-in.html',
    //     controller: 'LoginCtrl'
    //   })
      .state('contact-number', {
        url: '/contact-number',
        templateUrl: 'templates/contact-number.html',
        controller: 'ContactCtrl'
      })

      .state('tab', {
        url: '/tab',
        abstract: true,
        templateUrl: 'templates/tabs.html'
      })
      .state('tab.chats', {
        url: '/chats',
        views: {
          'tab-chats': {
            templateUrl: 'templates/tab-chats.html',
            controller: 'ChatsCtrl'
          }
        }
      })
      .state('tab.contact', {
        url: '/contacts',
        views: {
          'tab-contacts': {
            templateUrl: 'templates/tab-contacts.html',
            controller: 'ContactsNoCtrl'
          }
        }
      })

      .state('chating', {
        url: '/chating',
        templateUrl: 'templates/chating.html',
        controller: 'ChatingCtrl'
      })
      .state('touserprofile', {
        url: '/touserprofile',
        templateUrl: 'templates/to-user-profile.html',
        controller: 'toUserProfileCtrl',
        params:{
          toUserData:''
        }
      })
       .state('userprofile', {
        url: '/userprofile',
        templateUrl: 'templates/user-profile.html',
        controller: 'UserProfileCtrl',

      })

      $urlRouterProvider.otherwise('/');
})
