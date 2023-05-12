import ms from 'ms';
import { CacheType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, GuildMemberRoleManager, PermissionFlagsBits, SlashCommandBuilder, time } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";
import prisma from '../../prisma';
import { MigratePrismaUser } from '../../events/interactionCreate';

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName("timeout")
                .setDescription("restrict a member's ability to speak")
                .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers || PermissionFlagsBits.MuteMembers)
                .setDMPermission(false)
                .addUserOption((option) => option
                    .setName("target")
                    .setDescription("select a member")
                    .setRequired(true)
                )
                .addStringOption((option) => option
                    .setName("duration")
                    .setDescription("timeout duration (30m, 1h, 1 day)")
                    .setRequired(true)
                )
                .addStringOption((option) => option
                    .setName("reason")
                    .setDescription("reason for the timeout")
                    .setMinLength(5)
                    .setMaxLength(1024)
                    .setRequired(true)
                )
        })
    }

    public async run(client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const { options, guild } = interaction;
        const member = interaction.member as GuildMember

        const target = options.getMember("target") as GuildMember;
        const duration = options.getString("duration", true);
        const reason = options.getString("reason", true);

        const errorsArray: string[] = [];

        const errorsEmbed = new EmbedBuilder()
            .setAuthor({ name: "Could not timeout member due to" })
            .setColor("Red");

        if (!target) {
            interaction.reply({
                embeds: [errorsEmbed.setDescription("Huh? Where did that user go? (Probably left the guild or something is **really** wrong with discord.")],
                ephemeral: true
            });
            return;
        }

        if (!ms(duration) || ms(duration) > ms("28d")) errorsArray.push("Time provided is invalid or over the 28d limit.")

        if (!target.manageable || !target.moderatable) errorsArray.push("I do not have permission to moderate that user.")

        const memberRoles = member?.roles as GuildMemberRoleManager

        if (memberRoles.highest.position < target.roles.highest.position) errorsArray.push("You do not have permission to moderate that user. (higher role position)")

        if (errorsArray.length) {
            interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephemeral: true
            })
            return;
        }

        target.timeout(ms(duration), reason).catch((err) => {
            interaction.reply({ embeds: [errorsEmbed.setDescription("Could not timeout due to an uncommon error.")], ephemeral: true });
            return console.log("Error occured in timeout.ts ", err)
        });

        // make sure that user has a db entry
        const userData = await MigratePrismaUser(target.user);
        const newInfraction = await prisma.infraction.create({
            data: {
                moderator: member.id,
                guildId: guild?.id as string,
                reason: reason,
                type: "TIMEOUT",
                user: {
                    connect: {
                        discord_id: target.id
                    }
                },
                date: time(),
            }
        });

        const infractionsCount = await prisma.infraction.count({
            where: {
                user: userData
            }
        })

        const successEmbed = new EmbedBuilder()
            .setAuthor({ name: "Timeout Issued", iconURL: guild?.iconURL()! })
            .setColor("Gold")
            .setDescription(`${target} was issued a timeout for **${ms(ms(duration), { long: true })}** by ${member}\nbringing their total infractions count to **${infractionsCount}** points\nReason: ${reason}`);

        interaction.reply({ embeds: [successEmbed] });
        return;
    }
}0