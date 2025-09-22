var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import puppeteer from "puppeteer";
import { logger } from "../config/logger.js";
import { dockerConfig, npxConfig, DEFAULT_NAVIGATION_TIMEOUT } from "../config/browser.js";
// Global browser instance
let browser ;
let page;
export function ensureBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!browser) {
            logger.info('Launching browser with config:', process.env.DOCKER_CONTAINER ? 'docker' : 'npx');
            browser = yield puppeteer.launch(process.env.DOCKER_CONTAINER ? dockerConfig : npxConfig);
            const pages = yield browser.pages();
            page = pages[0];
            // Set default navigation timeout
            yield page.setDefaultNavigationTimeout(DEFAULT_NAVIGATION_TIMEOUT);
            // Enable JavaScript
            yield page.setJavaScriptEnabled(true);
            logger.info('Browser launched successfully');
        }
        return page;
    });
}
export function getDebuggerWebSocketUrl() {
    return __awaiter(this, arguments, void 0, function* (port = 9222) {
        try {
            const response = yield fetch(`http://localhost:${port}/json/version`);
            if (!response.ok) {
                throw new Error(`Failed to fetch debugger info: ${response.statusText}`);
            }
            const data = yield response.json();
            if (!data.webSocketDebuggerUrl) {
                throw new Error("No WebSocket debugger URL found. Is Chrome running with --remote-debugging-port?");
            }
            return data.webSocketDebuggerUrl;
        }
        catch (error) {
            throw new Error(`Failed to connect to Chrome debugging port ${port}: ${error.message}`);
        }
    });
}
export function connectToExistingBrowser(onConsoleMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {

            
            logger.info('Launching browser with config:', process.env.DOCKER_CONTAINER ? 'docker' : 'npx');
            browser = yield puppeteer.launch(process.env.DOCKER_CONTAINER ? dockerConfig : npxConfig);
            const pages = yield browser.pages();
                page = pages[0];
                // Set default navigation timeout
                yield page.setDefaultNavigationTimeout(DEFAULT_NAVIGATION_TIMEOUT);
                // Enable JavaScript
                yield page.setJavaScriptEnabled(true);
                logger.info('Browser launched successfully');
            yield page.setExtraHTTPHeaders({
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            });
            // Set up console message handling
            if (onConsoleMessage) {
                page.on("console", (msg) => {
                    const logEntry = `[${msg.type()}] ${msg.text()}`;
                    onConsoleMessage(logEntry);
                });
            }
            return {browser, page};
        }
        catch (error) {
            throw error;
        }
    });
}
export function closeBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        if (browser) {
            yield browser.close();
            browser = undefined;
            page = undefined;
        }
    });
}
export function getCurrentPage() {
    return __awaiter(this, void 0, void 0, function* () {
        if (browser) {
            const pages = yield browser.pages();
                page = pages[0];
            
         return page;
        }
    });
}
