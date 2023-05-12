import { CacheType, ChannelType, ChatInputCommandInteraction, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";
import prisma from "../../util/prisma";

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName("memberlog")
                .setDMPermission(false)
                .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
                .setDescription("Modify the memberlog settings")
                .addSubcommand((command) => command
                    .setName("setup")
                    .setDescription("Setup the member logging channel.")
                    .addChannelOption((option) => option
                        .addChannelTypes(ChannelType.GuildText)
                        .setName("log_channel")
                        .setDescription("The channel put the logs")
                        .setRequired(true)
                    )
                    .addRoleOption((option) => option
                        .setName("member_role")
                        .setDescription("Set the role to be given to members when they join")
                        .setRequired(true)
                    )
                    .addRoleOption((option) => option
                        .setName("bot_role")
                        .setDescription("Set the role to be given to bots when they join")
                        .setRequired(true)
                    )
                )
        })
    }

    public async run(client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const subCommand = interaction.options.getSubcommand();
        const { guild, options } = interaction;

        switch (subCommand) {
            case "setup": {
                const logChannel = options.getChannel("log_channel", true).id;

                const memberRole = options.getRole("member_role", true).id;
                const botRole = options.getRole("bot_role", true).id;

                const guildConfigObject = {
                    logChannel: logChannel,
                    memberRole: memberRole,
                    botRole: botRole
                }

                await prisma.memberLog.upsert({
                    update: {
                        ...guildConfigObject
                    },
                    create: {
                        guildId: guild?.id as string,
                        ...guildConfigObject
                    },
                    where: {
                        guildId: guild?.id
                    },
                });

                client.guildConfig.set(guild?.id as string, {
                    ...guildConfigObject
                });

                const embed = new EmbedBuilder()
                    .setColor("Green")
                    .setDescription([
                        `- Logging channel set to <#${logChannel}>`,
                        `- Member Auto-Role updated: <@&${memberRole}>`,
                        `- Bot Auto-Role updated: <@&${botRole}>`
                    ].join("\n"));

                interaction.reply({ embeds: [embed], ephemeral: true });
            }
            break;
        }
    }
}