module.exports = {
    name: 'antibadword',
    description: 'Turn on/off anti-badword filter',
    execute: async (sock, from, msg, args) => {
        const jid = from;
        const status = text.trim().toLowerCase();
        if (!['on', 'off'].includes(status)) return sock.sendMessage(jid, { text: '❌ Usage: !antibadword <on/off>' });

        await sock.sendMessage(jid, { text: `✅ Anti-badword is now ${status.toUpperCase()}! (simulated)` });
    }
};
