import dotenv from "dotenv";
dotenv.config();

import { Client, GatewayIntentBits, Events } from "discord.js";

import { joinVoiceChannel } from '@discordjs/voice';

const defaultVoiceChannels = new Map(); // key: guild.id, value: channel.id

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.DirectMessages
    ],
});

client.once(Events.ClientReady, () => {
    console.log(`Bot is online as ${client.user.tag}`);
});

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const { commandName, guild, member } = interaction;

    if (interaction.commandName === 'ping') {
        await interaction.reply('Pong! 🏓');
    }

    if (commandName === 'voice') {
        let voiceChannel;

        // Try to get default channel first
        const defaultChannelId = defaultVoiceChannels.get(guild.id);

        if (defaultChannelId) {
            voiceChannel = guild.channels.cache.get(defaultChannelId);
        }

        // If no default, fallback to user's voice channel
        if (!voiceChannel) {
            voiceChannel = member.voice.channel;
        }

        if (!voiceChannel) {
            await interaction.reply('You must be in a voice channel or set a default voice channel first!');
            return;
        }

        joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: guild.id,
            adapterCreator: guild.voiceAdapterCreator,
            selfDeaf: false,
        });

        await interaction.reply(`Joined voice channel: ${voiceChannel.name}`);
    }

    if (commandName === 'voice-channel') {
        // Get channel option
        const channel = interaction.options.getChannel('channel');

        // Check if it's a voice channel
        if (channel.type !== 2) { // 2 is 'GUILD_VOICE' in Discord.js v14
            await interaction.reply('Please select a **voice** channel!');
            return;
        }

        // Save default voice channel for this guild
        defaultVoiceChannels.set(guild.id, channel.id);

        await interaction.reply(`Default voice channel set to: ${channel.name}`);
    }
});

client.login(process.env.DISCORD_TOKEN);
