import { EmbedBuilder, Interaction, PermissionsBitField } from "discord.js";
import { ExtendedClient } from "../client/Client";
import { Event } from "../structures/Event";

export default new Event("interactionCreate", async (client: ExtendedClient, interaction: Interaction) => {
    if (!interaction.isButton()) return;

    const splitArray = interaction.customId.split("-");
    if (splitArray[0] !== "MemberLogging") return;

    const member = (await interaction.guild?.members.fetch()!).get(splitArray[2]);
    const embed = new EmbedBuilder();
    const errors: string[] = [];

    const permissions = interaction.member?.permissions as Readonly<PermissionsBitField>;

    if (!permissions.has("KickMembers")) errors.push("You do not have permissions to do this.")

    if (!member) return interaction.reply({embeds: [embed.setDescription("This user is no longer a member of this guild.")]})

    if (!member?.moderatable) errors.push(`I can't moderate ${member}!`);

    if (errors.length) return interaction.reply({
        embeds: [embed.setDescription(errors.join("\n"))],
        ephemeral: true
    });

    switch (splitArray[1]) {
        case "Kick": {
            member?.kick(`Kicked by ${interaction.user.username} | Member Logging System`).then(() => interaction.reply({ embeds: [embed.setDescription(`${member} has been kicked.`)] })).catch(() => interaction.reply({ embeds: [embed.setDescription(`${member} could not be kicked.`)] }))
        }
        break;
        case "Ban": {
            member?.kick(`Banned by ${interaction.user.username} | Member Logging System`).then(() => interaction.reply({ embeds: [embed.setDescription(`${member} has been banned.`)] })).catch(() => interaction.reply({ embeds: [embed.setDescription(`${member} could not be banned.`)] }))
        }
        break;
    }
});