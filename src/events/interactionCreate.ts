import { CommandInteractionOptionResolver, User as DUser } from "discord.js";
import { client } from "../bot";
import { Event } from "../structures/Event";
import { Command, ExtendedInteraction } from "../types/Command";
import prisma from "../prisma";

async function MigratePrismaUser(user: DUser) {
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

export default new Event("interactionCreate", async (interaction) => {
    // Chat Input Commands
    if (interaction.isCommand()) {
        await interaction.deferReply();
        const command: Command | undefined = client.commands.get(interaction.commandName);
        if (!command)
            return interaction.followUp("You have used a non existent command");

        const prismaUser = await MigratePrismaUser(interaction.user);

        command.callback({
            args: interaction.options as CommandInteractionOptionResolver,
            client,
            interaction: interaction as ExtendedInteraction
        });
    }
});