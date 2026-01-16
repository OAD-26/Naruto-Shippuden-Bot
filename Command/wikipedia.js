const axios = require('axios');
module.exports = async (sock, from, msg, args) => {
    const query = args.join(' ');
    if (!query) return sock.sendMessage(from, { text: "🍥 *Byakugan!* 🌀 Please provide a topic to search in the Great Library!" });
    try {
        const res = await axios.get(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
        const text = `🍥 *GREAT LIBRARY OF KONOHA* 🌀\n─────────────────────────────\n📖 *Topic:* ${res.data.title}\n\n${res.data.extract}\n─────────────────────────────\n*Knowledge is power!* ⚡`;
        await sock.sendMessage(from, { text });
    } catch {
        await sock.sendMessage(from, { text: "🚫 *Scroll Not Found!* That topic is not in our archives." });
    }
};
