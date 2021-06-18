import Printer from "./Printer";

export default class NaturalLanguagePrinter extends Printer {


    protected buildTestHeader(description: string, options: { headless?: boolean | undefined; timeout?: number | undefined; }): string {
        return ""
    }
    protected buildTestFooter(): string {
        return ""
    }
    protected printStartAction(url: string): string {
        return `start : (baseURL = ${url})`;
    }
    protected printClickAction(css: string): string {
        return "click on " + css; 
    }
    protected printKeyupAction(keyCode: string): string {
        return "release key " + keyCode; 
    }
    protected printMouseOverAction(selector: string): string {
        return "hover " + selector; 
    }
    protected printTypeAction(selector: string, text: string): string {
        return "type text: " + text + " in:" + selector;
    }
    protected printChangeAction(selector: string, value: string): string {
        return "change: selector with" + value;
    }
}
