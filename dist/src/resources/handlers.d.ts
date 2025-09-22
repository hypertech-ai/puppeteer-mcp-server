import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { BrowserState } from "../types/global.js";
export declare function setupResourceHandlers(server: Server, state: BrowserState): void;
export declare function notifyConsoleUpdate(server: Server): void;
export declare function notifyScreenshotUpdate(server: Server): void;
