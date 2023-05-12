import { EmbedBuilder, GuildMember, GuildTextBasedChannel, PartialGuildMember } from "discord.js";
import { ExtendedClient } from "../client/Client";
import { Event } from "../structures/Event";

export default new Event("guildMemberRemove", async (client: ExtendedClient, member: GuildMember | PartialGuildMember) => {
    const guildConfig = client.guildConfig.get(member.guild.id);
    if (!guildConfig) return;

    const logChannel = (await member.guild.channels.fetch()).get(guildConfig.logChannel) as GuildTextBasedChannel;
    if (!logChannel) return;
    
    const accountCreation = member.user.createdTimestamp / 1000;

    const embed = new EmbedBuilder()
        .setAuthor({ name: `${member.user.tag} | ${member.id}`, iconURL: member.displayAvatarURL({ forceStatic: false }) })
        .setThumbnail(member.user.displayAvatarURL({ forceStatic: false, size: 256 }))
        .setDescription([
            `• User: ${member.user}`,
            `• Account Type: ${member.user.bot ? "Bot" : "User"}`,
            `• Account Created: <t:${Math.round(accountCreation)}:D> | <t:${Math.round(accountCreation)}:R>`,
        ].join("\n"))
        .setFooter({ text: "Left" })
        .setTimestamp();

    logChannel.send({ embeds: [embed] })
});