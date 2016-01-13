require('dotenv').load();

var express = require('express')
	, bodyParser = require('body-parser')
	, app = express()
	, http = require('http').Server(app)
	, io = require('socket.io')(http)
	, PORT = process.env.PORT || 3333
	, request = require('request')
	
	, sockets = {}
	
	;

app.use(bodyParser.json());

app.get('/', function(req, res){
	res.sendFile(__dirname + '/app.html');
});

// accept get or post from external response
app.all('/webhook-response', function(req, res){
	if (req.query && req.query.token) {
		if (sockets[req.query.token]) {
			sockets[req.query.token].emit('webhook-response', { response: req.body || { error: 'empty response from server/api' } });
			res.send({ status: 'ok', from: 'webhook-response' });
		} else {
			res.send({ error: 'no socket found for the token: ' + req.query.token});
		}
	} else {
		res.send({ error: 'no token for the webhook response' });
	}
});

app.all('/sanity-check', function(req, res) {
	if (req.query && req.query.token) {
		if (sockets[req.query.token]) {
			res.send({ status: 'ok', from: 'sanity-check' });
			// mimic delay
			setTimeout(function() { sockets[req.query.token].emit('sanity-webhook-response', { response: 'sanity check loop, data: '+JSON.stringify(req.body) }); }, 1000);
		} else {
			res.send({ error: 'no socket found for the token: ' + req.query.token});
		}
	} else {
		res.send({ error: 'no token for the webhook response' });
	}
});

// set up websocket for communication to the "app" (app.html)
io.on('connection', function(socket){
	socket.webhook_token = Math.random();
	add_socket_to_pool(socket);
	socket.emit('token', socket.webhook_token);

	// log the connection:
	console.log('a user connected, token: '+socket.webhook_token);

	socket.on('api-send', function(data) {
		if (data && data.sendBody && data.sendURL) {
			var method = data.method.toLowerCase() || 'post';
			if (!request[method]) {
				return socket.emit('api-send-response', { error: 'unsupported call method: ' + method });
			}

			// set up request object:
			var caller = request[method]
				, callObj = {
					url: data.sendURL,
					json: true
				}
				;
			
			// attach send data according to request method
			switch (method) {
				case 'get':
					callObj.qs = data.sendBody;
					break;
				case 'post':
					callObj.body = data.sendBody;
					break;
			}

			// make request:
			caller(callObj, function(err, response, body) {
				if (err || body.error) socket.emit('api-send-response', { error: err || body.error });
				else {
					//console.log('ok what is response body?');
					//console.log({ response: body });
					socket.emit('api-send-response', { response: body });
				}
			});
		} else {
			return socket.emit('api-send-response', { error: 'missing required parameters, please fill in the form completely' });
		}
	});
	socket.on('disconnect', function() {
		// log the disconnection:
		console.log('a user DISconnected, token: '+socket.webhook_token);
		remove_from_socket_pool(socket.webhook_token);
	});
});

http.listen(PORT, function(){
	console.log('webhook tester listening on *:' + PORT);
});





function add_socket_to_pool(socket) {
	if (socket.webhook_token) {
		sockets[socket.webhook_token] = socket;
	}
}

function remove_from_socket_pool(socket) {
	if (socket.webhook_token && sockets[socket.webhook_token]) {
		delete sockets[socket.webhook_token];
	}
}

function respond_to_socket(token, data) {
	if (token && sockets[token]) {
		sockets[token].emit('webhook-response', data);
	}
}

