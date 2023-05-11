import { ClientEvents } from "discord.js";
import { ExtendedClient } from "../client/Client";

export class Event<Key extends keyof ClientEvents> {
    constructor(
        public event: Key,
        public exec: (client: ExtendedClient, ...args: ClientEvents[Key]) => any
    ) {}
}