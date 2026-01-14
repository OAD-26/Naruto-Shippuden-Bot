const axios = require('axios');

module.exports = async function(sock, from, msg, args) {
    try {
        const response = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
        const fact = response.data.text;
        await sock.sendMessage(from, { text: fact },{ quoted: msg });
    } catch (error) {
        console.error('Error fetching fact:', error);
        await sock.sendMessage(from, { text: 'Sorry, I could not fetch a fact right now.' },{ quoted: msg });
    }
};
