import { CacheType, ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder()
                .setName("reload")
                .setDMPermission(true)
                .addSubcommand((subCmd) => subCmd
                    .setName("events")
                    .setDescription("Reload the events")
                )
                .addSubcommand((subCmd) => subCmd
                    .setName("commands")
                    .setDescription("Reload the commands")
                )
                .setDescription("Reload the bot"),
            superUserOnly: true
        })
    }

    public async run(client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        const { options } = interaction;

        const embed = new EmbedBuilder()
            .setTitle("Success!")
            .setColor("Green")
            .setTimestamp();

        switch (options.getSubcommand()) {
            case "events": {
                await client.reloadEvents();
                interaction.reply({ embeds: [embed.setDescription("Successfully reloaded events")], ephemeral: true })
            }
            break;
            case "commands": {
                await client.reloadCommands();
                interaction.reply({ embeds: [embed.setDescription("Successfully reloaded commands")], ephemeral: true })
            }
        }
    }
}