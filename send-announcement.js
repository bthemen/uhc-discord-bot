import {
    SlashCommandBuilder,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    ActionRowBuilder,
    InteractionType,
    ButtonBuilder,
    ButtonStyle,
    ComponentType,
    EmbedBuilder
} from 'discord.js';

export const data = new SlashCommandBuilder()
    .setName('send-announcement')
    .setDescription('Send a DM to all UltraHardCore members (committee only)');

export async function execute(interaction) {
    const committeeRole = interaction.guild.roles.cache.find(role => role.name === 'UHC Committee 🚧');

    if (!committeeRole || !interaction.member.roles.cache.has(committeeRole.id)) {
        return interaction.reply({
            content: '❌ You do not have permission to use this command.',
            ephemeral: true
        });
    }

    // Show modal
    const modal = new ModalBuilder()
        .setCustomId('announcementModal')
        .setTitle('Send Announcement');

    const messageInput = new TextInputBuilder()
        .setCustomId('announcementMessage')
        .setLabel('Message to send')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const row = new ActionRowBuilder().addComponents(messageInput);
    modal.addComponents(row);

    await interaction.showModal(modal);
}
