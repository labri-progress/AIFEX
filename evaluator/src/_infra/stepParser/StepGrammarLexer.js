// Generated from ./src/domain/grammar/StepGrammar.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');


var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0002\u0012d\b\u0001\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004",
    "\u0004\t\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t",
    "\u0007\u0004\b\t\b\u0004\t\t\t\u0004\n\t\n\u0004\u000b\t\u000b\u0004",
    "\f\t\f\u0004\r\t\r\u0004\u000e\t\u000e\u0004\u000f\t\u000f\u0004\u0010",
    "\t\u0010\u0004\u0011\t\u0011\u0004\u0012\t\u0012\u0003\u0002\u0003\u0002",
    "\u0003\u0003\u0003\u0003\u0003\u0004\u0003\u0004\u0003\u0005\u0003\u0005",
    "\u0003\u0006\u0003\u0006\u0003\u0007\u0003\u0007\u0003\u0007\u0003\b",
    "\u0003\b\u0003\b\u0003\t\u0003\t\u0003\t\u0003\n\u0003\n\u0003\n\u0003",
    "\n\u0003\n\u0003\u000b\u0003\u000b\u0003\f\u0003\f\u0003\r\u0003\r\u0003",
    "\u000e\u0006\u000eE\n\u000e\r\u000e\u000e\u000eF\u0003\u000f\u0003\u000f",
    "\u0006\u000fK\n\u000f\r\u000f\u000e\u000fL\u0003\u000f\u0003\u000f\u0003",
    "\u0010\u0003\u0010\u0006\u0010S\n\u0010\r\u0010\u000e\u0010T\u0003\u0010",
    "\u0003\u0010\u0003\u0011\u0006\u0011Z\n\u0011\r\u0011\u000e\u0011[\u0003",
    "\u0012\u0006\u0012_\n\u0012\r\u0012\u000e\u0012`\u0003\u0012\u0003\u0012",
    "\u0002\u0002\u0013\u0003\u0003\u0005\u0004\u0007\u0005\t\u0006\u000b",
    "\u0007\r\b\u000f\t\u0011\n\u0013\u000b\u0015\f\u0017\r\u0019\u0002\u001b",
    "\u000e\u001d\u000f\u001f\u0010!\u0011#\u0012\u0003\u0002\u0006\u0003",
    "\u0002))\u0003\u0002$$\u0007\u0002//2;C\\aac|\u0005\u0002\u000b\f\u000f",
    "\u000f\"\"\u0002g\u0002\u0003\u0003\u0002\u0002\u0002\u0002\u0005\u0003",
    "\u0002\u0002\u0002\u0002\u0007\u0003\u0002\u0002\u0002\u0002\t\u0003",
    "\u0002\u0002\u0002\u0002\u000b\u0003\u0002\u0002\u0002\u0002\r\u0003",
    "\u0002\u0002\u0002\u0002\u000f\u0003\u0002\u0002\u0002\u0002\u0011\u0003",
    "\u0002\u0002\u0002\u0002\u0013\u0003\u0002\u0002\u0002\u0002\u0015\u0003",
    "\u0002\u0002\u0002\u0002\u0017\u0003\u0002\u0002\u0002\u0002\u001b\u0003",
    "\u0002\u0002\u0002\u0002\u001d\u0003\u0002\u0002\u0002\u0002\u001f\u0003",
    "\u0002\u0002\u0002\u0002!\u0003\u0002\u0002\u0002\u0002#\u0003\u0002",
    "\u0002\u0002\u0003%\u0003\u0002\u0002\u0002\u0005\'\u0003\u0002\u0002",
    "\u0002\u0007)\u0003\u0002\u0002\u0002\t+\u0003\u0002\u0002\u0002\u000b",
    "-\u0003\u0002\u0002\u0002\r/\u0003\u0002\u0002\u0002\u000f2\u0003\u0002",
    "\u0002\u0002\u00115\u0003\u0002\u0002\u0002\u00138\u0003\u0002\u0002",
    "\u0002\u0015=\u0003\u0002\u0002\u0002\u0017?\u0003\u0002\u0002\u0002",
    "\u0019A\u0003\u0002\u0002\u0002\u001bD\u0003\u0002\u0002\u0002\u001d",
    "H\u0003\u0002\u0002\u0002\u001fP\u0003\u0002\u0002\u0002!Y\u0003\u0002",
    "\u0002\u0002#^\u0003\u0002\u0002\u0002%&\u0007&\u0002\u0002&\u0004\u0003",
    "\u0002\u0002\u0002\'(\u0007]\u0002\u0002(\u0006\u0003\u0002\u0002\u0002",
    ")*\u0007_\u0002\u0002*\b\u0003\u0002\u0002\u0002+,\u0007*\u0002\u0002",
    ",\n\u0003\u0002\u0002\u0002-.\u0007+\u0002\u0002.\f\u0003\u0002\u0002",
    "\u0002/0\u0007q\u0002\u000201\u0007t\u0002\u00021\u000e\u0003\u0002",
    "\u0002\u000223\u0007?\u0002\u000234\u0007@\u0002\u00024\u0010\u0003",
    "\u0002\u0002\u000256\u0007k\u0002\u000267\u0007h\u0002\u00027\u0012",
    "\u0003\u0002\u0002\u000289\u0007g\u0002\u00029:\u0007n\u0002\u0002:",
    ";\u0007u\u0002\u0002;<\u0007g\u0002\u0002<\u0014\u0003\u0002\u0002\u0002",
    "=>\u0007#\u0002\u0002>\u0016\u0003\u0002\u0002\u0002?@\u0007-\u0002",
    "\u0002@\u0018\u0003\u0002\u0002\u0002AB\u00042;\u0002B\u001a\u0003\u0002",
    "\u0002\u0002CE\u0005\u0019\r\u0002DC\u0003\u0002\u0002\u0002EF\u0003",
    "\u0002\u0002\u0002FD\u0003\u0002\u0002\u0002FG\u0003\u0002\u0002\u0002",
    "G\u001c\u0003\u0002\u0002\u0002HJ\u0007)\u0002\u0002IK\n\u0002\u0002",
    "\u0002JI\u0003\u0002\u0002\u0002KL\u0003\u0002\u0002\u0002LJ\u0003\u0002",
    "\u0002\u0002LM\u0003\u0002\u0002\u0002MN\u0003\u0002\u0002\u0002NO\u0007",
    ")\u0002\u0002O\u001e\u0003\u0002\u0002\u0002PR\u0007$\u0002\u0002QS",
    "\n\u0003\u0002\u0002RQ\u0003\u0002\u0002\u0002ST\u0003\u0002\u0002\u0002",
    "TR\u0003\u0002\u0002\u0002TU\u0003\u0002\u0002\u0002UV\u0003\u0002\u0002",
    "\u0002VW\u0007$\u0002\u0002W \u0003\u0002\u0002\u0002XZ\t\u0004\u0002",
    "\u0002YX\u0003\u0002\u0002\u0002Z[\u0003\u0002\u0002\u0002[Y\u0003\u0002",
    "\u0002\u0002[\\\u0003\u0002\u0002\u0002\\\"\u0003\u0002\u0002\u0002",
    "]_\t\u0005\u0002\u0002^]\u0003\u0002\u0002\u0002_`\u0003\u0002\u0002",
    "\u0002`^\u0003\u0002\u0002\u0002`a\u0003\u0002\u0002\u0002ab\u0003\u0002",
    "\u0002\u0002bc\b\u0012\u0002\u0002c$\u0003\u0002\u0002\u0002\b\u0002",
    "FLT[`\u0003\b\u0002\u0002"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

function StepGrammarLexer(input) {
	antlr4.Lexer.call(this, input);
    this._interp = new antlr4.atn.LexerATNSimulator(this, atn, decisionsToDFA, new antlr4.PredictionContextCache());
    return this;
}

StepGrammarLexer.prototype = Object.create(antlr4.Lexer.prototype);
StepGrammarLexer.prototype.constructor = StepGrammarLexer;

Object.defineProperty(StepGrammarLexer.prototype, "atn", {
        get : function() {
                return atn;
        }
});

StepGrammarLexer.EOF = antlr4.Token.EOF;
StepGrammarLexer.T__0 = 1;
StepGrammarLexer.T__1 = 2;
StepGrammarLexer.T__2 = 3;
StepGrammarLexer.T__3 = 4;
StepGrammarLexer.T__4 = 5;
StepGrammarLexer.OR = 6;
StepGrammarLexer.ARROW = 7;
StepGrammarLexer.IF = 8;
StepGrammarLexer.ELSE = 9;
StepGrammarLexer.NOT = 10;
StepGrammarLexer.PLUS = 11;
StepGrammarLexer.INTEGER_NUMBER = 12;
StepGrammarLexer.SINGLE_STRING = 13;
StepGrammarLexer.DOUBLE_STRING = 14;
StepGrammarLexer.ID = 15;
StepGrammarLexer.WS = 16;

StepGrammarLexer.prototype.channelNames = [ "DEFAULT_TOKEN_CHANNEL", "HIDDEN" ];

StepGrammarLexer.prototype.modeNames = [ "DEFAULT_MODE" ];

StepGrammarLexer.prototype.literalNames = [ null, "'$'", "'['", "']'", "'('", 
                                            "')'", "'or'", "'=>'", "'if'", 
                                            "'else'", "'!'", "'+'" ];

StepGrammarLexer.prototype.symbolicNames = [ null, null, null, null, null, 
                                             null, "OR", "ARROW", "IF", 
                                             "ELSE", "NOT", "PLUS", "INTEGER_NUMBER", 
                                             "SINGLE_STRING", "DOUBLE_STRING", 
                                             "ID", "WS" ];

StepGrammarLexer.prototype.ruleNames = [ "T__0", "T__1", "T__2", "T__3", 
                                         "T__4", "OR", "ARROW", "IF", "ELSE", 
                                         "NOT", "PLUS", "DIGIT", "INTEGER_NUMBER", 
                                         "SINGLE_STRING", "DOUBLE_STRING", 
                                         "ID", "WS" ];

StepGrammarLexer.prototype.grammarFileName = "StepGrammar.g4";



exports.StepGrammarLexer = StepGrammarLexer;

