import { Client, ClientEvents, ClientOptions, Collection } from "discord.js";
import { Event } from "../structures/Event";
import { Command } from "../structures/Command";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import { loadFiles } from "../util/fileLoader";

export class ExtendedClient extends Client<true> {
    public readonly commands: Collection<string, Command> = new Collection();
    public readonly guildConfig: Collection<string, {
        logChannel: string,
        memberRole: string,
        botRole: string
    }> = new Collection();

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

    public async reloadEvents() {
        await this.setEventHandlers(process.cwd() + '/src/commands/');
    }

    public async reloadCommands() {
        this.setClientCommands(process.cwd() + '/src/events/')
    }

    async importFile(filePath: string) {
        return (await import(filePath))?.default;
    }

    private async setClientCommands(paths: string): Promise<void> {
        if ((await stat(paths)).isDirectory()) {
            return (await readdir(path.resolve(paths))).forEach(async (category: string) => {
                const files = await loadFiles(path.resolve(paths, category))
                if (!files) return;
                files.forEach(async (file) => {
                    const command: Command = new ((await this.importFile(path.resolve(paths, category, file))));
                    this.commands.set(command.structure.data.name, command);
                    return delete require.cache[require.resolve(path.resolve(paths, category, file))];
                });
            })
        }
    }

    private async setEventHandlers(paths: string): Promise<void> {
        const files = await loadFiles(paths);
        if (!files) return;
        files.forEach(async (file) => {
            const handler: Event<keyof ClientEvents> = ((await this.importFile(path.resolve(paths, file))));
            this.on(handler.event, async (...args) => handler.exec(this, ...args));
            return delete require.cache[require.resolve(path.resolve(paths, file))];
        });
    }
}