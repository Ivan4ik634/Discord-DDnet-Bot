const { Client, GatewayIntentBits } = require('discord.js');

const translateAPI = require('@vitalets/google-translate-api');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

// ===== Перевод =====
async function translate(text, lang) {
  try {
    const res = await translateAPI.translate(text, { to: lang });
    return res.text;
  } catch (e) {
    console.error('Translate error:', e);
    return null;
  }
}

client.once('clientReady', () => {
  console.log(`🤖 Logged in as ${client.user.tag}`);
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  // /tr
  if (commandName === 'tr') {
    const lang = interaction.options.getString('lang');
    const text = interaction.options.getString('text');

    const translated = await translate(text, lang);
    if (!translated) {
      return interaction.reply({ content: 'Translation error', ephemeral: true });
    }

    const thread = await interaction.channel.threads.create({
      name: `Translation (${lang})`,
      autoArchiveDuration: 60,
    });

    await thread.send(`**Original:**\n${text}\n\n**Translation:**\n${translated}`);

    return interaction.reply({
      content: 'Translation created in thread',
      ephemeral: true,
    });
  }

  // /tl
  if (commandName === 'tl') {
    const lang = interaction.options.getString('lang');

    const msg = interaction.channel.lastMessage;
    if (!msg || !msg.content) {
      return interaction.reply({
        content: 'There is no message to translate.',
        ephemeral: true,
      });
    }

    const translated = await translate(msg.content, lang);
    if (!translated) {
      return interaction.reply({ content: 'Translation error', ephemeral: true });
    }

    const thread = await msg.startThread({
      name: `Translation (${lang})`,
      autoArchiveDuration: 60,
    });

    await thread.send(`**Translation:**\n${translated}`);

    return interaction.reply({
      content: 'Translation created in thread',
      ephemeral: true,
    });
  }
});

// ===== Реакции 🇺🇦 🇷🇺 🇬🇧 =====
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;
  if (reaction.partial) await reaction.fetch();

  const map = {
    '🇺🇦': 'uk',
    '🇷🇺': 'ru',
    '🇬🇧': 'en',
  };

  const lang = map[reaction.emoji.name];
  if (!lang) return;

  const message = reaction.message;
  if (!message.content) return;

  const translated = await translate(message.content, lang);
  if (!translated) return;

  const thread = await message.startThread({
    name: `Translation (${lang})`,
    autoArchiveDuration: 60,
  });

  await thread.send(`${translated}`);
});

client.login(process.env.DICKORD_TOKEN);
