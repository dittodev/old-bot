import { CacheType, ChatInputCommandInteraction, EmbedBuilder, GuildMember, GuildMemberRoleManager, PermissionFlagsBits, SlashCommandBuilder, time } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";
import prisma from '../../util/prisma';
import { MigratePrismaUser } from '../../events/interactionCreate';

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName("ban")
                .setDescription("ban a member")
                .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers || PermissionFlagsBits.BanMembers)
                .setDMPermission(false)
                .addUserOption((option) => option
                    .setName("target")
                    .setDescription("select a member")
                    .setRequired(true)
                )
                .addStringOption((option) => option
                    .setName("reason")
                    .setDescription("reason for the ban")
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
        const reason = options.getString("reason", true);

        const errorsArray: string[] = [];

        const errorsEmbed = new EmbedBuilder()
            .setAuthor({ name: "Could not ban member due to" })
            .setColor("Red");

        if (!target) {
            interaction.reply({
                embeds: [errorsEmbed.setDescription("Huh? Where did that user go? (Probably left the guild or something is **really** wrong with discord.")],
                ephemeral: true
            });
            return;
        }

        if (!target.manageable || !target.moderatable || !target.bannable) errorsArray.push("I do not have permission to moderate that user.")

        const memberRoles = member?.roles as GuildMemberRoleManager

        if (memberRoles.highest.position < target.roles.highest.position) errorsArray.push("You do not have permission to moderate that user. (higher role position)")

        if (errorsArray.length) {
            interaction.reply({
                embeds: [errorsEmbed.setDescription(errorsArray.join("\n"))],
                ephemeral: true
            })
            return;
        }

        target.ban({
            reason
        })

        // make sure that user has a db entry
        const userData = await MigratePrismaUser(target.user);
        const newInfraction = await prisma.infraction.create({
            data: {
                moderator: member.id,
                guildId: guild?.id as string,
                reason: reason,
                type: "BAN",
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
            .setAuthor({ name: "Ban Issued", iconURL: guild?.iconURL()! })
            .setColor("Gold")
            .setDescription(`${target} was banned by ${member}\nbringing their total infractions count to **${infractionsCount}** points\nReason: ${reason}`);

        interaction.reply({ embeds: [successEmbed] });
        return;
    }
}0