import _modules from "./**/*.svelte";
import { RecursiveRecord } from "../libs/utils";

export interface PageProps
{

}

export type PageModule = {
    default: SvelteComponent<PageProps>
};

export function isPageModule(obj: any): obj is PageModule
{
    return !!obj && !!obj.default && obj.default.name === "Component";
} 

export default _modules as unknown as RecursiveRecord<PageModule>;
