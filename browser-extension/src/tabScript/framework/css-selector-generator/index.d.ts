declare interface CssSelectorGeneratorParams {
    selectors?: string[];
    root?: Element;
    blacklist?: (RegExp|string)[];
    whitelist?: string[];
    combineWithinSelector?: boolean;
    combineBetweenSelectors?: boolean;
    includeTag?: boolean;
    maxCandidates?: number;
  
  }
  declare module 'css-selector-generator' {
    export default function getCssSelector(targetElement: Element, options: CssSelectorGeneratorParams): string;
  }