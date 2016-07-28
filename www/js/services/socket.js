app.factory('socket',function(socketFactory){
	//Create socket and connect to http://chat.socket.io
   //var socket = io.connect('http://192.254.67.45:3000');
  var socket = io.connect('http://159.203.62.77:3000/');
  //var socket = io.connect('http://192.168.1.11:3000');

  	mySocket = socketFactory({
    	ioSocket: socket
  	})
	return mySocket;
})
