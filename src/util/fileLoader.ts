import { readdir, stat } from "node:fs/promises";
import path from 'node:path';

export async function loadFiles(dirName: string): Promise<string[] | undefined> {
    if ((await stat(dirName)).isDirectory()) {
        const files = (await readdir(path.resolve(dirName))).filter((name: string) => name.endsWith(".ts") || name.endsWith(".js"));
        files.forEach((file) => delete require.cache[require.resolve(path.resolve(dirName, file))]);
        return files;
    }
}