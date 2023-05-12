import { ExtendedClient } from "../client/Client";
import prisma from "./prisma";

async function loadGuildConfig(client: ExtendedClient) {
    const guildConfigs = await prisma.memberLog.findMany();
    guildConfigs.forEach((guildConfig) => {
        client.guildConfig.set(guildConfig.guildId, {
            logChannel: guildConfig.logChannel,
            memberRole: guildConfig.memberRole,
            botRole: guildConfig.botRole
        })
    });

    return console.log("Loaded guild configs to the collection")
}

export { loadGuildConfig }