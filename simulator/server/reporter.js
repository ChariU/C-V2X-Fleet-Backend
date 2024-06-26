const {
	setLatitude,
	setLongitude,
	sendNewReport,
} = require('../../Report/report.js');

const { exat_route } = require('./static/exat_route.js');
const { chula_route } = require('./static/chula_route.js');
const { randomElement, addLocNoise } = require('./utils.js');

let location_route = null;

process.on('message', (message) => {
	const { type, value } = message;
	console.log('Message from parent for reporter:', type, value);
	switch (type) {
		case 'location':
			if (location_route) {
				clear_route();
			}
			if (value === 'exat') {
				change_route('exat', exat_route);
			}
			if (value === 'chula') {
				change_route('chula', chula_route);
			}
			break;
		case 'incident':
			if (location_route === 'exat') {
				const { latitude, longitude } = randomElement(exat_route);
				const noise = addLocNoise(latitude, longitude);
				setLatitude(noise.latitude);
				setLongitude(noise.longitude);
			}
			if (location_route === 'chula') {
				const { latitude, longitude } = randomElement(chula_route);
				const noise = addLocNoise(latitude, longitude);
				setLatitude(noise.latitude);
				setLongitude(noise.longitude);
			} else {
				console.error('Invalid location:', value);
				return;
			}
			sendNewReport(value);
			break;
	}
});

function change_route(route_name, position_route) {
	location_route = route_name;
	const { latitude, longitude } = randomElement(position_route);
	setLatitude(latitude);
	setLongitude(longitude);
}

function clear_route() {
	location_route = null;
	console.log('Cleared previous route');
}
