const net = require('net');

const server = net.createServer();

let timeStart = new Date().getTime();
server.on('connection', (clientToProxySocket) => {
  console.log('CLIENT TO PROXY SET UP');
  let proxyToServerSocket;
  clientToProxySocket.once('data', (data) => {
    console.log(data.toString());

    let isTLSConnection = data.toString().indexOf('CONNECT') !== -1;

    // By Default port is 80
    let serverPort = 80;
    let serverAddress;
    if (isTLSConnection) {
      // Port changed if connection is TLS
      serverPort = 443;
      serverAddress = data.toString().split('CONNECT ')[1].split(' ')[0].split(':')[0];
    } else {
      serverAddress = data.toString().split('Host: ')[1].split('\r\n')[0];
    }

    console.log(serverAddress);

    proxyToServerSocket = net.createConnection({
      host: serverAddress,
      port: serverPort
    }, () => {
      console.log('PROXY TO SERVER SET UP');

      // let isProxyServerConnected = true;
      if (isTLSConnection) {
        clientToProxySocket.write('HTTP/1.1 200 OK\r\n\n');
      } else {
        proxyToServerSocket.write(data);
      }
    });

    // proxyToServerSocket.on('data', (data) => {
    //   clientToProxySocket.write(data);
    // });
    // clientToProxySocket.on()
    proxyToServerSocket.pipe(clientToProxySocket);
    clientToProxySocket.pipe(proxyToServerSocket);

    clientToProxySocket.on('end', () => {
      proxyToServerSocket.end();
    });
    clientToProxySocket.on('error', err => {
      console.log('CLIENT TO PROXY ERROR');
      console.log(new Date().getTime() - timeStart);
      console.log(err);
      // throw err
    });

    proxyToServerSocket.on('end', () => {
      clientToProxySocket.end();
    });

    proxyToServerSocket.on('error', (err) => {
      console.log('PROXY TO SERVER ERROR');
      console.log(err);
      // throw err
    });
  });
});

server.on('error', (err) => {
  console.log('SERVER ERROR');
  console.log(err);
  throw err;
});

server.on('close', () => {
  console.log('CLient Disconnected');
});

server.listen(8124, () => {
  console.log('Server runnig at http://localhost:' + 8124);
});
