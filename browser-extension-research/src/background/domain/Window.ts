import Tab from "./Tab";

export default class Window {
    private _id : number;
    private _tabs : Tab[];
    private _isPrivate: boolean;

    constructor(id : number, isPrivate: boolean) {
        if (id === null || id === undefined || isNaN(id)) {
            throw new Error('cannot create ManagedWindow without id')
        }
        this._id = id;
        this._tabs = [];
        this._isPrivate = isPrivate;
    }

    get id() : number {
        return this._id;
    }

    get isPrivate(): boolean {
        return this._isPrivate;
    }

    get tabs(): Tab[] {
        return this._tabs;
    }

    hasTab(tabId : number) : boolean {
        return this._tabs.some(tab => tab.id === tabId);
    }

    connectTab(tabId: number): void {
        const tab = this._tabs.find(e => e.id === tabId);
        if (tab) {
            tab.connect();
        }
    }

    getDisconnectedTabIds() : number[] {
        return this._tabs.filter(tab => !tab.isConnected).map(tab => tab.id);
    }

    getConnectedTabIds() : number[] {
        return this._tabs.filter(tab => tab.isConnected).map(tab => tab.id);
    }

    getActivatedTabId() : number | undefined {
        return this._tabs.find(tab => tab.isActivated)?.id;
    }

    addTab(tabId : number): void {
        if (! this._tabs.find(tab => tab.id === tabId)) {
            const tab = new Tab(tabId);
            this._tabs.push(tab);
        }
    }

    removeTab(tabId : number): void {
        const findIndex = this._tabs.findIndex(tab => tab.id === tabId)
        if (findIndex !== -1 ) {
            this._tabs.splice(findIndex,1);
        }
    }

    activateTab(tabId: number): void {
        this._tabs.forEach(tab => {
            if (tab.id === tabId) {
                tab.activate();
            } else {
                tab.deActivate();
            }
        })
    }

}