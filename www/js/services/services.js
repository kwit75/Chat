angular.module('starter.services', [])

  .service('VideoService', function($q) {
    // TBD
    var deferred = $q.defer();
    var promise = deferred.promise;

    promise.success = function(fn) {
      promise.then(fn);
      return promise;
    }
    promise.error = function(fn) {
      promise.then(null, fn);
      return promise;
    }

// Resolve the URL to the local file
// Start the copy process
    function createFileEntry(fileURI) {
      window.resolveLocalFileSystemURL(fileURI, function(entry) {
        return copyFile(entry);
      }, fail);
    }

// Create a unique name for the videofile
// Copy the recorded video to the app dir
    function copyFile(fileEntry) {
      var name = fileEntry.fullPath.substr(fileEntry.fullPath.lastIndexOf('/') + 1);
      var newName = makeid() + name;

      window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function(fileSystem2) {
          fileEntry.copyTo(fileSystem2, newName, function(succ) {
            return onCopySuccess(succ);
          }, fail);
        },
        fail
      );
    }

// Called on successful copy process
// Creates a thumbnail from the movie
// The name is the moviename but with .png instead of .mov
    function onCopySuccess(entry) {
      var name = entry.nativeURL.slice(0, -4);
      window.PKVideoThumbnail.createThumbnail (entry.nativeURL, name + '.png', function(prevSucc) {
        return prevImageSuccess(prevSucc);
      }, fail);
    }

// Called on thumbnail creation success
// Generates the currect URL to the local moviefile
// Finally resolves the promies and returns the name
    function prevImageSuccess(succ) {
      var correctUrl = succ.slice(0, -4);
      correctUrl += '.MOV';
      deferred.resolve(correctUrl);
    }

// Called when anything fails
// Rejects the promise with an Error
    function fail(error) {
      console.log('FAIL: ' + error.code);
      deferred.reject('ERROR');
    }

// Function to make a unique filename
    function makeid() {
      var text = '';
      var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      for ( var i=0; i < 5; i++ ) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
      }
      return text;
    }

// The object and functions returned from the Service
    return {
      // This is the initial function we call from our controller
      // Gets the videoData and calls the first service function
      // with the local URL of the video and returns the promise
      saveVideo: function(data) {
        createFileEntry(data[0].localURL);
        return promise;
      }
    }

  })

.service('UserService', function() {

     var setUser = function(user_data) {
     window.localStorage.starter_facebook_user = JSON.stringify(user_data);
     };

     var getUser = function(){
     return JSON.parse(window.localStorage.starter_facebook_user || '{}');
     };
     var setUserRes = function(user_data) {
     window.localStorage.starter_facebook_user1 = JSON.stringify(user_data);
     };

     var getUserRes = function(){
     return JSON.parse(window.localStorage.starter_facebook_user1 || '{}');
     };

     var setUserChat=function(chat_data){
     window.localStorage.starter_facebook_user2 = JSON.stringify(chat_data);
     };

     var getUserChat=function()
     {
     return JSON.parse(window.localStorage.starter_facebook_user2 || '{}');
     }
     var setLoginUser=function(LoginUserID){
     window.localStorage.LoginUserID = JSON.stringify(LoginUserID);
     };

     var getLoginUser=function()
     {
     return JSON.parse(window.localStorage.LoginUserID || '{}');
     }

     var setSqldb=function(sqldata){
     window.localStorage.sqldata = JSON.stringify(sqldata);
     };

     var getSqldb=function()
     {
     return JSON.parse(window.localStorage.sqldata || 'null');
     }

     var setToUserData=function(toUser){
     window.localStorage.toUser = JSON.stringify(toUser);
     };
     var getToUserData=function(){
           return JSON.parse(window.localStorage.toUser || '{}');
     }

     var selectedContactId;
     var selectedToUserId;
     var selectedToUserName;
     var selectedToUserImg;
     var selectedImageUrl;
     var loginUserId;
     var loginStatus;
     var toUserProfileId;
     var countrycode;
     var country;
     return {
      setToUserData:setToUserData,
      getToUserData:getToUserData,
     getSqldb:getSqldb,
     setSqldb:setSqldb,
     getLoginUser:getLoginUser,
     setLoginUser:setLoginUser,
     getUser: getUser,
     setUser: setUser,
     getUserRes: getUserRes,
     setUserRes: setUserRes,
     getUserChat: getUserChat,
     setUserChat:setUserChat,
     selectedContactId:selectedContactId,
     selectedToUserId:selectedToUserId,
     selectedToUserName:selectedToUserName,
     selectedToUserImg:selectedToUserImg,
     selectedImageUrl:selectedImageUrl,
     loginUserId:loginUserId,
     loginStatus:loginStatus,
     toUserProfileId:toUserProfileId,
     countrycode:countrycode,
     country:country
     };
})

.service('MessagesService',function($q,$rootScope,$state,$cordovaSQLite,UserService){

        var insertMsg= function(data){
        var q = $q.defer();
          var db_contact = new PouchDB('contact',{adapter: 'localstorage'});

          var sid=data.senderId;
          var rid=data.receiverId;
          // var senderDetails=data.senderDetails;
          // var receiverDetails=data.receiverDetails;
          var text=data.message;
          var loginUid=data.loginUserId;
          var unread=data.unReadflag;
          var imgFlag=data.imgFlag;
          var date=new Date();

          if(sid==loginUid)
          {
            var senderDetails=JSON.stringify(UserService.getUser());
            db_contact.get(rid).then(function (doc) {
            var receiverDetails=JSON.stringify(doc)

             insertData(senderDetails,receiverDetails)
            })

          }
          else
          {
            var receiverDetails=JSON.stringify(UserService.getUser());
            db_contact.get(sid).then(function (doc) {
            var senderDetails=JSON.stringify(doc)
            insertData(senderDetails,receiverDetails)
            }).catch(function(err){
              var sData={
                _id:sid,
                name:sid,
                phone:sid,
                isUser:1
              }
              insertData(sData,receiverDetails)
            })
          }
          // get chatid from database

          function insertData(senderDetails,receiverDetails)
          {
              var getchatid="select * from tbl_message where(senderId='"+sid+"' and receiverId='"+rid+"') or (senderId='"+rid+"' and receiverId='"+sid+"') ";
                $cordovaSQLite.execute(sqlitedb, getchatid, []).then(function(result){
                  if(result.rows.length>0)
                  {
                  var chatid=result.rows.item(0).chatId;
                  var query = "INSERT INTO tbl_message (senderId, receiverId,senderDetails,receiverDetails,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupMemberId,groupName,isBlocked,loginUserId,imgFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(sqlitedb, query, [sid, rid,senderDetails,receiverDetails,text,date,chatid,unread,'','','','','',loginUid,imgFlag]).then(function(res) {
                             console.log("INSERT resolve -> " + JSON.stringify(res));
                             q.resolve(res.insertId);

                             }, function (err) {
                             console.error(err);
                             q.reject(err);
                             });

                  }
                  else
                  {
                  // insert chatid
                  var query = "INSERT INTO tbl_message (senderId, receiverId,senderDetails,receiverDetails,message,dateCreated,chatId,readUnreadFlg,groupId,groupOwnerId,groupMemberId,groupName,isBlocked,loginUserId,imgFlag) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)";
                  $cordovaSQLite.execute(sqlitedb, query, [sid, rid,senderDetails,receiverDetails,text,date,'',unread,'','','','','',loginUid,imgFlag]).then(function(res) {                                                                                                            //update chat id
                     var updatechatid="UPDATE tbl_message SET chatid='"+res.insertId+"' where id='"+res.insertId+"'";
                     $cordovaSQLite.execute(sqlitedb, updatechatid, []).then(function(ress){
                                 q.resolve(res.insertId);

                                 }, function (err) {
                                    alert(err)
                                 console.error(err);
                                 q.reject(err);

                                 });
                     })
                  }
                })
          }
        return q.promise;

        }
        return{
         insertMsg:insertMsg
        }
})

.directive('actualSrc', function () {
        return{
            link: function postLink(scope, element, attrs) {
                attrs.$observe('actualSrc', function(newVal){
                     if(newVal !== undefined){
                         var img = new Image();
                         img.src = attrs.actualSrc;
                         angular.element(img).bind('load', function () {
                             element.attr("src", attrs.actualSrc);
                         });
                     }
                });

            }
        }
})
.directive('map', function() {
    return {
        restrict: 'A',
        link:function(scope, element, attrs){

          var zValue = scope.$eval(attrs.zoom);
          var lat = scope.$eval(attrs.lat);
          var lng = scope.$eval(attrs.lng);
          var myLatlng = new google.maps.LatLng(lat,lng),
          mapOptions = {
                zoom: zValue,
                center: myLatlng,
                zoomControl: false,
                scaleControl: false,
                scrollwheel:false,
                navigationControl:false,
                mapTypeControl: false,
                draggable: false,
                disableDoubleClickZoom: true,
                mapTypeId: google.maps.MapTypeId.ROADMAP

          },
          map = new google.maps.Map(element[0],mapOptions);
          marker = new google.maps.Marker({
                position: myLatlng,
                map: map
          });

        }
    };
})
