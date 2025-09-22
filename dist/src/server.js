var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { logger } from "./config/logger.js";
import { TOOLS } from "./tools/definitions.js";
import { handleToolCall } from "./tools/handlers.js";
import { setupResourceHandlers } from "./resources/handlers.js";
import { closeBrowser } from "./browser/connection.js";
import { getPageAndBrowserGlobals } from "./tools/handlers.js";
// Initialize global state
// Create and configure server
export function runServer() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const pageAndBrowserGlobal = yield getPageAndBrowserGlobals();
            const state = {
               page: pageAndBrowserGlobal.page,
                consoleLogs: [],
                screenshots: new Map(),
            };
            const server = new Server({
                name: "example-servers/puppeteer",
                version: "0.1.0",
            }, {
                capabilities: {
                    resources: {},
                    tools: {},
                },
            });
            // Setup resource handlers
            setupResourceHandlers(server, state);
            // Setup tool handlers
            server.setRequestHandler(ListToolsRequestSchema, () => __awaiter(void 0, void 0, void 0, function* () {
                return ({
                    tools: TOOLS,
                });
            }));
            server.setRequestHandler(CallToolRequestSchema, (request) => __awaiter(void 0, void 0, void 0, function* () { var _a; return handleToolCall( request.params.name, (_a = request.params.arguments) !== null && _a !== void 0 ? _a : {}, state, server); }));
            // Graceful shutdown on signals (avoid exiting on stdin close)
            let isShuttingDown = false;
            function shutdown() {
                return __awaiter(this, void 0, void 0, function* () {
                    if (isShuttingDown)
                        return;
                    isShuttingDown = true;
                    logger.info("Puppeteer MCP Server closing");
                    yield closeBrowser();
                    yield server.close();
                });
            }
            // Start the server
           
            logger.info('Starting MCP server');
            const transport = new StdioServerTransport();

            yield server.connect(transport);
            // Keep process alive when running in a TTY (standalone/dev runs)
            if (process.stdin.isTTY) {
                process.stdin.resume();
            }
            logger.info('MCP server started successfully');
        }
        catch (error) {
            logger.error('Failed to start server:', error);
            process.exit(1);
        }
    });
}
