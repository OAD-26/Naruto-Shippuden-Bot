module.exports = {
    name: 'clear',
    description: 'Clear messages or warnings',
    execute: async (sock, from, msg, args) => {
        const jid = from;
        await sock.sendMessage(jid, { text: '✅ Messages/warnings cleared (simulated).' });
    }
};
