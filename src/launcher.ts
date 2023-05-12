import 'dotenv/config'
import { ShardingManager } from "discord.js";
import { env } from "./util/env";

const manager = new ShardingManager(__dirname + '/bot.ts', { token: env.TOKEN, execArgv: ['-r', 'ts-node/register'], totalShards: "auto" });

manager.on('shardCreate', shard => console.log(`Launched shard ${shard.id}`));

manager.spawn();