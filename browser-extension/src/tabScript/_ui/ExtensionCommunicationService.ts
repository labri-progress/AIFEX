export default interface ExtensionCommunicationService {
    addOnMessageListener( handler : (msg : any, sender : any, sendResponse: Function) => boolean) : void;
}