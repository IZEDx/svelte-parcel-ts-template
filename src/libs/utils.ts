
import chalk from "chalk";
import { readFile as rF, writeFile as wF } from "fs";

export {chalk};

export function readFile(path: string, defaultContent?: Buffer): Promise<Buffer>
{
    return new Promise((res, rej) =>
        rF(path, (err, data) => 
            !err 
            ? res(data) 
            : (err.code === "ENOENT" && defaultContent !== undefined
                ? res(defaultContent)
                : rej(err))
        )
    );
}

export function writeFile(path: string, data: string|Buffer|Uint8Array): Promise<void>
{
    return new Promise((res, rej) =>
        wF(path, data, (err) => 
            err !== null
            ? rej(err)
            : res()
        )  
    );
}

/**
 * Does nothing.
 * @param args Anything.
 */
export function nop(...args: string[]) {}

/**
 * Time utilities
 */
export namespace time {
    export const local = () => new Date().toLocaleString();
}


/**
 * Logging utilities
 */
export namespace log {

    export let name = "svelte-template"
    /**
     * Logs stuff using a given prefix.
     * @param {string} prefix The prefix to prepend.
     * @param {string[]} msg The actual message.
     */
    function logPrefix(prefix: string, ...msg: string[]) {
        console.log(prefix + "\t" + chalk.gray(time.local()) + "\t", ...msg);
    }

    export const main           = (...msg: string[]) => logPrefix(chalk.red.bold("["+ name +"]"), ...msg);
    export const error           = (...msg: string[]) => logPrefix(chalk.red.bold("[ERROR]"), ...msg);
    export const server         = (...msg: string[]) => logPrefix(chalk.blue.bold("[Server]"), ...msg);
    export const interaction    = (...msg: string[]) => logPrefix(chalk.green.bold("[Interaction]"), ...msg);
    export const debug          = (...msg: string[]) => logPrefix(chalk.yellow.bold("[Debug]"), ...msg);
    export const test          = (...msg: string[]) => logPrefix(chalk.green.bold("[Test]"), ...msg);
}

export function randomSequence(length: number) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!§$%&/()=?{[]}-_.:,;<>|#+~";
  
    for (var i = 0; i < length; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));
  
    return text;
}


type _RecursiveRecord<T> = Record<string, T|RecursiveRecord<T>>;
export interface RecursiveRecord<T> extends _RecursiveRecord<T>
{
}

export async function indexModules<T, K>(
    module: T|RecursiveRecord<T>,
    checker: (module: any) => module is T,
    transformer: (path: string, module: T) => K[]
) {
    return _indexModules(["", module], checker, transformer);
}

async function _indexModules<T, K>(
    [path, module]: [string, T|RecursiveRecord<T>],
    checker: (module: any) => module is T,
    transformer: (path: string, module: T) => K[]
): Promise<K[]>
{
    if (checker(module))
    {
        return transformer(path, module);
    }
    else
    {
        return (await Promise.all(
            Object.entries(module)
                .map(e => [ buildPath(path, e[0]), e[1] ] as typeof e)
                .flatMap(async e => await _indexModules(e, checker, transformer))
        )).flat()
    }
}

function buildPath(path: string, pagename: string): string
{
    if (!path.endsWith(")")) path += "/";

    if (pagename.startsWith("$"))
    {
        return path + ":" + pagename.slice(1);
    }

    if (pagename.startsWith("§"))
    {
        return path + "*" + pagename.slice(1);
    }

    if (pagename.startsWith("_"))
    {
        return path + "(" + buildPath("", pagename.slice(1)).slice(1) + "/)";
    }

    if (pagename === "index")
    {
        return path;
    }

    return path + pagename;
}