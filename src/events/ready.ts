import { ActivityType } from "discord.js";
import { client } from "../bot";
import { Event } from "../structures/Event";

export default new Event("ready", () => {
    console.log(`shard ${client.shard?.ids} is online`);
    client.user?.setActivity({
        name: `shard ${client.shard?.ids}`,
        type: ActivityType.Listening
    })
});