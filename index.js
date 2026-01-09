const { Client, GatewayIntentBits } = require('discord.js');
const translateAPI = require('@vitalets/google-translate-api');
const { registerCommands } = require('./deploy-commands');
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
registerCommands();
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'tr') {
    const lang = interaction.options.getString('lang');
    const text = interaction.options.getString('text');

    const translated = await translate(text, lang);
    if (!translated) {
      return interaction.reply({ content: 'Translation error', ephemeral: true });
    }

    return interaction.reply({
      content: `${translated}`,
      ephemeral: true,
    });
  }
});

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

  await message.reply({
    content: `${translated}`,
    allowedMentions: { repliedUser: false },
  });
});

client.login(process.env.DICKORD_TOKEN);
