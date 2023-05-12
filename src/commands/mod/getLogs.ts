import { CacheType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";
import prisma from "../../prisma";

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName("logs")
                .setDescription("Get the logs of a user")
                .addSubcommand((subCmd) =>
                    subCmd
                        .setName("warns")
                        .setDescription("Get the warns of a user")
                        .addUserOption((option) => {
                            return option
                                .setName("user")
                                .setDescription("User to get the warn logs for")
                                .setRequired(true);
                        })
                        .addIntegerOption((option) => {
                            return option
                                .setName("page")
                                .setDescription("The page to display if there are more than 1")
                                .setMinValue(2)
                                .setMaxValue(20);
                        }))
        });
    }

    public async run(client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        switch (interaction.options.getSubcommand()) {
            case "warns": {
                const user = interaction.options.getUser("user")!;
                const page = interaction.options.getInteger("page");

                const userWarnings = await prisma.infraction.findMany({
                    where: {
                        user: {
                            discord_id: user.id
                        },
                        guildId: interaction.guild?.id,
                        type: "WARN"
                    }
                });

                if (!userWarnings.length) {
                    await interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setTitle("User Warn Logs")
                                .setDescription(`${user.username} has no warns!`)
                                .setColor("Red")
                        ]
                    })
                    return;
                }

                const embed = new EmbedBuilder()
                    .setTitle(`${user.tag}'s warn logs`)
                    .setColor("Green")

                if (page) {
                    const pageNum = 5 * page - 5;

                    if (userWarnings.length >= 6) {
                        embed.setFooter({
                            text: `page ${page} of ${Math.ceil(userWarnings.length / 5)}`
                        })
                    }

                    for (const warnings of userWarnings.splice(pageNum, 5)) {
                        const moderator = interaction.guild?.members.cache.get(
                            warnings.moderator
                        );

                        embed.addFields({
                            name: `id: ${warnings.infractionId}`,
                            value: `
                              Moderator: ${moderator || "Moderator left"
                                }
                              User: ${warnings.userDiscord_id}
                              Reason: \`${warnings.reason
                                }\`
                              Date: ${warnings.date}
                              `,
                        });

                        await interaction.reply({ embeds: [embed] });
                        return;
                    }
                }

                if (userWarnings.length >= 6) {
                    embed.setFooter({
                        text: `page 1 of ${Math.ceil(userWarnings.length / 5)}`
                    })
                }

                for (const warns of userWarnings.slice(0, 5)) {
                    const moderator = interaction.guild?.members.cache.get(
                        warns.moderator
                    );

                    embed.addFields({
                        name: `id: ${warns.infractionId}`,
                        value: `
                              Moderator: ${moderator || "Moderator left"
                            }
                              User: ${warns.userDiscord_id}
                              Reason: \`${warns.reason
                            }\`
                              Date: ${warns.date}
                              `,
                    });
                }

                await interaction.reply({ embeds: [embed] });
                break;
            }

            default:
                break;
        }
    }
}