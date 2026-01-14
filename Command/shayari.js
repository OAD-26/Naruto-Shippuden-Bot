const fetch = require('node-fetch');

async function shayariCommand(sock, from, msg, args) {
    try {
        const response = await fetch('https://shizoapi.onrender.com/api/texts/shayari?apikey=shizo');
        const data = await response.json();
        
        if (!data || !data.result) {
            throw new Error('Invalid response from API');
        }

        const buttons = [
            { buttonId: '.shayari', buttonText: { displayText: 'Shayari 🪄' }, type: 1 },
            { buttonId: '.roseday', buttonText: { displayText: '🌹 RoseDay' }, type: 1 }
        ];

        await sock.sendMessage(from, { 
            text: data.result,
            buttons: buttons,
            headerType: 1
        }, { quoted: msg });
    } catch (error) {
        console.error('Error in shayari command:', error);
        await sock.sendMessage(from, { 
            text: '❌ Failed to fetch shayari. Please try again later.',
        }, { quoted: msg });
    }
}

module.exports = { shayariCommand }; 