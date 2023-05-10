import { ApplicationCommandDataResolvable, Client, ClientEvents, ClientOptions, Collection } from "discord.js";
import { Command } from "../types/Command";
import { RegisterCommandsOptions } from "../types/Client";
import { Event } from "../structures/Event";
import { glob } from "glob";

export class ExtendedClient extends Client {
    commands: Collection<string, Command> = new Collection();

    public constructor(options: ClientOptions) {
        super(options);
    }

    start(token: string) {
        this.registerModules();
        this.login(token)
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    async registerCommands({ commands, guildID }: RegisterCommandsOptions) {
        if (guildID) {
            this.guilds.cache.get(guildID)?.commands.set(commands);
            console.log(`Registerring ${guildID}`);
        } else {
            this.application?.commands.set(commands);
            console.log("Registerring global commands");
        }
    }

    async registerModules() {
        // Commands
        const slashCommands: ApplicationCommandDataResolvable[] = [];
        const commandFiles: any = await glob(
            `${__dirname}/../commands/*/*{.ts,.js}`,
        );
        commandFiles.forEach(async (filePath: string) => {
            const command: Command = await this.importFile(filePath);
            if (!command.name) return;

            this.commands.set(command.name, command);
            slashCommands.push(command);
        });

        this.on("ready", () => {
            this.registerCommands({
                commands: slashCommands,
            });
        });

        // Event
        const eventFiles: any = await glob(
            `${__dirname}/../events/*{.ts,.js}`,
            {}
        );
        eventFiles.forEach(async (filePath: string) => {
            const event: Event<keyof ClientEvents> = await this.importFile(
                filePath
            );
            this.on(event.event, event.exec);
        });
    }
}