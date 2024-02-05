// RSU

// RabbitMQ
const Producer = require('../RabbitMQ/producer');
const Consumer = require('../RabbitMQ/consumer');

// other libs
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');

// init server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
	transports: ['websocket', 'polling'],
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
	allowEIO3: true,
});

// mock
const port = process.argv[2];
const id = process.argv[3];

let isActive = true;
const connectedCarId = new Map();

let recSpeed;
// gonna get from somewhere
let latitude;
let longitude;

// RabbitMQ parameter
const heartbeatKey = 'heartbeat_rsu';
const locationKey = 'location_rsu';
const recSpeedKey = `recommend_speed_rsu_${id}`;
const recSpeedQueue = `queue_${recSpeedKey}`;

const updateRecSpeed = (msg) => {
	let newRecSpeed = msg['velocity'];
	recSpeed = newRecSpeed;
	console.log(`new rec speed = ${recSpeed} km/h`);
};

// RabbitMQ
const producer = Producer();
producer.connect();

const consumer = Consumer(recSpeedQueue, recSpeedKey, updateRecSpeed);

// socket
io.on('connection', async (socket) => {
	socket.on('car id', (message) => {
		// console.log('receive car id:', message);
		connectedCarId.set(socket.id, message['id']);
	});

	socket.on('incident report', (message) => {
		message['rsu_id'] = id;
		socket.broadcast.emit('incident report', message);
	});

	socket.on('disconnect', () => {
		connectedCarId.delete(socket.id);
	});
});

const emitRecSpeed = setInterval(() => {
	io.emit('recommend speed', {
		rsu_id: id,
		recommend_speed: recSpeed,
		unit: 'km/h',
		timestamp: Date(),
	});
	// console.log('emit rec speed');
}, 1000);

// emit location via socket and RabbitMQ
const emitRSULocation = setInterval(() => {
	message = {
		type: 'RSU',
		id: id,
		latitude: latitude,
		longitude: longitude,
		timestamp: Date(),
	};
	io.emit('rsu location', message);
	// console.log('produce location');
	producer.publish(locationKey, JSON.stringify(message));
}, 1000);

const produceHeartbeat = setInterval(() => {
	message = {
		type: 'RSU',
		id: id,
		data: {
			status: isActive ? 'ACTIVE' : 'INACTIVE',
			connected_OBU: [...connectedCarId.values()],
		},
		timestamp: Date(),
	};
	producer.publish(heartbeatKey, JSON.stringify(message));
	// console.log('produce heartbeat');
}, 1000);

httpServer.listen(port, () => {
	console.log(`server running at http://localhost:${port}`);
});

process.on('unhandledRejection', (err, promise) => {
	console.error(`Unhandled Rejection: ${err}`);
	process.exit(1);
});
