var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { logger } from "../config/logger.js";
import { ensureBrowser, getDebuggerWebSocketUrl, connectToExistingBrowser, getCurrentPage } from "../browser/connection.js";
import { notifyConsoleUpdate, notifyScreenshotUpdate } from "../resources/handlers.js";
export function getPageAndBrowserGlobals() {
    return __awaiter(this, void 0, void 0, function* () { 
        const pageAndBrowserGlobal = yield connectToExistingBrowser( (logEntry) => {
            state.consoleLogs.push(logEntry);
            notifyConsoleUpdate(server);
        });
        return pageAndBrowserGlobal;
        
    });

}
export function handleToolCall( name, args, state, server) {

   
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b, _c;
        logger.debug('Tool call received', { tool: name, arguments: args });
        const page = state.page;
        switch (name) {
            case "puppeteer_navigate":
                try {
                
                
                    logger.info('Navigating to URL', { url: args.url });
                    const response = yield page.goto(args.url, {
                        waitUntil: 'networkidle0',
                        timeout: 30000
                    });
                    if (!response) {
                        throw new Error('Navigation failed - no response received');
                    }
                    const status = response.status();
                    if (status >= 400) {
                        throw new Error(`HTTP error: ${status} ${response.statusText()}`);
                    }
                    logger.info('Navigation successful', { url: args.url, status });
                    return {
                        content: [{
                                type: "text",
                                text: `Successfully navigated to ${args.url} (Status: ${status})`,
                            }],
                        isError: false,
                    };
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    logger.error('Navigation failed', { url: args.url, error: errorMessage });
                    return {
                        content: [{
                                type: "text",
                                text: `Navigation failed: ${errorMessage}\nThis could be due to:\n- Network connectivity issues\n- Site blocking automated access\n- Page requiring authentication\n- Navigation timeout\n\nTry using a different URL or checking network connectivity.`,
                            }],
                        isError: true,
                    };
                }
            case "puppeteer_screenshot": {
                const width = (_a = args.width) !== null && _a !== void 0 ? _a : 800;
                const height = (_b = args.height) !== null && _b !== void 0 ? _b : 600;
                
                yield page.setViewport({ width, height });
                const screenshot = yield (args.selector ?
                    (_c = (yield page.$(args.selector))) === null || _c === void 0 ? void 0 : _c.screenshot({ encoding: "base64" }) :
                    page.screenshot({ encoding: "base64", fullPage: false }));
                if (!screenshot) {
                    return {
                        content: [{
                                type: "text",
                                text: args.selector ? `Element not found: ${args.selector}` : "Screenshot failed",
                            }],
                        isError: true,
                    };
                }
                state.screenshots.set(args.name, screenshot);
                notifyScreenshotUpdate(server);
                return {
                    content: [
                        {
                            type: "text",
                            text: `Screenshot '${args.name}' taken at ${width}x${height}`,
                        },
                        {
                            type: "image",
                            data: screenshot,
                            mimeType: "image/png",
                        },
                    ],
                    isError: false,
                };
            }
            case "puppeteer_click":
                try {
                   
                    yield page.click(args.selector);
                    return {
                        content: [{
                                type: "text",
                                text: `Clicked: ${args.selector}`,
                            }],
                        isError: false,
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: `Failed to click ${args.selector}: ${error.message}`,
                            }],
                        isError: true,
                    };
                }
            case "puppeteer_fill":
                try {
                   
                    yield page.waitForSelector(args.selector);
                    yield page.type(args.selector, args.value);
                    return {
                        content: [{
                                type: "text",
                                text: `Filled ${args.selector} with: ${args.value}`,
                            }],
                        isError: false,
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: `Failed to fill ${args.selector}: ${error.message}`,
                            }],
                        isError: true,
                    };
                }
            case "puppeteer_select":
                try {
                   
                    yield page.waitForSelector(args.selector);
                    yield page.select(args.selector, args.value);
                    return {
                        content: [{
                                type: "text",
                                text: `Selected ${args.selector} with: ${args.value}`,
                            }],
                        isError: false,
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: `Failed to select ${args.selector}: ${error.message}`,
                            }],
                        isError: true,
                    };
                }
            case "puppeteer_hover":
                try {
                    
                    yield page.waitForSelector(args.selector);
                    yield page.hover(args.selector);
                    return {
                        content: [{
                                type: "text",
                                text: `Hovered ${args.selector}`,
                            }],
                        isError: false,
                    };
                }
                catch (error) {
                    return {
                        content: [{
                                type: "text",
                                text: `Failed to hover ${args.selector}: ${error.message}`,
                            }],
                        isError: true,
                    };
                }
            case "puppeteer_evaluate":
                try {
                    // Set up console listener
                    const logs = [];
                    const consoleListener = (message) => {
                        logs.push(`${message.type()}: ${message.text()}`);
                    };
                
                
                    logger.info('Page', { page });
                    page.on('console', consoleListener);
                    
                    // Execute script with proper serialization
                    logger.debug('Executing script in browser', { scriptLength: args.script.length });
                    // Wrap the script in a function that returns a serializable result
                    const result = yield page.evaluate(`(async () => {
        
             return ${args.script} ;
           
        })()`);
                    // Remove the listener to avoid memory leaks
                    page.off('console', consoleListener);
                    logger.debug('Script execution result', {
                        resultType: typeof result,
                        hasResult: result !== undefined,
                        logCount: logs.length
                    });
                    return {
                        content: [{
                                type: "text",
                                text: `Execution result:\n${JSON.stringify(result, null, 2)}\n\nConsole output:\n${logs.join('\n')}`,
                            }],
                        isError: false,
                    };
                }
                catch (error) {
                    logger.error('Script evaluation failed', { error: error instanceof Error ? error.message : String(error) });
                    return {
                        content: [{
                                type: "text",
                                text: `Script execution failed: ${error instanceof Error ? error.message : String(error)}\n\nPossible causes:\n- Syntax error in script\n- Execution timeout\n- Browser security restrictions\n- Serialization issues with complex objects`,
                            }],
                        isError: true,
                    };
                }
            default:
                return {
                    content: [{
                            type: "text",
                            text: `Unknown tool: ${name}`,
                        }],
                    isError: true,
                };
        }
    });
}
