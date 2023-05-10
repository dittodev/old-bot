import { ChatInputApplicationCommandData, CommandInteraction, CommandInteractionOptionResolver, GuildMember, PermissionResolvable } from "discord.js";
import { ExtendedClient } from "../client/Client";

export interface ExtendedInteraction extends CommandInteraction {
    member: GuildMember;
}

interface CallbackOptions {
    client: ExtendedClient;
    interaction: ExtendedInteraction;
    args: CommandInteractionOptionResolver;
}

type CallbackFunction = (options: CallbackOptions) => any;

export type Command = {
    userPermissions?: PermissionResolvable[];
    callback: CallbackFunction;
} & ChatInputApplicationCommandData