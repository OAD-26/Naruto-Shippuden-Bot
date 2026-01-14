const fetch = require('node-fetch');

async function(sock, from, msg, args) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/dare?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const dareMessage = json.result;

        // Send the dare message
        await sock.sendMessage(from, { text: dareMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error in dare command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get dare. Please try again later!' }, { quoted: msg });
    }
}

module.exports = { dareCommand };
