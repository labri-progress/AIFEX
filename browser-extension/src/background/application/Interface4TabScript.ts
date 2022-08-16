
export default interface Interface4TabScript {
  processNewAction(kind: string, value: string): Promise<void>;
}