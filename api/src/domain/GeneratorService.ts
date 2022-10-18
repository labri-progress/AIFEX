
export default interface GeneratorService {
    generateTest(sessionId: string): Promise<string | undefined>;
}