const net = require('net');
const { Readable } = require('stream');
const { Writable } = require('stream');

const server = net.createServer();


server.on('connection', (socket) => {
	console.log('Client Connected');
	
	socket.setEncoding('utf8');

	let isServerConnected  = false, serverSocket;
	socket.on('data', (data) => {

		let portNumber = 80;

		if(!isServerConnected) {

			if(!data.indexOf("Host") === -1) {
				//Wrong type of packet Send proper html page for wrong packet
				socket.end("Wrong request\n");
			}

			

			console.log(data);
			
			//Make a new Connection with the the original server
			serverSocket = net.createConnection({
				port: portNumber,
				host: data.split("Host: ")[1].split("\r\n")[0]
			}, () => {
				isServerConnected = true;
			});

		}
		
		
		setTimeout(() => {
			serverSocket.write(data);
			serverSocket.pipe(socket);
		}, 0);
		


	});

	socket.on('end', () => {
		console.log('after fin');
		serverSocket.end();
	})

});

server.on('error', (err) => {
	console.log(err);
	throw err
});

server.on('close', () => {
	console.log('CLient Disconnected');
	
});

server.listen( 8124, () => {
  console.log('Server runnig at http://localhost:' + 8124);
});
