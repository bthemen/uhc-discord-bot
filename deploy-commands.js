// deploy-commands.js
import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
    new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),

    new SlashCommandBuilder()
        .setName('voice')
        .setDescription('Bot joins your voice channel'),

    new SlashCommandBuilder()
        .setName('voice-channel')
        .setDescription('Set the default voice channel for the bot')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The voice channel to set as default')
                .setRequired(true)
        ),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN);

try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
        Routes.applicationGuildCommands(
            process.env.CLIENT_ID,
            process.env.GUILD_ID
        ),
        { body: commands }
    );

    console.log('Successfully reloaded application (/) commands.');
} catch (error) {
    console.error(error);
}
