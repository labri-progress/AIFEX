// Generated from ./src/domain/grammar/StepGrammar.g4 by ANTLR 4.7.2
// jshint ignore: start
var antlr4 = require('antlr4/index');
var StepGrammarListener = require('./StepGrammarListener').StepGrammarListener;
var StepGrammarVisitor = require('./StepGrammarVisitor').StepGrammarVisitor;

var grammarFileName = "StepGrammar.g4";

var serializedATN = ["\u0003\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964",
    "\u0003\u0012@\u0004\u0002\t\u0002\u0004\u0003\t\u0003\u0004\u0004\t",
    "\u0004\u0004\u0005\t\u0005\u0004\u0006\t\u0006\u0004\u0007\t\u0007\u0003",
    "\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0003",
    "\u0002\u0003\u0002\u0003\u0002\u0003\u0002\u0005\u0002\u0019\n\u0002",
    "\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0003\u0004\u0003\u0004",
    "\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0005\u0003\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0005\u0006*\n\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006",
    "\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0003\u0006\u0007\u0006",
    "8\n\u0006\f\u0006\u000e\u0006;\u000b\u0006\u0003\u0007\u0003\u0007\u0003",
    "\u0007\u0003\u0007\u0002\u0003\n\b\u0002\u0004\u0006\b\n\f\u0002\u0003",
    "\u0003\u0002\u000f\u0010\u0002C\u0002\u0018\u0003\u0002\u0002\u0002",
    "\u0004\u001a\u0003\u0002\u0002\u0002\u0006\u001e\u0003\u0002\u0002\u0002",
    "\b \u0003\u0002\u0002\u0002\n)\u0003\u0002\u0002\u0002\f<\u0003\u0002",
    "\u0002\u0002\u000e\u0019\u0007\u0011\u0002\u0002\u000f\u0010\u0007\u0011",
    "\u0002\u0002\u0010\u0011\u0007\u0003\u0002\u0002\u0011\u0019\u0007\u000f",
    "\u0002\u0002\u0012\u0013\u0007\u0011\u0002\u0002\u0013\u0014\u0007\u0003",
    "\u0002\u0002\u0014\u0019\u0007\u0010\u0002\u0002\u0015\u0016\u0007\u0011",
    "\u0002\u0002\u0016\u0017\u0007\u0003\u0002\u0002\u0017\u0019\u0007\u0011",
    "\u0002\u0002\u0018\u000e\u0003\u0002\u0002\u0002\u0018\u000f\u0003\u0002",
    "\u0002\u0002\u0018\u0012\u0003\u0002\u0002\u0002\u0018\u0015\u0003\u0002",
    "\u0002\u0002\u0019\u0003\u0003\u0002\u0002\u0002\u001a\u001b\u0007\u0004",
    "\u0002\u0002\u001b\u001c\u0007\u000e\u0002\u0002\u001c\u001d\u0007\u0005",
    "\u0002\u0002\u001d\u0005\u0003\u0002\u0002\u0002\u001e\u001f\t\u0002",
    "\u0002\u0002\u001f\u0007\u0003\u0002\u0002\u0002 !\u0007\u0006\u0002",
    "\u0002!\"\u0005\n\u0006\u0002\"#\u0007\u0007\u0002\u0002#\t\u0003\u0002",
    "\u0002\u0002$%\b\u0006\u0001\u0002%*\u0005\u0002\u0002\u0002&\'\u0007",
    "\f\u0002\u0002\'*\u0005\n\u0006\u0007(*\u0005\b\u0005\u0002)$\u0003",
    "\u0002\u0002\u0002)&\u0003\u0002\u0002\u0002)(\u0003\u0002\u0002\u0002",
    "*9\u0003\u0002\u0002\u0002+,\f\t\u0002\u0002,8\u0005\n\u0006\n-.\f\b",
    "\u0002\u0002./\u0007\b\u0002\u0002/8\u0005\n\u0006\t01\f\u0004\u0002",
    "\u000212\u0007\t\u0002\u000228\u0005\n\u0006\u000534\f\u0006\u0002\u0002",
    "48\u0007\r\u0002\u000256\f\u0005\u0002\u000268\u0005\u0004\u0003\u0002",
    "7+\u0003\u0002\u0002\u00027-\u0003\u0002\u0002\u000270\u0003\u0002\u0002",
    "\u000273\u0003\u0002\u0002\u000275\u0003\u0002\u0002\u00028;\u0003\u0002",
    "\u0002\u000297\u0003\u0002\u0002\u00029:\u0003\u0002\u0002\u0002:\u000b",
    "\u0003\u0002\u0002\u0002;9\u0003\u0002\u0002\u0002<=\u0005\n\u0006\u0002",
    "=>\u0007\u0002\u0002\u0003>\r\u0003\u0002\u0002\u0002\u0006\u0018)7",
    "9"].join("");


var atn = new antlr4.atn.ATNDeserializer().deserialize(serializedATN);

var decisionsToDFA = atn.decisionToState.map( function(ds, index) { return new antlr4.dfa.DFA(ds, index); });

var sharedContextCache = new antlr4.PredictionContextCache();

var literalNames = [ null, "'$'", "'['", "']'", "'('", "')'", "'or'", "'=>'", 
                     "'if'", "'else'", "'!'", "'+'" ];

var symbolicNames = [ null, null, null, null, null, null, "OR", "ARROW", 
                      "IF", "ELSE", "NOT", "PLUS", "INTEGER_NUMBER", "SINGLE_STRING", 
                      "DOUBLE_STRING", "ID", "WS" ];

var ruleNames =  [ "action", "iteration", "string", "par_step", "step", 
                   "main" ];

function StepGrammarParser (input) {
	antlr4.Parser.call(this, input);
    this._interp = new antlr4.atn.ParserATNSimulator(this, atn, decisionsToDFA, sharedContextCache);
    this.ruleNames = ruleNames;
    this.literalNames = literalNames;
    this.symbolicNames = symbolicNames;
    return this;
}

StepGrammarParser.prototype = Object.create(antlr4.Parser.prototype);
StepGrammarParser.prototype.constructor = StepGrammarParser;

Object.defineProperty(StepGrammarParser.prototype, "atn", {
	get : function() {
		return atn;
	}
});

StepGrammarParser.EOF = antlr4.Token.EOF;
StepGrammarParser.T__0 = 1;
StepGrammarParser.T__1 = 2;
StepGrammarParser.T__2 = 3;
StepGrammarParser.T__3 = 4;
StepGrammarParser.T__4 = 5;
StepGrammarParser.OR = 6;
StepGrammarParser.ARROW = 7;
StepGrammarParser.IF = 8;
StepGrammarParser.ELSE = 9;
StepGrammarParser.NOT = 10;
StepGrammarParser.PLUS = 11;
StepGrammarParser.INTEGER_NUMBER = 12;
StepGrammarParser.SINGLE_STRING = 13;
StepGrammarParser.DOUBLE_STRING = 14;
StepGrammarParser.ID = 15;
StepGrammarParser.WS = 16;

StepGrammarParser.RULE_action = 0;
StepGrammarParser.RULE_iteration = 1;
StepGrammarParser.RULE_string = 2;
StepGrammarParser.RULE_par_step = 3;
StepGrammarParser.RULE_step = 4;
StepGrammarParser.RULE_main = 5;

function ActionContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = StepGrammarParser.RULE_action;
    return this;
}

ActionContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
ActionContext.prototype.constructor = ActionContext;

ActionContext.prototype.ID = function(i) {
	if(i===undefined) {
		i = null;
	}
    if(i===null) {
        return this.getTokens(StepGrammarParser.ID);
    } else {
        return this.getToken(StepGrammarParser.ID, i);
    }
};


ActionContext.prototype.SINGLE_STRING = function() {
    return this.getToken(StepGrammarParser.SINGLE_STRING, 0);
};

ActionContext.prototype.DOUBLE_STRING = function() {
    return this.getToken(StepGrammarParser.DOUBLE_STRING, 0);
};

ActionContext.prototype.enterRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.enterAction(this);
	}
};

ActionContext.prototype.exitRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.exitAction(this);
	}
};

ActionContext.prototype.accept = function(visitor) {
    if ( visitor instanceof StepGrammarVisitor ) {
        return visitor.visitAction(this);
    } else {
        return visitor.visitChildren(this);
    }
};




StepGrammarParser.ActionContext = ActionContext;

StepGrammarParser.prototype.action = function() {

    var localctx = new ActionContext(this, this._ctx, this.state);
    this.enterRule(localctx, 0, StepGrammarParser.RULE_action);
    try {
        this.state = 22;
        this._errHandler.sync(this);
        var la_ = this._interp.adaptivePredict(this._input,0,this._ctx);
        switch(la_) {
        case 1:
            this.enterOuterAlt(localctx, 1);
            this.state = 12;
            this.match(StepGrammarParser.ID);
            break;

        case 2:
            this.enterOuterAlt(localctx, 2);
            this.state = 13;
            this.match(StepGrammarParser.ID);
            this.state = 14;
            this.match(StepGrammarParser.T__0);
            this.state = 15;
            this.match(StepGrammarParser.SINGLE_STRING);
            break;

        case 3:
            this.enterOuterAlt(localctx, 3);
            this.state = 16;
            this.match(StepGrammarParser.ID);
            this.state = 17;
            this.match(StepGrammarParser.T__0);
            this.state = 18;
            this.match(StepGrammarParser.DOUBLE_STRING);
            break;

        case 4:
            this.enterOuterAlt(localctx, 4);
            this.state = 19;
            this.match(StepGrammarParser.ID);
            this.state = 20;
            this.match(StepGrammarParser.T__0);
            this.state = 21;
            this.match(StepGrammarParser.ID);
            break;

        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function IterationContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = StepGrammarParser.RULE_iteration;
    return this;
}

IterationContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
IterationContext.prototype.constructor = IterationContext;

IterationContext.prototype.INTEGER_NUMBER = function() {
    return this.getToken(StepGrammarParser.INTEGER_NUMBER, 0);
};

IterationContext.prototype.enterRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.enterIteration(this);
	}
};

IterationContext.prototype.exitRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.exitIteration(this);
	}
};

IterationContext.prototype.accept = function(visitor) {
    if ( visitor instanceof StepGrammarVisitor ) {
        return visitor.visitIteration(this);
    } else {
        return visitor.visitChildren(this);
    }
};




StepGrammarParser.IterationContext = IterationContext;

StepGrammarParser.prototype.iteration = function() {

    var localctx = new IterationContext(this, this._ctx, this.state);
    this.enterRule(localctx, 2, StepGrammarParser.RULE_iteration);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 24;
        this.match(StepGrammarParser.T__1);
        this.state = 25;
        this.match(StepGrammarParser.INTEGER_NUMBER);
        this.state = 26;
        this.match(StepGrammarParser.T__2);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function StringContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = StepGrammarParser.RULE_string;
    return this;
}

StringContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StringContext.prototype.constructor = StringContext;

StringContext.prototype.SINGLE_STRING = function() {
    return this.getToken(StepGrammarParser.SINGLE_STRING, 0);
};

StringContext.prototype.DOUBLE_STRING = function() {
    return this.getToken(StepGrammarParser.DOUBLE_STRING, 0);
};

StringContext.prototype.enterRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.enterString(this);
	}
};

StringContext.prototype.exitRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.exitString(this);
	}
};

StringContext.prototype.accept = function(visitor) {
    if ( visitor instanceof StepGrammarVisitor ) {
        return visitor.visitString(this);
    } else {
        return visitor.visitChildren(this);
    }
};




StepGrammarParser.StringContext = StringContext;

StepGrammarParser.prototype.string = function() {

    var localctx = new StringContext(this, this._ctx, this.state);
    this.enterRule(localctx, 4, StepGrammarParser.RULE_string);
    var _la = 0; // Token type
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 28;
        _la = this._input.LA(1);
        if(!(_la===StepGrammarParser.SINGLE_STRING || _la===StepGrammarParser.DOUBLE_STRING)) {
        this._errHandler.recoverInline(this);
        }
        else {
        	this._errHandler.reportMatch(this);
            this.consume();
        }
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function Par_stepContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = StepGrammarParser.RULE_par_step;
    return this;
}

Par_stepContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
Par_stepContext.prototype.constructor = Par_stepContext;

Par_stepContext.prototype.step = function() {
    return this.getTypedRuleContext(StepContext,0);
};

Par_stepContext.prototype.enterRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.enterPar_step(this);
	}
};

Par_stepContext.prototype.exitRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.exitPar_step(this);
	}
};

Par_stepContext.prototype.accept = function(visitor) {
    if ( visitor instanceof StepGrammarVisitor ) {
        return visitor.visitPar_step(this);
    } else {
        return visitor.visitChildren(this);
    }
};




StepGrammarParser.Par_stepContext = Par_stepContext;

StepGrammarParser.prototype.par_step = function() {

    var localctx = new Par_stepContext(this, this._ctx, this.state);
    this.enterRule(localctx, 6, StepGrammarParser.RULE_par_step);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 30;
        this.match(StepGrammarParser.T__3);
        this.state = 31;
        this.step(0);
        this.state = 32;
        this.match(StepGrammarParser.T__4);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};

function StepContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = StepGrammarParser.RULE_step;
    return this;
}

StepContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
StepContext.prototype.constructor = StepContext;

StepContext.prototype.action = function() {
    return this.getTypedRuleContext(ActionContext,0);
};

StepContext.prototype.NOT = function() {
    return this.getToken(StepGrammarParser.NOT, 0);
};

StepContext.prototype.step = function(i) {
    if(i===undefined) {
        i = null;
    }
    if(i===null) {
        return this.getTypedRuleContexts(StepContext);
    } else {
        return this.getTypedRuleContext(StepContext,i);
    }
};

StepContext.prototype.par_step = function() {
    return this.getTypedRuleContext(Par_stepContext,0);
};

StepContext.prototype.OR = function() {
    return this.getToken(StepGrammarParser.OR, 0);
};

StepContext.prototype.ARROW = function() {
    return this.getToken(StepGrammarParser.ARROW, 0);
};

StepContext.prototype.PLUS = function() {
    return this.getToken(StepGrammarParser.PLUS, 0);
};

StepContext.prototype.iteration = function() {
    return this.getTypedRuleContext(IterationContext,0);
};

StepContext.prototype.enterRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.enterStep(this);
	}
};

StepContext.prototype.exitRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.exitStep(this);
	}
};

StepContext.prototype.accept = function(visitor) {
    if ( visitor instanceof StepGrammarVisitor ) {
        return visitor.visitStep(this);
    } else {
        return visitor.visitChildren(this);
    }
};



StepGrammarParser.prototype.step = function(_p) {
	if(_p===undefined) {
	    _p = 0;
	}
    var _parentctx = this._ctx;
    var _parentState = this.state;
    var localctx = new StepContext(this, this._ctx, _parentState);
    var _prevctx = localctx;
    var _startState = 8;
    this.enterRecursionRule(localctx, 8, StepGrammarParser.RULE_step, _p);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 39;
        this._errHandler.sync(this);
        switch(this._input.LA(1)) {
        case StepGrammarParser.ID:
            this.state = 35;
            this.action();
            break;
        case StepGrammarParser.NOT:
            this.state = 36;
            this.match(StepGrammarParser.NOT);
            this.state = 37;
            this.step(5);
            break;
        case StepGrammarParser.T__3:
            this.state = 38;
            this.par_step();
            break;
        default:
            throw new antlr4.error.NoViableAltException(this);
        }
        this._ctx.stop = this._input.LT(-1);
        this.state = 55;
        this._errHandler.sync(this);
        var _alt = this._interp.adaptivePredict(this._input,3,this._ctx)
        while(_alt!=2 && _alt!=antlr4.atn.ATN.INVALID_ALT_NUMBER) {
            if(_alt===1) {
                if(this._parseListeners!==null) {
                    this.triggerExitRuleEvent();
                }
                _prevctx = localctx;
                this.state = 53;
                this._errHandler.sync(this);
                var la_ = this._interp.adaptivePredict(this._input,2,this._ctx);
                switch(la_) {
                case 1:
                    localctx = new StepContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, StepGrammarParser.RULE_step);
                    this.state = 41;
                    if (!( this.precpred(this._ctx, 7))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 7)");
                    }
                    this.state = 42;
                    this.step(8);
                    break;

                case 2:
                    localctx = new StepContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, StepGrammarParser.RULE_step);
                    this.state = 43;
                    if (!( this.precpred(this._ctx, 6))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 6)");
                    }
                    this.state = 44;
                    this.match(StepGrammarParser.OR);
                    this.state = 45;
                    this.step(7);
                    break;

                case 3:
                    localctx = new StepContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, StepGrammarParser.RULE_step);
                    this.state = 46;
                    if (!( this.precpred(this._ctx, 2))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 2)");
                    }
                    this.state = 47;
                    this.match(StepGrammarParser.ARROW);
                    this.state = 48;
                    this.step(3);
                    break;

                case 4:
                    localctx = new StepContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, StepGrammarParser.RULE_step);
                    this.state = 49;
                    if (!( this.precpred(this._ctx, 4))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 4)");
                    }
                    this.state = 50;
                    this.match(StepGrammarParser.PLUS);
                    break;

                case 5:
                    localctx = new StepContext(this, _parentctx, _parentState);
                    this.pushNewRecursionContext(localctx, _startState, StepGrammarParser.RULE_step);
                    this.state = 51;
                    if (!( this.precpred(this._ctx, 3))) {
                        throw new antlr4.error.FailedPredicateException(this, "this.precpred(this._ctx, 3)");
                    }
                    this.state = 52;
                    this.iteration();
                    break;

                } 
            }
            this.state = 57;
            this._errHandler.sync(this);
            _alt = this._interp.adaptivePredict(this._input,3,this._ctx);
        }

    } catch( error) {
        if(error instanceof antlr4.error.RecognitionException) {
	        localctx.exception = error;
	        this._errHandler.reportError(this, error);
	        this._errHandler.recover(this, error);
	    } else {
	    	throw error;
	    }
    } finally {
        this.unrollRecursionContexts(_parentctx)
    }
    return localctx;
};

function MainContext(parser, parent, invokingState) {
	if(parent===undefined) {
	    parent = null;
	}
	if(invokingState===undefined || invokingState===null) {
		invokingState = -1;
	}
	antlr4.ParserRuleContext.call(this, parent, invokingState);
    this.parser = parser;
    this.ruleIndex = StepGrammarParser.RULE_main;
    return this;
}

MainContext.prototype = Object.create(antlr4.ParserRuleContext.prototype);
MainContext.prototype.constructor = MainContext;

MainContext.prototype.step = function() {
    return this.getTypedRuleContext(StepContext,0);
};

MainContext.prototype.EOF = function() {
    return this.getToken(StepGrammarParser.EOF, 0);
};

MainContext.prototype.enterRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.enterMain(this);
	}
};

MainContext.prototype.exitRule = function(listener) {
    if(listener instanceof StepGrammarListener ) {
        listener.exitMain(this);
	}
};

MainContext.prototype.accept = function(visitor) {
    if ( visitor instanceof StepGrammarVisitor ) {
        return visitor.visitMain(this);
    } else {
        return visitor.visitChildren(this);
    }
};




StepGrammarParser.MainContext = MainContext;

StepGrammarParser.prototype.main = function() {

    var localctx = new MainContext(this, this._ctx, this.state);
    this.enterRule(localctx, 10, StepGrammarParser.RULE_main);
    try {
        this.enterOuterAlt(localctx, 1);
        this.state = 58;
        this.step(0);
        this.state = 59;
        this.match(StepGrammarParser.EOF);
    } catch (re) {
    	if(re instanceof antlr4.error.RecognitionException) {
	        localctx.exception = re;
	        this._errHandler.reportError(this, re);
	        this._errHandler.recover(this, re);
	    } else {
	    	throw re;
	    }
    } finally {
        this.exitRule();
    }
    return localctx;
};


StepGrammarParser.prototype.sempred = function(localctx, ruleIndex, predIndex) {
	switch(ruleIndex) {
	case 4:
			return this.step_sempred(localctx, predIndex);
    default:
        throw "No predicate with index:" + ruleIndex;
   }
};

StepGrammarParser.prototype.step_sempred = function(localctx, predIndex) {
	switch(predIndex) {
		case 0:
			return this.precpred(this._ctx, 7);
		case 1:
			return this.precpred(this._ctx, 6);
		case 2:
			return this.precpred(this._ctx, 2);
		case 3:
			return this.precpred(this._ctx, 4);
		case 4:
			return this.precpred(this._ctx, 3);
		default:
			throw "No predicate with index:" + predIndex;
	}
};


exports.StepGrammarParser = StepGrammarParser;
