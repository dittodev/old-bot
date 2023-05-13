import { Guild } from "discord.js";
import { ExtendedClient } from "../client/Client";
import { Event } from "../structures/Event";
import prisma from "../util/prisma";

export async function MigratePrismaGuild(dGuild: Guild) {
    const guildObject = {
        id: dGuild.id,
        memberCount: dGuild.memberCount,
        name: dGuild.name
    }
    return await prisma.guild.upsert({ where: { id: dGuild.id }, update: { ...guildObject }, create: { ...guildObject } })
}

export default new Event("guildCreate", async (client: ExtendedClient, guild: Guild) => {
    let pGuild = await prisma.guild.findUnique({ where: { id: guild.id } });
    typeof pGuild

    if (!pGuild) {
        pGuild = await prisma.guild.create({ data: { id: guild.id, memberCount: guild.memberCount, name: guild.name } });
    }

    pGuild = await MigratePrismaGuild(guild)
})