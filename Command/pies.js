const fetch = require('node-fetch');

const BASE = 'https://shizoapi.onrender.com/api/pies';
const VALID_COUNTRIES = ['china', 'indonesia', 'japan', 'korea', 'hijab'];

async function fetchPiesImageBuffer(country) {
	const url = `${BASE}/${country}?apikey=shizo`;
	const res = await fetch(url);
	if (!res.ok) throw new Error(`HTTP ${res.status}`);
	const contentType = res.headers.get('content-type') || '';
	if (!contentType.includes('image')) throw new Error('API did not return an image');
	return res.buffer();
}

async function piesCommand(sock, from, msg, args) {
	const sub = (args && args[0] ? args[0] : '').toLowerCase();
	if (!sub) {
		await sock.sendMessage(from, { text: `Usage: .pies <country>\nCountries: ${VALID_COUNTRIES.join(', ')}` }, { quoted: msg });
		return;
	}
	if (!VALID_COUNTRIES.includes(sub)) {
		await sock.sendMessage(from, { text: `❌ Unsupported country: ${sub}. Try one of: ${VALID_COUNTRIES.join(', ')}` }, { quoted: msg });
		return;
	}
	try {
		const imageBuffer = await fetchPiesImageBuffer(sub);
		await sock.sendMessage(
			chatId,
			{ image: imageBuffer, caption: `pies: ${sub}` },
			{ quoted: msg }
		);
	} catch (err) {
		console.error('Error in pies command:', err);
		await sock.sendMessage(from, { text: '❌ Failed to fetch image. Please try again.' }, { quoted: msg });
	}
}

async function piesAlias(sock, chatId, message, country) {
	try {
		const imageBuffer = await fetchPiesImageBuffer(country);
		await sock.sendMessage(
			chatId,
			{ image: imageBuffer, caption: `pies: ${country}` },
			{ quoted: msg }
		);
	} catch (err) {
		console.error(`Error in pies alias (${country}) command:`, err);
		await sock.sendMessage(from, { text: '❌ Failed to fetch image. Please try again.' }, { quoted: msg });
	}
}

module.exports = { piesCommand, piesAlias, VALID_COUNTRIES };
