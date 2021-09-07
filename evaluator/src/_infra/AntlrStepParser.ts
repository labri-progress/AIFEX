import antlr4, { Recognizer } from "antlr4";
import { ErrorListener } from "antlr4/error/ErrorListener";
import IStepParser from "../domain/IStepParser";
import StepAST from "./StepAST";
// tslint:disable-next-line: no-var-requires
const grammarLexer = require("./stepParser/StepGrammarLexer.js");
// tslint:disable-next-line: no-var-requires
const grammarParser = require("./stepParser/StepGrammarParser.js");
// tslint:disable-next-line: no-var-requires
const grammarVisitor = require("./stepParser/StepGrammarVisitor.js");

export default class AntlrStepParser implements IStepParser {

    public parseStepExpression(text: string): Promise<StepAST> {
        return new Promise((resolve, reject) => {
            const chars = new antlr4.InputStream(text);
            const lexer = new grammarLexer.StepGrammarLexer(chars);
            const tokens  = new antlr4.CommonTokenStream(lexer);
            const parser = new grammarParser.StepGrammarParser(tokens);
            parser.removeErrorListeners();
            parser.addErrorListener(new ErrorHandler(reject));
            parser.buildParseTrees = true;

            const tree = parser.main();
            const visitor = new grammarVisitor.StepGrammarVisitor();
            const stepExpression = visitor.visitMain(tree);
            resolve(stepExpression);
        });

    }

}

// tslint:disable-next-line: max-classes-per-file
class ErrorHandler extends ErrorListener {
    public rejectFunc: (text: string) => void;

    constructor(rejectFunc: (text: string) => void) {
        super();
        this.rejectFunc = rejectFunc;
    }

    public syntaxError(recognizer: Recognizer, offendingSymbol: any, line: number, column: number, msg: string): void {
        this.rejectFunc(msg);
    }
  }
