const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { adminRole, ticketCategoryID } = require('../config.json');

module.exports = async (message, args, client) => {
  if (args[0] === 'kur' && message.member.roles.cache.some(role => role.name === adminRole)) {
    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('ticket_ac')
        .setLabel('Ticket Aç')
        .setStyle('PRIMARY')
    );

    await message.channel.send({
      content: 'Ticket açmak için butona tıklayın!',
      components: [row]
    });
  }
};
