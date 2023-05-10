import 'dotenv/config'
import { IntentsBitField } from 'discord.js'
import { ExtendedClient } from './client/Client';
import { env } from './env';

export const client = new ExtendedClient(
    {
        intents: IntentsBitField.Flags.Guilds
    }
);

client.start(env.TOKEN);