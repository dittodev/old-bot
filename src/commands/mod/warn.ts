import { CacheType, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder, TextChannel, time } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";
import prisma from "../../prisma";

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setDefaultMemberPermissions(PermissionFlagsBits.ModerateMembers)
                .setName("warn")
                .setDescription("Add or remove a warning from a user")
                .addSubcommand((subCmd) =>
                    subCmd
                        .setName("add")
                        .setDescription("Add a warning")
                        .addUserOption((option) => {
                            return option
                                .setName("user")
                                .setDescription("The user to warn")
                                .setRequired(true)
                        })
                        .addStringOption((option) => {
                            return option
                                .setName("reason")
                                .setDescription("The reason for the warn")
                                .setRequired(true)
                                .setMinLength(5)
                                .setMaxLength(1024)
                        })
                )
                .addSubcommand((subCmd) =>
                    subCmd
                        .setName("remove")
                        .setDescription("Remove a warn from a user")
                        .addStringOption((option) => {
                            return option
                                .setName("warn_id")
                                .setDescription("The warn id to remove")
                                .setRequired(true)
                        })
                )
        })
    }

    public async run(client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "add":
                {
                    const { options, guild, member } = interaction;
                    const user = options.getUser("user")
                    const reason = options.getString("reason")
                    const warnTime = time();

                    if (!guild || !member || !user || !reason) return;

                    const newWarn = await prisma.warn.create({
                        data: {
                            userId: user.id,
                            guildId: guild.id,
                            warnReason: reason,
                            moderator: member.user.id,
                            warnDate: warnTime
                        }
                    });

                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("User warned!")
                                .setDescription(
                                    `<@${user.id}> has been warned for \`${reason}\`!`
                                )
                                .setColor("Red")
                        ],
                        ephemeral: true
                    });

                    const modData = await prisma.modLogs.findFirst({ where: { guildId: guild.id } });
                    const data = await prisma.warn.findFirst({
                        where: {
                            guildId: guild.id,
                            userId: user.id
                        }
                    });

                    if (!data) return;

                    if (modData) {
                        const modChannel = client.channels.cache.get(modData.channelId) as TextChannel
                        modChannel.send({
                            embeds: [
                                new EmbedBuilder().setTitle("New user warned").addFields(
                                    {
                                        name: "User warned",
                                        value: `<@${user.id}>`,
                                        inline: true,
                                    },
                                    {
                                        name: "Warned by",
                                        value: `<@${member.user.id}>`,
                                        inline: true,
                                    },
                                    {
                                        name: "Warned at",
                                        value: `${warnTime}`,
                                        inline: true,
                                    },
                                    {
                                        name: "Warn ID",
                                        value: `\`${data.id}\``,
                                        inline: true,
                                    },
                                    {
                                        name: "Warn Reason",
                                        value: `\`\`\`${reason}\`\`\``,
                                    }
                                )
                            ]
                        })
                    }

                    user.send({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle(`You have been warned in: ${guild.name}`)
                                .addFields(
                                    {
                                        name: "Warned for",
                                        value: `\`${reason}\``,
                                        inline: true,
                                    },
                                    {
                                        name: "Warned at",
                                        value: `${warnTime}`,
                                        inline: true,
                                    }
                                )
                                .setColor("Red"),
                        ]
                    }).catch(async (err) => {
                        console.log(err);
                        await interaction.followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setTitle("Target has direct messages disabled so no DM was sent.")
                                    .setColor("Red")
                            ]
                        })
                    })
                }
                break;

            case "remove":
                {
                    const warnId = interaction.options.getString("warn_id");

                    if (!warnId) return;

                    const data = await prisma.warn.findUnique({
                        where: {
                            id: warnId
                        }
                    });

                    const err = new EmbedBuilder().setDescription(
                        `No warn ID matching \`${warnId}\` was found!`
                    );

                    if (!data) {
                        await interaction.reply({ embeds: [err] })
                        return;
                    }

                    await prisma.warn.delete({
                        where: {
                            id: data.id
                        }
                    });

                    const embed = new EmbedBuilder()
                        .setTitle("Remove warning")
                        .setDescription(
                            `Successfully removed the warn with the ID of ${warnId}`
                        );

                    await interaction.reply({ embeds: [embed] });
                    return;
                }
        }
    }
}