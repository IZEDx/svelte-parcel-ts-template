import { createServer }             from "http";
const express = require("express") as () => Express;
import { static as serveStatic, Express }    from "express";
import { join }                     from "path";
import { json, urlencoded }         from "body-parser";
import { log }                      from "./libs/utils";
import { setupCache }               from 'axios-cache-adapter'
import TypedAxios                   from "restyped-axios";

const path = (...str: string[]) => join(__dirname, ...str);

export async function main()
{
    log.main("Starting api server...");

    const app       = express();
    const server    = createServer(app);
    const cache     = setupCache({ maxAge: 15 * 60 * 1000 });
    const axios     = TypedAxios.create({ adapter: cache.adapter as any });
    const statics = serveStatic(path("client"), {index: ["index.html"]});
    const staticFileEndings = [".css", ".js", ".html", ".map"]

    app.use(urlencoded({ extended: true })); 
    app.use(json());
    app.use((req, res, next) => {
        
        const assetsIdx = req.url.indexOf("/assets/");
        if (assetsIdx >= 0)
        {
            req.url = req.url.substring(assetsIdx);
        }
        if (staticFileEndings.find(e => req.url.endsWith(e)))
        {
            req.url = req.url.substring(req.url.lastIndexOf("/"));
        }
        
        next();
    });
    app.use(statics);
    app.use((req, res) => {
        res.sendFile(path("client", "index.html"));
    });

    server.listen(8080, () => {
        log.main(`Server started.`);
        log.main(`Listening on port 8080.`);
    });
} 

main();