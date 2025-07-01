client.on('interactionCreate', async (interaction) => {
    if (interaction.type === InteractionType.ModalSubmit && interaction.customId === 'announcementModal') {
        const messageContent = interaction.fields.getTextInputValue('announcementMessage');
        const committeeRole = interaction.guild.roles.cache.find(r => r.name === 'UHC Committee 🚧');
        const targetRole = interaction.guild.roles.cache.find(r => r.name === 'UltraHardCore ⚔️');

        if (!committeeRole || !interaction.member.roles.cache.has(committeeRole.id)) {
            return interaction.reply({ content: 'You are not authorized to do this.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle('📣 Announcement Preview')
            .setDescription(messageContent)
            .setColor(0xfacc15);

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId('confirmAnnouncement')
                .setLabel('✅ Send')
                .setStyle(ButtonStyle.Success),
            new ButtonBuilder()
                .setCustomId('cancelAnnouncement')
                .setLabel('❌ Cancel')
                .setStyle(ButtonStyle.Danger)
        );

        // Save the message content in memory
        interaction.client.pendingAnnouncements ??= {};
        interaction.client.pendingAnnouncements[interaction.user.id] = {
            message: messageContent,
            guildId: interaction.guild.id
        };

        await interaction.reply({ embeds: [embed], components: [row], ephemeral: true });
    }

    // Handle button presses
    if (interaction.isButton()) {
        const { customId, user } = interaction;

        const data = interaction.client.pendingAnnouncements?.[user.id];
        if (!data) return interaction.reply({ content: 'No message found to send.', ephemeral: true });

        if (customId === 'cancelAnnouncement') {
            delete interaction.client.pendingAnnouncements[user.id];
            return interaction.update({ content: '❌ Announcement cancelled.', components: [], embeds: [] });
        }

        if (customId === 'confirmAnnouncement') {
            const guild = client.guilds.cache.get(data.guildId);
            const role = guild.roles.cache.find(r => r.name === 'UltraHardCore ⚔️');

            if (!role) {
                return interaction.update({ content: '⚠️ Role not found.', components: [], embeds: [] });
            }

            let success = 0, failed = 0;
            for (const member of role.members.values()) {
                try {
                    await member.send(data.message);
                    success++;
                } catch {
                    failed++;
                }
            }

            delete interaction.client.pendingAnnouncements[user.id];

            return interaction.update({
                content: `✅ Sent to ${success} member(s). ❌ Failed for ${failed}.`,
                components: [],
                embeds: []
            });
        }
    }
});
