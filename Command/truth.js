const fetch = require('node-fetch');

async function(sock, from, msg, args) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/truth?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const truthMessage = json.result;

        // Send the truth message
        await sock.sendMessage(from, { text: truthMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error in truth command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get truth. Please try again later!' }, { quoted: msg });
    }
}

module.exports = { truthCommand };
