const { MessageActionRow, MessageButton, MessageEmbed } = require('discord.js');
const { adminRole, ticketCategoryID, mongoURI } = require('../config.json');
const { MongoClient } = require('mongodb');

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

  if (args[0] === 'ticket_ac') {
    const ticketChannel = await message.guild.channels.create(`ticket-${message.author.username}`, {
      type: 'GUILD_TEXT',
      topic: `Ticket açıldı: ${message.author.tag} tarafından.`,
      parent: ticketCategoryID,
    });

    const row = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('beklemede')
        .setLabel('Beklemede')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('inceleniyor')
        .setLabel('İnceleniyor')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('cozuldu')
        .setLabel('Çözüldü')
        .setStyle('PRIMARY'),
      new MessageButton()
        .setCustomId('claim_ticket')
        .setLabel('Claim Et')
        .setStyle('SUCCESS')
    );

    await ticketChannel.send({
      content: 'Ticket açıldı! Durumunu seçin.',
      components: [row]
    });

    const feedbackRow = new MessageActionRow().addComponents(
      new MessageButton()
        .setCustomId('feedback_yes')
        .setLabel('Evet, memnun kaldım')
        .setStyle('SUCCESS'),
      new MessageButton()
        .setCustomId('feedback_no')
        .setLabel('Hayır, memnun kalmadım')
        .setStyle('DANGER')
    );

    await ticketChannel.send({
      content: 'Ticketınız çözüldü, geri bildiriminizi alabilir miyiz?',
      components: [feedbackRow]
    });

    const clientMongo = new MongoClient(mongoURI);
    await clientMongo.connect();
    const db = clientMongo.db('ticket_system');
    const settings = db.collection('settings');
    const setting = await settings.findOne({ name: 'ticketChannels' });

    if (!setting || !setting.feedbackChannelId) {
      return message.reply('Feedback kanalı ayarlanmamış.');
    }

    const feedbackChannel = message.guild.channels.cache.get(setting.feedbackChannelId);

    const filter = i => i.user.id === message.author.id;
    const collector = ticketChannel.createMessageComponentCollector({ filter, time: 60000 });

    collector.on('collect', async i => {
      if (i.customId === 'feedback_yes') {
        await i.update({ content: 'Teşekkürler! Ticket için geri bildiriminizi aldık.', components: [] });
        await feedbackChannel.send(`${message.author.tag} ticket çözümünden memnun kaldı.`);
      } else if (i.customId === 'feedback_no') {
        await i.update({ content: 'Üzgünüz! Geri bildiriminiz için teşekkürler.', components: [] });
        await feedbackChannel.send(`${message.author.tag} ticket çözümünden memnun kalmadı.`);
      }
    });
  }
};
