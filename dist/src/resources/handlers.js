var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { ListResourcesRequestSchema, ReadResourceRequestSchema, } from "@modelcontextprotocol/sdk/types.js";
export function setupResourceHandlers(server, state) {
    // List available resources
    server.setRequestHandler(ListResourcesRequestSchema, () => __awaiter(this, void 0, void 0, function* () {
        return ({
            resources: [
                {
                    uri: "console://logs",
                    mimeType: "text/plain",
                    name: "Browser console logs",
                },
                ...Array.from(state.screenshots.keys()).map(name => ({
                    uri: `screenshot://${name}`,
                    mimeType: "image/png",
                    name: `Screenshot: ${name}`,
                })),
            ],
        });
    }));
    // Handle resource read requests
    server.setRequestHandler(ReadResourceRequestSchema, (request) => __awaiter(this, void 0, void 0, function* () {
        const uri = request.params.uri.toString();
        if (uri === "console://logs") {
            return {
                contents: [{
                        uri,
                        mimeType: "text/plain",
                        text: state.consoleLogs.join("\n"),
                    }],
            };
        }
        if (uri.startsWith("screenshot://")) {
            const name = uri.split("://")[1];
            const screenshot = state.screenshots.get(name);
            if (screenshot) {
                return {
                    contents: [{
                            uri,
                            mimeType: "image/png",
                            blob: screenshot,
                        }],
                };
            }
        }
        throw new Error(`Resource not found: ${uri}`);
    }));
}
// Helper function to notify about console updates
export function notifyConsoleUpdate(server) {
    server.notification({
        method: "notifications/resources/updated",
        params: { uri: "console://logs" },
    });
}
// Helper function to notify about screenshot updates
export function notifyScreenshotUpdate(server) {
    server.notification({
        method: "notifications/resources/list_changed",
        params: {},
    });
}
