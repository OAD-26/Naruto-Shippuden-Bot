const fetch = require('node-fetch');

async function goodnightCommand(sock, from, msg, args) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/lovenight?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const goodnightMessage = json.result;

        // Send the goodnight message
        await sock.sendMessage(from, { text: goodnightMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error in goodnight command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get goodnight message. Please try again later!' }, { quoted: msg });
    }
}

module.exports = { goodnightCommand }; 