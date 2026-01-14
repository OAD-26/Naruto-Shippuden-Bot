const fetch = require('node-fetch');

async function(sock, from, msg, args) {
    try {
        
        const res = await fetch(`https://api.princetechn.com/api/fun/roseday?apikey=prince`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const rosedayMessage = json.result;

        // Send the roseday message
        await sock.sendMessage(from, { text: rosedayMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error in roseday command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get roseday quote. Please try again later!' }, { quoted: msg });
    }
}

module.exports = { rosedayCommand };
