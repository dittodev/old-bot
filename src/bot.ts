import 'dotenv/config'
import { Client, IntentsBitField } from 'discord.js'

const client = new Client(
    {
        intents: IntentsBitField.Flags.Guilds
    }
);

client.once('ready', () => {
    console.log('ready');
});

client.login(process.env.TOKEN);