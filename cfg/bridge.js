var http = require('http');
var os = require('os');
var fs = require('fs');
var iolib = require('socket.io');

httpserver = http.createServer(function (req, res) {
    var hosjs = fs.readFileSync('hos.js');
    var hoscss = fs.readFileSync('hos.css');
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.write('<!DOCTYPE HTML>\n');
    res.write('<html><head><style>');
    res.write(hoscss);
    res.write('</style><title>ORLANDOviols consort box</title>\n</head><body>\n');
    res.write('<h1>ORLANDOviols consort box ('+os.hostname()+')</h1>\n<div id="mixer">mixer</div>\n');
    res.write('<div class="netctl" id="netctl"><p>Network settings</p>\n');
    res.write('<p><input type="checkbox" class="checkbox" id="peer2peer" name="peer2peer"><label for="peer2peer"> Peer-to-peer mode</label></p>\n');
    res.write('<p><input type="checkbox" class="checkbox" id="duplicates" name="duplicates"><label for="duplicates"> Send packages twice</label></p>\n');
    res.write('</div>');
    res.write('<script src="http://'+os.hostname()+':8080/socket.io/socket.io.js"></script>\n');
    res.write('<script>\n');
    res.write('var socket = io("http://'+os.hostname()+':8080");\n');
    res.write(hosjs);
    res.end('</script>\n</body></html>');
});

var osc = require('node-osc');

httpserver.listen(8080);
io = iolib(httpserver);

var oscServer, oscClient;

oscServer = new osc.Server( 9000, '0.0.0.0' );
oscClient = new osc.Client( 'localhost', 9877 );
oscClientMPLX = new osc.Client( 'localhost', 9876 );

io.on('connection', function (socket) {
    socket.on('config', function (obj) {
	oscClient.send('/status', socket.id + ' connected');
	oscServer.on('message', async function(msg, rinfo) {
	    if( msg[0] == '/touchosc/scene' ){
		socket.emit('scene', 'scene');
	    }
	    if( msg[0].startsWith('/touchosc/label') && (!msg[0].endsWith('/color')) && (msg[1].length>1)){
		socket.emit('newfader', msg[0].substr(15), msg[1] );
	    }
	    if( msg[0].startsWith('/touchosc/fader') && (!msg[0].endsWith('/color')) ){
		socket.emit('updatefader', msg[0], msg[1] );
	    }
	    if( msg[0].startsWith('/touchosc/level') ){
		socket.emit('updatefader', msg[0], msg[1] );
	    }
	    if( msg[0] == '/peer2peer' ){
		socket.emit('updatep2p', msg[1] );
	    }
	    if( msg[0] == '/duplicates' ){
		socket.emit('updateduplicates', msg[1] );
	    }
	});
	oscClient.send('/touchosc/connect',16);
    });
    socket.on('message', function (obj) {
	oscClient.send(obj);
    });
    socket.on('peer2peer', function (obj) {
	if( obj )
	    oscClientMPLX.send( '/peer2peer',1);
	else
	    oscClientMPLX.send( '/peer2peer',0);
    });
    socket.on('duplicates', function (obj) {
	if( obj )
	    oscClientMPLX.send( '/duplicates',1);
	else
	    oscClientMPLX.send( '/duplicates',0);
    });
    socket.on('msg', function (obj) {
	if( obj.hasOwnProperty('value') && (obj.value != null) ){
	    oscClient.send( obj.path, obj.value );
	}else{
	    oscClient.send( obj.path );
	}
    });
    socket.on('defaultgains', function (obj) {
	fs.unlink('savedgains');
    });
});
