const fetch = require('node-fetch');

async function(sock, from, msg, args) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/flirt?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const flirtMessage = json.result;

        // Send the flirt message
        await sock.sendMessage(from, { text: flirtMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error in flirt command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get flirt message. Please try again later!' }, { quoted: msg });
    }
}

module.exports = { flirtCommand }; 