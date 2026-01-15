const axios = require('axios');

module.exports = async function (sock, from, msg, args) {
    try {
        const response = await axios.get('https://icanhazdadjoke.com/', {
            headers: { Accept: 'application/json' }
        });
        const joke = response.data.joke;
        
        const jokeMessage = `
🍥 *JIRAIYA'S COMEDY JUTSU!* 🐸
─────────────────────────────
${joke}
─────────────────────────────
*Believe it!* 🌀`.trim();

        await sock.sendMessage(from, { text: jokeMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error fetching joke:', error);
        await sock.sendMessage(from, { text: '🚫 *Chakra Interruption!* Could not fetch a joke right now.' }, { quoted: msg });
    }
};
