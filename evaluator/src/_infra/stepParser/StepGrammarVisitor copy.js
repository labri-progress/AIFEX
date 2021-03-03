// Generated from ./src/domain/grammar/StepGrammar.g4 by ANTLR 4.7.1
// jshint ignore: start
var antlr4 = require('antlr4/index');
import StepAST from "../../domain/StepAST";
import { STEP_OPERATOR } from "../../domain/StepOperator";
import InteractionFactory from "../../domain/InteractionFactory";

// This class defines a complete generic visitor for a parse tree produced by StepGrammarParser.

function StepGrammarVisitor() {
	antlr4.tree.ParseTreeVisitor.call(this);
	return this;
}

let builder;

exports.setBuilder = function setBuilder(newBuilder) {
  builder = newBuilder;
}

StepGrammarVisitor.prototype = Object.create(antlr4.tree.ParseTreeVisitor.prototype);
StepGrammarVisitor.prototype.constructor = StepGrammarVisitor;

// Visit a parse tree produced by StepGrammarParser#action.
StepGrammarVisitor.prototype.visitAction = function(ctx) {
  let [prefix, suffix] = ctx.ID().map(value => value.getText());
  if (suffix == undefined) {
    if (ctx.SINGLE_STRING()) {
      suffix = ctx.SINGLE_STRING().getText().replace(/['"]+/g, '')
    } else if (ctx.DOUBLE_STRING()) {
      suffix = ctx.DOUBLE_STRING().getText().replace(/['"]+/g, '')
    } 
  }
  return new StepAST(InteractionFactory.createAction(prefix, suffix));
};

// Visit a parse tree produced by StepGrammarParser#string.
StepGrammarVisitor.prototype.visitString = function(ctx) {
   return ctx.getText().replace(/["']/g,'');
};


// Visit a parse tree produced by StepGrammarParser#check.
StepGrammarVisitor.prototype.visitCheck = function(ctx) {
  const stepCtx = ctx.step();
  const string = this.visitString(ctx.string());
  if (stepCtx.length ===1) {
    return new StepAST(STEP_OPERATOR.if, this.visitStep(stepCtx[0]), undefined, string);
  } else {
    return new StepAST(STEP_OPERATOR.if_else, this.visitStep(stepCtx[0]), this.visitStep(stepCtx[1]), string);
  }
};


// Visit a parse tree produced by StepGrammarParser#par_step.
StepGrammarVisitor.prototype.visitPar_step = function(ctx) {
  return this.visitStep(ctx.step());
};

// Visit a parse tree produced by StepGrammarParser#kleen_plus.
StepGrammarVisitor.prototype.visitKleen_plus = function(ctx, left) {
  if (ctx.CARDINALITY()) {
  } else {
  }
};

StepGrammarVisitor.prototype.visitIteration = function(ctx, left) {
  return new StepAST(STEP_OPERATOR.iteration, left, null, parseInt(ctx.INTEGER_NUMBER().getText()));  
}

// Visit a parse tree produced by StepGrammarParser#step.
StepGrammarVisitor.prototype.visitStep = function(ctx) {
  let [left, right] = ctx.step();

  if (ctx.action()) {
    return this.visitAction(ctx.action());
  } 
  else if (ctx.NOT()) {
    return new StepAST(STEP_OPERATOR.not, this.visitStep(left));
  } 
  else if (ctx.check()) {
    return this.visitCheck(ctx.check());
  }
  else if (ctx.OR()) {
    return new StepAST(STEP_OPERATOR.or, this.visitStep(left), this.visitStep(right));
  } 
  else if (ctx.ARROW()) {
    return new StepAST(STEP_OPERATOR.arrow, this.visitStep(left), this.visitStep(right));
  } 
  else if (ctx.PLUS()) {
    return new StepAST(STEP_OPERATOR.kleenPlus, this.visitStep(left));
  } 
  else if (ctx.iteration()) {
    return this.visitIteration(ctx.iteration(), this.visitStep(left));
  } 
  else if (ctx.par_step()) {
    return this.visitPar_step(ctx.par_step());
  } 
  else if (ctx.step().length === 2) {
    return new StepAST(STEP_OPERATOR.seq, this.visitStep(left), this.visitStep(right));
  }
};

// Visit a parse tree produced by StepGrammarParser#main.
StepGrammarVisitor.prototype.visitMain = function(ctx) {
  return this.visitStep(ctx.step())
};

exports.StepGrammarVisitor = StepGrammarVisitor;