require('dotenv').config(); // чтобы переменные окружения работали
const { REST, Routes, SlashCommandBuilder } = require('discord.js');

// ⚡ Сами команды
const commands = [
  new SlashCommandBuilder()
    .setName('tr')
    .setDescription('Translate text')
    .addStringOption((opt) =>
      opt
        .setName('lang')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: 'Russian', value: 'ru' },
          { name: 'English', value: 'en' },
          { name: 'Ukrainian', value: 'uk' },
        ),
    )
    .addStringOption((opt) =>
      opt.setName('text').setDescription('Text to translate').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('tl')
    .setDescription('Translate replied message')
    .addStringOption((opt) =>
      opt
        .setName('lang')
        .setDescription('Target language')
        .setRequired(true)
        .addChoices(
          { name: 'Russian', value: 'ru' },
          { name: 'English', value: 'en' },
          { name: 'Ukrainian', value: 'uk' },
        ),
    ),
].map((c) => c.toJSON());

// ⚡ Функция регистрации команд
async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DICKORD_TOKEN);

  try {
    await rest.put(Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID), {
      body: commands,
    });
    console.log('✅ Slash commands registered');
  } catch (e) {
    console.error('❌ Failed to register commands:', e);
  }
}

// ⚡ Экспортируем функцию, чтобы index.js мог её вызывать
module.exports = { registerCommands };
