import { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import { BrowserState } from "../types/global.js";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
export declare function handleToolCall(name: string, args: any, state: BrowserState, server: Server): Promise<CallToolResult>;
