import { CommandInteractionOptionResolver } from "discord.js";
import { client } from "../bot";
import { Event } from "../structures/Event";
import { Command, ExtendedInteraction } from "../types/Command";

export default new Event("interactionCreate", async (interaction) => {
    // Chat Input Commands
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command: Command | undefined = client.commands.get(interaction.commandName);
        if (!command)
            return interaction.followUp("You have used a non exitent command");

        command.callback({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        });
    }
});