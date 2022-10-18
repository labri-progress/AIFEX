import Action from "./Action";

export function generateAction(action: Action): string {
    switch (action.kind) {
        case 'Click':
            return `await page.click('${action.value}');\n`;
        case 'Edit':
            return `await page.fill('${action.value}', 'TODO');\n`;	
        default :
            return `//TODO: ${action.kind} ${action.value}\n`;
    }
}
