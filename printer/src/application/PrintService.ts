import NaturalLanguagePrinter from "../domain/NaturalLanguagePrinter";
import PuppeteerPrinter from "../domain/PuppeteerPrinter";
import Session from "../domain/Session";
import SessionRepository from "../domain/SessionRepository";

const CACHE_SIZE = 5;

export default class PrintService {
    private readonly sessionRepository: SessionRepository;
    private mountedSessionList: Session[];

    constructor(sessionRepository: SessionRepository) {
        this.sessionRepository = sessionRepository;
        this.mountedSessionList = [];
    }

    public printSession(sessionId: string): Promise<string | undefined> {
        return this.mountSession(sessionId)
        .then((session) => {
            if (session) {
                const printer: NaturalLanguagePrinter = new NaturalLanguagePrinter();
                return printer.printSession(session);
            }
        });
    }

    public printPuppeteerSession(sessionId: string, options?: {
        headless?: boolean,
        timeout?: number,
      }): Promise<string | undefined> {
        return this.mountSession(sessionId)
        .then((session) => {
            if (session) {
                const printer: PuppeteerPrinter = new PuppeteerPrinter();
                return printer.printSession(session, options);
            }
        });
    }


    public mountSession(sessionId: string): Promise<Session | undefined> {
        const sessionInCache = this.mountedSessionList.find((session) => session.id === sessionId);
        if (sessionInCache) {
            return Promise.resolve(sessionInCache);
        }

        return this.sessionRepository.findSessionById(sessionId)
        .then((foundSession) => {
            if (foundSession)  {
                this.addSessionInCache(foundSession);
                return foundSession;
            }
        });
    }

    public addSessionInCache(session: Session): void {
        if (this.mountedSessionList.length >= CACHE_SIZE) {
            this.mountedSessionList.shift();
        }
        this.mountedSessionList[this.mountedSessionList.length] = session;
    }

}
