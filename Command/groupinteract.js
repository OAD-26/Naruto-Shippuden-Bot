
module.exports = async (sock, from, msg, args) => {
  const groupId = from;
  if(!groupId.endsWith("@g.us")) return sock.sendMessage(from,{text:"🚫 This command works only in groups!"});
  const groupMeta = await sock.groupMetadata(groupId);
  const admins = groupMeta.participants.filter(p=>p.admin).map(p=>p.id.split("@")[0]);
  const status = args[0] && args[0].toLowerCase() === "on";
  require('../index.js').settings.groupInteraction[groupId] = status;
  await sock.sendMessage(from,{
    text: `🍥 Bot Interactions ${status?"Allowed":"Disabled"} in *${groupMeta.subject}* 🌀\nAdmins: ${admins.join(", ")}`
  });
};
    