import { SlashCommandBuilder, SharedNameAndDescription, ChatInputCommandInteraction } from "discord.js";
import { ExtendedClient } from "../client/Client";

export class Command {
    structure: SlashCommand;
    constructor(structure: SlashCommand) {
        this.structure = structure
    }
    
    public run(client: ExtendedClient, interaction: ChatInputCommandInteraction) {
        throw new Error(`The function to run the command ${this.structure.data.name} is not specified`);
    }
}

export interface SlashCommand {
    data: SlashCommandBuilder | SharedNameAndDescription;
    cooldown?: number;
};