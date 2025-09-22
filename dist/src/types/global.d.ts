declare global {
    interface Window {
        mcpHelper?: {
            logs: string[];
            originalLog: typeof console.log;
        };
    }
}
export interface BrowserState {
    consoleLogs: string[];
    screenshots: Map<string, string>;
}
export interface ActiveTab {
    page: import('puppeteer').Page;
    url: string;
    title: string;
}
export {};
