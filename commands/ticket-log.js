const { MessageEmbed } = require('discord.js');
const { adminRole, mongoURI } = require('../config.json');
const { MongoClient } = require('mongodb');

module.exports = async (message, args, client) => {
  if (args[0] === 'kur' && message.member.roles.cache.some(role => role.name === adminRole)) {
    const logChannel = message.mentions.channels.first();
    const feedbackChannel = message.mentions.channels.last();

    if (!logChannel || !feedbackChannel) {
      return message.reply('Lütfen her iki kanal da belirtin: /ticket-kur <log kanalını> <feedback kanalını>');
    }

    const clientMongo = new MongoClient(mongoURI);
    await clientMongo.connect();
    const db = clientMongo.db('ticket_system');
    const settings = db.collection('settings');

    await settings.updateOne(
      { name: 'ticketChannels' },
      { $set: { logChannelId: logChannel.id, feedbackChannelId: feedbackChannel.id } },
      { upsert: true }
    );

    message.channel.send(`Ticket log kanalı başarıyla ${logChannel} olarak ayarlandı. Feedback kanalı da ${feedbackChannel} olarak ayarlandı.`);
  }
};
