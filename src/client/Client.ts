import { ApplicationCommandDataResolvable, Client, ClientEvents, ClientOptions, Collection } from "discord.js";
import { RegisterCommandsOptions } from "../types/Client";
import { Event } from "../structures/Event";
import { Command } from "../structures/Command";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

export class ExtendedClient extends Client<true> {
    public readonly commands: Collection<string, Command> = new Collection();

    public constructor(options: ClientOptions) {
        super(options);
    }

    public override async login(token: string) {
        await Promise.all([
            this.setClientCommands(process.cwd() + '/src/commands/'),
            this.setEventHandlers(process.cwd() + '/src/events/')
        ]);
        return super.login(token)
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    private async setClientCommands(paths: string): Promise<void> {
        if ((await stat(paths)).isDirectory()) {
            return (await readdir(path.resolve(paths))).forEach(async (category: string) => {
                const commands: string[] = (await readdir(path.resolve(paths, category))).filter((name: string) => name.endsWith(".ts") || name.endsWith(".js"));
                return commands.forEach(async (file: string) => {
                    const command: Command = new ((await import(path.resolve(paths, category, file)))?.default);
                    this.commands.set(command.structure.data.name, command);
                    return delete require.cache[require.resolve(path.resolve(paths, category, file))];
                })
            })
        }
    }

    private async setEventHandlers(paths: string): Promise<void> {
        if ((await stat(paths)).isDirectory()) {
            return (await readdir(path.resolve(paths))).filter((name: string) => name.endsWith(".ts") || name.endsWith(".js")).forEach(async (file: string) => {
                const handler: Event<keyof ClientEvents> = ((await import(path.resolve(paths, file)))?.default);
                this.on(handler.event, async (...args) => handler.exec(this, ...args));
                return delete require.cache[require.resolve(path.resolve(paths, file))]
            })
        }
    }
}