import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, GuildTextBasedChannel } from "discord.js";
import { ExtendedClient } from "../client/Client";
import { Event } from "../structures/Event";
import { MigratePrismaUser } from "./interactionCreate";
import moment from "moment";

type RiskLevel = 'Low' | 'Medium' | 'High' | 'Extreme'

export default new Event("guildMemberAdd", async (client: ExtendedClient, member: GuildMember) => {
    const guildConfig = client.guildConfig.get(member.guild.id);
    // add user to db
    await MigratePrismaUser(member.user);
    if (!guildConfig) return;

    const guildRoles = member.guild.roles.cache;
    const assignedRole = member.user.bot ?
        guildRoles.get(guildConfig.botRole) :
        guildRoles.get(guildConfig.memberRole)

    if (!assignedRole) return;

    const errors: string[] = [];

    await member.roles.add(assignedRole).catch(() => {
        errors.push("Failed due to role hierarchy");
    });

    const logChannel = (await member.guild.channels.fetch()).get(guildConfig.logChannel) as GuildTextBasedChannel;
    if (!logChannel) return;

    const embed = new EmbedBuilder();
    embed.setColor("#74e21e");
    let risk: RiskLevel = "Low";

    const accountCreation = member.user.createdTimestamp / 1000;
    const joiningTime = member.joinedTimestamp as number / 1000;

    const monthsAgo = moment().subtract(2, "months").unix();
    const weeksAgo = moment().subtract(2, "weeks").unix();
    const daysAgo = moment().subtract(2, "days").unix();

    if (accountCreation >= monthsAgo) {
        embed.setColor("#e2bb1e");
        risk = "Medium";
    } else if (accountCreation >= weeksAgo) {
        embed.setColor("#e24d1e");
        risk = "High"
    } else if (accountCreation >= daysAgo) {
        embed.setColor("#e21e1e");
        risk = "Extreme"
    }
    
    embed
        .setAuthor({ name: `${member.user.tag} | ${member.id}`, iconURL: member.displayAvatarURL({ forceStatic: false }) })
        .setThumbnail(member.user.displayAvatarURL({ forceStatic: false, size: 256 }))
        .setDescription([
            `• User: ${member.user}`,
            `• Account Type: ${member.user.bot ? "Bot" : "User"}`,
            `• Role Assigned: ${assignedRole}`,
            `• Risk Level: ${risk.toString()}\n`,
            `• Account Created: <t:${Math.round(accountCreation)}:D> | <t:${Math.round(accountCreation)}:R>`,
            `• Account Joined: <t:${Math.round(joiningTime)}:D> | <t:${Math.round(joiningTime)}:R>`
        ].join("\n"))
        .setFooter({ text: "Joined" })
        .setTimestamp();

        if (risk == "Extreme" || risk == "High") {
            const buttons = new ActionRowBuilder<ButtonBuilder>()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`MemberLogging-Kick-${member.id}`)
                        .setLabel("Kick")
                        .setStyle(ButtonStyle.Danger),

                    new ButtonBuilder()
                        .setCustomId(`MemberLogging-Ban-${member.id}`)
                        .setLabel("Ban")
                        .setStyle(ButtonStyle.Danger)
                )

            return logChannel.send({ embeds: [embed], components: [buttons] })
        } else return logChannel.send({ embeds: [embed] })
});