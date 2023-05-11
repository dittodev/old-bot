import { ActivityType, ApplicationCommandDataResolvable } from "discord.js";
import { Event } from "../structures/Event";
import { ExtendedClient } from "../client/Client";
import { Command } from "../structures/Command";

export default new Event("ready", async (client: ExtendedClient) => {
    console.log(`shard ${client.shard?.ids} is online`);
    client.user?.setActivity({
        name: `shard ${client.shard?.ids}`,
        type: ActivityType.Listening
    });
    await client.application?.commands.set(client.commands.map((command: Command) => command.structure.data as ApplicationCommandDataResolvable))
});