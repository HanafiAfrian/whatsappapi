const { Client , LocalAuth} = require('whatsapp-web.js');
const express = require('express');
const socketIO = require('socket.io');
const qrcode = require('qrcode');
const http = require('http');
const app = express();



const server = http.createServer(app);
const io = socketIO (server);

app.use(express.json());
app.use(express.urlencoded({ extended : true}));






app.get('/send-message', (req, res)=> {
	res.sendFile('send-message.html', {
		root:__dirname
	})
})

app.get('/', (req, res) => {
  res.sendFile('index.html', {root: __dirname});
});

const client = new Client({
    authStrategy: new LocalAuth(),
puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process', // <- this one doesn't works in Windows
      '--disable-gpu'
    ],
  },

});



client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body == '!ping') {
        msg.reply('pong');
    }
});

client.initialize();

// socket connection
var today  = new Date();
var now = today.toLocaleString();
io.on('connection', (socket) => {
  socket.emit('message', `${now} Connected`);

  client.on('qr', (qr) => {
    qrcode.toDataURL(qr, (err, url) => {
      socket.emit("qr", url);
      socket.emit('message', `${now} QR Code received`);
	  
    });
  });

  client.on('ready', () => {
    socket.emit('message', `${now} WhatsApp is ready!`);
  });

  client.on('authenticated', (session) => {
    socket.emit('message', `${now} Whatsapp is authenticated!`);
    sessionCfg = session;
  
  });

  client.on('auth_failure', function(session) {
    socket.emit('message', `${now} Auth failure, restarting...`);
  });

  client.on('disconnected', function() {
    socket.emit('message', `${now} Disconnected`);
   
   
      client.destroy();
      client.initialize();
 
  });
});


//send message
app.post('/send-message', (req,res) => {
	const number = req.body.number;
	const message = req.body.message;
	
client.sendMessage(number+'@c.us', message).then (response => {
	res.status(200).json ({
		status : true,
	response : response
	});
}).catch(err => {
		res.status(500).json  ({
			status:false,
			response : err
		});
	});
});


server.listen(8000, function() {
console.log ('berhasil')
});