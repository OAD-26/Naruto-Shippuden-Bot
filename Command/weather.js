const axios = require('axios');

module.exports = async function (sock, from, msg, args) {
    try {
        const city = args.join(' ');
        if (!city) return await sock.sendMessage(from, { text: "🍥 *Byakugan!* 🌀\nPlease provide a village name to check the weather!" }, { quoted: msg });

        const apiKey = '4902c0f2550f58298ad4146a92b65e10'; 
        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`);
        const weather = response.data;
        
        const weatherText = `
🍥 *VILLAGE WEATHER SCROLL* 🌀
─────────────────────────────
🏘️ *Village:* ${weather.name}
🌡️ *Temperature:* ${weather.main.temp}°C
☁️ *Condition:* ${weather.weather[0].description}
💧 *Humidity:* ${weather.main.humidity}%
🌬️ *Wind Speed:* ${weather.wind.speed} m/s
─────────────────────────────
*The skies of Konoha are clear!* 🍃`.trim();

        await sock.sendMessage(from, { text: weatherText }, { quoted: msg });
    } catch (error) {
        console.error('Error fetching weather:', error);
        await sock.sendMessage(from, { text: '🚫 *Great Vortex Jutsu!* Could not fetch the weather for that village.' }, { quoted: msg });
    }
};
