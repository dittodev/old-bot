import { CacheType, ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { Command } from "../../structures/Command";
import { ExtendedClient } from "../../client/Client";

export default class extends Command {
    constructor() {
        super({
            data: new SlashCommandBuilder().setName('ping').setDescription('check the bot ping')
        })
    }

    public async run(client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>): Promise<void> {
        if (!interaction.inCachedGuild()) return;
        await interaction.reply('Pong!')
    }
};