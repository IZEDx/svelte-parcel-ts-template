import { createServer }             from "http";
const express = require("express") as () => Express;
import { static as serveStatic, Express, Request, Response, NextFunction, Router, RequestHandler }    from "express";
import { join }                     from "path";
import { json, urlencoded }         from "body-parser";
import { log }                      from "./libs/utils";
import { setupCache }               from 'axios-cache-adapter'
import TypedAxios                   from "restyped-axios";
import Route from "route-parser";
import { RecursiveRecord, indexModules } from "./libs/utils";
import _modules from "./api/**/*.ts";

export interface CustomRequest extends Request
{

}

export interface CustomResponse extends Response
{

}

const path = (...str: string[]) => join(__dirname, ...str);

export interface APIRoute
{
    get?: RequestHandler;
    post?: RequestHandler;
    put?: RequestHandler;
    delete?: RequestHandler;
}

interface _APIRoute extends APIRoute
{
    path: string;
    route: Route;
}

type APIModule = {
    default: APIRoute
};

function isAPIModule(obj: any): obj is APIModule
{
    return !!obj && !!obj.default && (!!obj.default.get || !!obj.default.post || !!obj.default.put || !!obj.default.delete);
} 

const apiModules = _modules as unknown as RecursiveRecord<APIModule>;

export async function main()
{
    log.main("Starting api server...");

    const app       = express();
    const server    = createServer(app);
    const cache     = setupCache({ maxAge: 15 * 60 * 1000 });
    const axios     = TypedAxios.create({ adapter: cache.adapter as any });
    const statics   = serveStatic(path("client"), {index: ["index.html"]});
    const apiRouter = Router();

    const apiRoutes = await indexModules(apiModules, isAPIModule, (path, module) => [{
        path,
        route: new Route(path),
        ...module.default
    } as _APIRoute]);

    console.log(apiRoutes);

    for (const route of apiRoutes)
    {
        if (route.get) apiRouter.get(route.path, route.get);
        if (route.post) apiRouter.post(route.path, route.post);
        if (route.put) apiRouter.put(route.path, route.put);
        if (route.delete) apiRouter.delete(route.path, route.delete);
    }

    app.use(urlencoded({ extended: true })); 
    app.use(json());

    app.use("/api", apiRouter);
    app.use(flattenStatics);
    app.use(statics);
    app.use((req, res) => {
        res.sendFile(path("client", "index.html"));
    });

    server.listen(8080, () => {
        log.main(`Server started.`);
        log.main(`Listening on port 8080.`);
    });
} 

const staticFileEndings = [".css", ".js", ".html", ".map"];
function flattenStatics(req: Request, res: Response, next: NextFunction)
{
    const url = req.url;
    const assetsIdx = req.url.indexOf("/assets/");
    if (assetsIdx >= 0)
    {
        req.url = req.url.substring(assetsIdx);
    }
    if (staticFileEndings.find(e => req.url.endsWith(e)))
    {
        req.url = req.url.substring(req.url.lastIndexOf("/"));
    }
    
    log.debug(url, req.url)

    next();
}

main();