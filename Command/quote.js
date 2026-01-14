const fetch = require('node-fetch');

module.exports = async function(sock, from, msg, args) {
    try {
        const shizokeys = 'shizo';
        const res = await fetch(`https://shizoapi.onrender.com/api/texts/quotes?apikey=${shizokeys}`);
        
        if (!res.ok) {
            throw await res.text();
        }
        
        const json = await res.json();
        const quoteMessage = json.result;

        // Send the quote message
        await sock.sendMessage(from, { text: quoteMessage }, { quoted: msg });
    } catch (error) {
        console.error('Error in quote command:', error);
        await sock.sendMessage(from, { text: '❌ Failed to get quote. Please try again later!' }, { quoted: msg });
    }
};
