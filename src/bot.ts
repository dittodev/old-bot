import { IntentsBitField, Partials } from 'discord.js'
import { ExtendedClient } from './client/Client';
import { env } from './util/env';

export const client = new ExtendedClient(
    {
        intents: IntentsBitField.Flags.Guilds | IntentsBitField.Flags.GuildMembers,
        partials: [
            Partials.Message,
            Partials.Channel,
            Partials.GuildMember
        ]
    }
);

client.login(env.TOKEN);