import chai = require("chai");
import * as fs from "fs";
import "mocha";
import * as path from "path";
import AntlrStepParser from "../../src/_infra/AntlrStepParser";
import StepNFA from "../../src/_infra/StepNFA";

describe("Domain - NFA", () => {
    const parser = new AntlrStepParser();

    describe("AST to NFA", () => {

        it("create an NFA from a single action", () => {
            const stringTest = "click";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("or");
                fs.writeFileSync(path.join(__dirname, "../graph/action.dot"), dot);
            });
        });

        it("create an NFA with OR", () => {
            const stringTest = "click or search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("or");
                fs.writeFileSync(path.join(__dirname, "../graph/or.dot"), dot);
            });
        });

        it("create an NFA with AND", () => {
            const stringTest = "click and search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("and");
                fs.writeFileSync(path.join(__dirname, "../graph/and.dot"), dot);
            });
        });

        it("create an NFA with =>", () => {
            const stringTest = "click => search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("arrow");
                fs.writeFileSync(path.join(__dirname, "../graph/arrow.dot"), dot);
            });
        });

        it("create an NFA with sequence", () => {
            const stringTest = "click search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("or");
                fs.writeFileSync(path.join(__dirname, "../graph/seq.dot"), dot);
            });
        });

        it("create an NFA with a not", () => {
            const stringTest = "!search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("not");
                fs.writeFileSync(path.join(__dirname, "../graph/not.dot"), dot);
            });
        });

        it("create an NFA with a kleenplus", () => {
            const stringTest = "search+";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("kleenPlus");
                fs.writeFileSync(path.join(__dirname, "../graph/kleenPlus.dot"), dot);
            });
        });

        it("create an NFA with a kleenplus of size 3", () => {
            const stringTest = "search[3]";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("iteration");
                fs.writeFileSync(path.join(__dirname, "../graph/iteration.dot"), dot);
            });
        });


    });

    describe("NFA to DFA", () => {
        it("create an DFA from OR NFA", () => {
            const stringTest = "click or search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                return nfa.toDFA();
            }).then((dfa) => {
                const dot = dfa.toDot("DFA_or");
                fs.writeFileSync(path.join(__dirname, "../graph/dfa_or.dot"), dot);
            });
        });

        it("create an NFA for NOR", () => {
            const stringTest = "click or search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                return nfa.toDFA();
            }).then((dfa) => {
                return dfa.negation();
            }).then((negOr) => {
                const dot = negOr.toDot("Nor");
                fs.writeFileSync(path.join(__dirname, "../graph/not_or.dot"), dot);
            });

        });

        it("create an DFA from AND NFA", () => {
            const stringTest = "click and search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                return nfa.toDFA();
            }).then((dfa) => {
                const dot = dfa.toDot("DFA_and");
                fs.writeFileSync(path.join(__dirname, "../graph/dfa_and.dot"), dot);
            });
        });

        it("create an DFA from ARROW NFA", () => {
            const stringTest = "click => search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                return nfa.toDFA();
            }).then((dfa) => {
                const dot = dfa.toDot("DFA_arrow");
                fs.writeFileSync(path.join(__dirname, "../graph/dfa_arrow.dot"), dot);
            });
        });

        it("create an DFA from SEQ", () => {
            const stringTest = "click search";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                return nfa.toDFA();
            }).then((dfa) => {
                const dot = dfa.toDot("DFA_seq");
                fs.writeFileSync(path.join(__dirname, "../graph/dfa_seq.dot"), dot);
            });
        });

        it("create an DFA from Action", () => {
            const stringTest = "click";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                return nfa.toDFA();
            }).then((dfa) => {
                const dot = dfa.toDot("DFA_action");
                fs.writeFileSync(path.join(__dirname, "../graph/dfa_action.dot"), dot);
            });
        });

        it("create a complex DFA", () => {
            const stringTest = "((typeSearch clickSearchButton) or (typeSearch pressEnter)) => addToBasket => checkout";
            return parser.parseStepExpression(stringTest).then((AST) => {
                return AST.buildNFA();
            }).then((nfa: StepNFA) => {
                const dot = nfa.toDot("NFA_Checkout");
                fs.writeFileSync(path.join(__dirname, "../graph/nfa_Checkout.dot"), dot);
                return nfa.toDFA();
            }).then((dfa) => {
                const dot = dfa.toDot("DFA_Checkout");
                fs.writeFileSync(path.join(__dirname, "../graph/dfa_Checkout.dot"), dot);
            });
        });

    });

});
