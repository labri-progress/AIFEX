// Generated from ./src/domain/grammar/StepGrammar.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');

// This class defines a complete listener for a parse tree produced by StepGrammarParser.
function StepGrammarListener() {
	antlr4.tree.ParseTreeListener.call(this);
	return this;
}

StepGrammarListener.prototype = Object.create(antlr4.tree.ParseTreeListener.prototype);
StepGrammarListener.prototype.constructor = StepGrammarListener;

// Enter a parse tree produced by StepGrammarParser#action.
StepGrammarListener.prototype.enterAction = function(ctx) {
};

// Exit a parse tree produced by StepGrammarParser#action.
StepGrammarListener.prototype.exitAction = function(ctx) {
};


// Enter a parse tree produced by StepGrammarParser#iteration.
StepGrammarListener.prototype.enterIteration = function(ctx) {
};

// Exit a parse tree produced by StepGrammarParser#iteration.
StepGrammarListener.prototype.exitIteration = function(ctx) {
};


// Enter a parse tree produced by StepGrammarParser#string.
StepGrammarListener.prototype.enterString = function(ctx) {
};

// Exit a parse tree produced by StepGrammarParser#string.
StepGrammarListener.prototype.exitString = function(ctx) {
};


// Enter a parse tree produced by StepGrammarParser#par_step.
StepGrammarListener.prototype.enterPar_step = function(ctx) {
};

// Exit a parse tree produced by StepGrammarParser#par_step.
StepGrammarListener.prototype.exitPar_step = function(ctx) {
};


// Enter a parse tree produced by StepGrammarParser#step.
StepGrammarListener.prototype.enterStep = function(ctx) {
};

// Exit a parse tree produced by StepGrammarParser#step.
StepGrammarListener.prototype.exitStep = function(ctx) {
};


// Enter a parse tree produced by StepGrammarParser#main.
StepGrammarListener.prototype.enterMain = function(ctx) {
};

// Exit a parse tree produced by StepGrammarParser#main.
StepGrammarListener.prototype.exitMain = function(ctx) {
};



exports.StepGrammarListener = StepGrammarListener;