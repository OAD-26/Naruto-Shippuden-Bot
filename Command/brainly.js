module.exports = async (sock, from, msg, args) => {
    await sock.sendMessage(from, { text: "🍥 *ACADEMY STUDY JUTSU* 🌀\n─────────────────────────────\n📚 *Topic:* ${args.join(' ') || 'General Knowledge'}\n\n*The Academy library is currently being reorganized. Please check back later!* 🍃" });
};
