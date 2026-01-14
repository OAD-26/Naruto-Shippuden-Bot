const yts = require('yt-search');
const axios = require('axios');

async function playCommand(sock, from, msg, args) {
    try {
        const searchQuery = args.join(' ');
        
        if (!searchQuery) {
            return await sock.sendMessage(from, { 
                text: "🍥 *Kage Bunshin no Jutsu!* 🌀\n\nPlease provide a song name to search, shinobi!"
            });
        }

        // Multi-source search logic
        let searchResults = [];
        
        // 1. Try Spotify via ShizoAPI
        try {
            const spotifyRes = await axios.get(`https://shizoapi.onrender.com/api/search/spotify?apikey=shizo&query=${encodeURIComponent(searchQuery)}`);
            if (spotifyRes.data && spotifyRes.data.result && spotifyRes.data.result.length > 0) {
                searchResults.push(...spotifyRes.data.result.map(r => ({ title: r.title, url: r.url, source: 'Spotify' })));
            }
        } catch (e) {}

        // 2. Try Audiomack via ShizoAPI
        try {
            const audiomackRes = await axios.get(`https://shizoapi.onrender.com/api/search/audiomack?apikey=shizo&query=${encodeURIComponent(searchQuery)}`);
            if (audiomackRes.data && audiomackRes.data.result && audiomackRes.data.result.length > 0) {
                searchResults.push(...audiomackRes.data.result.map(r => ({ title: r.title, url: r.url, source: 'Audiomack' })));
            }
        } catch (e) {}

        // 3. Fallback to YouTube Search
        const { videos } = await yts(searchQuery);
        if (videos && videos.length > 0) {
            searchResults.push(...videos.slice(0, 3).map(v => ({ title: v.title, url: v.url, source: 'YouTube' })));
        }

        if (searchResults.length === 0) {
            return await sock.sendMessage(from, { 
                text: "🚫 *Shadow Clone Jutsu Failed!* 🌀\n\nNo songs found in the Hidden Leaf scrolls (Spotify, Audiomack, or YouTube)!"
            });
        }

        // Send loading message
        const bestResult = searchResults[0];
        await sock.sendMessage(from, {
            text: `🍥 *Wind Style: Rasenshuriken!* 🌀\n\n_Gathering chakra from ${bestResult.source}... your download is in progress!_`
        });

        // Get the best result
        const urlYt = bestResult.url;
        const title = bestResult.title;

        // Send detailed message first
        const infoMessage = `
🍥 *MUSIC SUMMONING SUCCESS!* 🌀
─────────────────────────────
🎵 *Title:* ${title}
👤 *Platform:* ${bestResult.source}
🌐 *Source:* ${urlYt}
⚡ *Status:* Delivering Chakra...
─────────────────────────────
*Believe it!* 🤜🤛`.trim();

        await sock.sendMessage(from, { text: infoMessage }, { quoted: msg });

        // Try multiple APIs for better reliability
        const apis = [
            `https://api.giftedtech.my.id/api/download/dlmp3?url=${urlYt}`,
            `https://apis-keith.vercel.app/download/dlmp3?url=${urlYt}`,
            `https://api.vreden.my.id/api/ytmp3?url=${urlYt}`
        ];

        let audioUrl = null;

        for (const api of apis) {
            try {
                const response = await axios.get(api, { timeout: 15000 });
                const data = response.data;
                
                if (data.status === true || data.success === true || data.status === 200) {
                    audioUrl = data.result?.downloadUrl || data.result?.url || data.result?.download;
                    if (audioUrl) break;
                }
            } catch (err) {
                console.log(`API Failed: ${api}`);
            }
        }

        if (!audioUrl) {
            return await sock.sendMessage(from, { 
                text: "🚫 *Chakra Depleted!* 🌀\n\nFailed to fetch the song from any scroll. Try again later!"
            });
        }

        // Send the audio
        await sock.sendMessage(from, {
            audio: { url: audioUrl },
            mimetype: "audio/mpeg",
            fileName: `${title}.mp3`
        }, { quoted: msg });

    } catch (error) {
        console.error('Error in play command:', error);
        await sock.sendMessage(from, { 
            text: "💥 *Explosion Jutsu!* 🌀\n\nSomething went wrong during the mission. Try again!"
        });
    }
}

module.exports = playCommand;