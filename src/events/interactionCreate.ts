import { CacheType, ChatInputCommandInteraction, User as DUser, Interaction } from "discord.js";
import { client } from "../bot";
import { Event } from "../structures/Event";
import { Command } from "../structures/Command";
import prisma from "../util/prisma";
import { ExtendedClient } from "../client/Client";
import { MigratePrismaGuild } from "./guildCreate";
import { User } from "@prisma/client";

export async function MigratePrismaUser(user: DUser) {
    if (user.bot) return;
    const prismaUser = await prisma.user.findUnique({
        where: {
            discord_id: user.id
        }
    });

    if (!prismaUser) {
        user.send(`Hello, ${user.username}! Welcome to ${client.user?.username} bot!`)
        const freshUser = await prisma.user.create({
            data: {
                discord_id: user.id,
                createdAt: user.createdAt,
                username: user.username
            }
        });

        return freshUser;
    }

    if (prismaUser.username !== user.username) await prisma.user.update({ where: { discord_id: user.id }, data: { username: user.username } })
    if (prismaUser.createdAt !== user.createdAt) await prisma.user.update({ where: { discord_id: user.id }, data: { createdAt: user.createdAt } })

    return prismaUser
}

async function handleSuperUser(cmd: Command, prismaUser: User, client: ExtendedClient, interaction: ChatInputCommandInteraction<CacheType>) {
    if (!prismaUser.isSuperUser) return interaction.reply("You do not have permission to run this command.");
    cmd.run(client, interaction);
}

export default new Event("interactionCreate", async (client: ExtendedClient, interaction: Interaction) => {
    if (interaction.guild) await MigratePrismaGuild(interaction.guild);
    // Chat Input Commands
    if (interaction.isChatInputCommand()) {
        const command: Command | undefined = client.commands.get(interaction.commandName);
        if (!command)
            return interaction.followUp("You have used a non existent command");

        const prismaUser = await MigratePrismaUser(interaction.user);

        if (prismaUser) {
            if (command.structure.superUserOnly) return await handleSuperUser(command, prismaUser, client, interaction)
        }        

        command.run(client, interaction)
    }
});