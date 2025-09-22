import { Page } from "puppeteer";
export declare function ensureBrowser(): Promise<Page>;
export declare function getDebuggerWebSocketUrl(port?: number): Promise<string>;
export declare function connectToExistingBrowser(wsEndpoint: string, targetUrl?: string, onConsoleMessage?: (logEntry: string) => void): Promise<Page>;
export declare function closeBrowser(): Promise<void>;
export declare function getCurrentPage(): Page | undefined;
