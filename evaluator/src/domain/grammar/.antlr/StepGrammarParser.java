// Generated from /home/jleveau/ET_DDD/objective/src/domain/grammar/StepGrammar.g4 by ANTLR 4.8
import org.antlr.v4.runtime.atn.*;
import org.antlr.v4.runtime.dfa.DFA;
import org.antlr.v4.runtime.*;
import org.antlr.v4.runtime.misc.*;
import org.antlr.v4.runtime.tree.*;
import java.util.List;
import java.util.Iterator;
import java.util.ArrayList;

@SuppressWarnings({"all", "warnings", "unchecked", "unused", "cast"})
public class StepGrammarParser extends Parser {
	static { RuntimeMetaData.checkVersion("4.8", RuntimeMetaData.VERSION); }

	protected static final DFA[] _decisionToDFA;
	protected static final PredictionContextCache _sharedContextCache =
		new PredictionContextCache();
	public static final int
		T__0=1, T__1=2, AND=3, OR=4, ARROW=5, COMA=6, IF=7, ELSE=8, SINGLE_STRING=9, 
		DOUBLE_STRING=10, ID=11, WS=12;
	public static final int
		RULE_action = 0, RULE_par_step = 1, RULE_and_step = 2, RULE_or_step = 3, 
		RULE_arrow_step = 4, RULE_sequence_step = 5, RULE_string = 6, RULE_check = 7, 
		RULE_step = 8, RULE_main = 9;
	private static String[] makeRuleNames() {
		return new String[] {
			"action", "par_step", "and_step", "or_step", "arrow_step", "sequence_step", 
			"string", "check", "step", "main"
		};
	}
	public static final String[] ruleNames = makeRuleNames();

	private static String[] makeLiteralNames() {
		return new String[] {
			null, "'('", "')'", "'and'", "'or'", "'=>'", "','", "'if'", "'else'"
		};
	}
	private static final String[] _LITERAL_NAMES = makeLiteralNames();
	private static String[] makeSymbolicNames() {
		return new String[] {
			null, null, null, "AND", "OR", "ARROW", "COMA", "IF", "ELSE", "SINGLE_STRING", 
			"DOUBLE_STRING", "ID", "WS"
		};
	}
	private static final String[] _SYMBOLIC_NAMES = makeSymbolicNames();
	public static final Vocabulary VOCABULARY = new VocabularyImpl(_LITERAL_NAMES, _SYMBOLIC_NAMES);

	/**
	 * @deprecated Use {@link #VOCABULARY} instead.
	 */
	@Deprecated
	public static final String[] tokenNames;
	static {
		tokenNames = new String[_SYMBOLIC_NAMES.length];
		for (int i = 0; i < tokenNames.length; i++) {
			tokenNames[i] = VOCABULARY.getLiteralName(i);
			if (tokenNames[i] == null) {
				tokenNames[i] = VOCABULARY.getSymbolicName(i);
			}

			if (tokenNames[i] == null) {
				tokenNames[i] = "<INVALID>";
			}
		}
	}

	@Override
	@Deprecated
	public String[] getTokenNames() {
		return tokenNames;
	}

	@Override

	public Vocabulary getVocabulary() {
		return VOCABULARY;
	}

	@Override
	public String getGrammarFileName() { return "StepGrammar.g4"; }

	@Override
	public String[] getRuleNames() { return ruleNames; }

	@Override
	public String getSerializedATN() { return _serializedATN; }

	@Override
	public ATN getATN() { return _ATN; }

	public StepGrammarParser(TokenStream input) {
		super(input);
		_interp = new ParserATNSimulator(this,_ATN,_decisionToDFA,_sharedContextCache);
	}

	public static class ActionContext extends ParserRuleContext {
		public TerminalNode ID() { return getToken(StepGrammarParser.ID, 0); }
		public ActionContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_action; }
	}

	public final ActionContext action() throws RecognitionException {
		ActionContext _localctx = new ActionContext(_ctx, getState());
		enterRule(_localctx, 0, RULE_action);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(20);
			match(ID);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class Par_stepContext extends ParserRuleContext {
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public Par_stepContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_par_step; }
	}

	public final Par_stepContext par_step() throws RecognitionException {
		Par_stepContext _localctx = new Par_stepContext(_ctx, getState());
		enterRule(_localctx, 2, RULE_par_step);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(22);
			step(0);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class And_stepContext extends ParserRuleContext {
		public TerminalNode AND() { return getToken(StepGrammarParser.AND, 0); }
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public And_stepContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_and_step; }
	}

	public final And_stepContext and_step() throws RecognitionException {
		And_stepContext _localctx = new And_stepContext(_ctx, getState());
		enterRule(_localctx, 4, RULE_and_step);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(24);
			match(AND);
			setState(25);
			step(0);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class Or_stepContext extends ParserRuleContext {
		public TerminalNode OR() { return getToken(StepGrammarParser.OR, 0); }
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public Or_stepContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_or_step; }
	}

	public final Or_stepContext or_step() throws RecognitionException {
		Or_stepContext _localctx = new Or_stepContext(_ctx, getState());
		enterRule(_localctx, 6, RULE_or_step);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(27);
			match(OR);
			setState(28);
			step(0);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class Arrow_stepContext extends ParserRuleContext {
		public TerminalNode ARROW() { return getToken(StepGrammarParser.ARROW, 0); }
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public Arrow_stepContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_arrow_step; }
	}

	public final Arrow_stepContext arrow_step() throws RecognitionException {
		Arrow_stepContext _localctx = new Arrow_stepContext(_ctx, getState());
		enterRule(_localctx, 8, RULE_arrow_step);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(30);
			match(ARROW);
			setState(31);
			step(0);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class Sequence_stepContext extends ParserRuleContext {
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public Sequence_stepContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_sequence_step; }
	}

	public final Sequence_stepContext sequence_step() throws RecognitionException {
		Sequence_stepContext _localctx = new Sequence_stepContext(_ctx, getState());
		enterRule(_localctx, 10, RULE_sequence_step);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(33);
			step(0);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class StringContext extends ParserRuleContext {
		public TerminalNode SINGLE_STRING() { return getToken(StepGrammarParser.SINGLE_STRING, 0); }
		public TerminalNode DOUBLE_STRING() { return getToken(StepGrammarParser.DOUBLE_STRING, 0); }
		public StringContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_string; }
	}

	public final StringContext string() throws RecognitionException {
		StringContext _localctx = new StringContext(_ctx, getState());
		enterRule(_localctx, 12, RULE_string);
		int _la;
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(35);
			_la = _input.LA(1);
			if ( !(_la==SINGLE_STRING || _la==DOUBLE_STRING) ) {
			_errHandler.recoverInline(this);
			}
			else {
				if ( _input.LA(1)==Token.EOF ) matchedEOF = true;
				_errHandler.reportMatch(this);
				consume();
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class CheckContext extends ParserRuleContext {
		public TerminalNode IF() { return getToken(StepGrammarParser.IF, 0); }
		public StringContext string() {
			return getRuleContext(StringContext.class,0);
		}
		public List<StepContext> step() {
			return getRuleContexts(StepContext.class);
		}
		public StepContext step(int i) {
			return getRuleContext(StepContext.class,i);
		}
		public TerminalNode ELSE() { return getToken(StepGrammarParser.ELSE, 0); }
		public CheckContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_check; }
	}

	public final CheckContext check() throws RecognitionException {
		CheckContext _localctx = new CheckContext(_ctx, getState());
		enterRule(_localctx, 14, RULE_check);
		try {
			setState(47);
			_errHandler.sync(this);
			switch ( getInterpreter().adaptivePredict(_input,0,_ctx) ) {
			case 1:
				enterOuterAlt(_localctx, 1);
				{
				setState(37);
				match(IF);
				setState(38);
				string();
				setState(39);
				step(0);
				setState(40);
				match(ELSE);
				setState(41);
				step(0);
				}
				break;
			case 2:
				enterOuterAlt(_localctx, 2);
				{
				setState(43);
				match(IF);
				setState(44);
				string();
				setState(45);
				step(0);
				}
				break;
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public static class StepContext extends ParserRuleContext {
		public ActionContext action() {
			return getRuleContext(ActionContext.class,0);
		}
		public CheckContext check() {
			return getRuleContext(CheckContext.class,0);
		}
		public Par_stepContext par_step() {
			return getRuleContext(Par_stepContext.class,0);
		}
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public Sequence_stepContext sequence_step() {
			return getRuleContext(Sequence_stepContext.class,0);
		}
		public And_stepContext and_step() {
			return getRuleContext(And_stepContext.class,0);
		}
		public Or_stepContext or_step() {
			return getRuleContext(Or_stepContext.class,0);
		}
		public Arrow_stepContext arrow_step() {
			return getRuleContext(Arrow_stepContext.class,0);
		}
		public StepContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_step; }
	}

	public final StepContext step() throws RecognitionException {
		return step(0);
	}

	private StepContext step(int _p) throws RecognitionException {
		ParserRuleContext _parentctx = _ctx;
		int _parentState = getState();
		StepContext _localctx = new StepContext(_ctx, _parentState);
		StepContext _prevctx = _localctx;
		int _startState = 16;
		enterRecursionRule(_localctx, 16, RULE_step, _p);
		try {
			int _alt;
			enterOuterAlt(_localctx, 1);
			{
			setState(56);
			_errHandler.sync(this);
			switch (_input.LA(1)) {
			case ID:
				{
				setState(50);
				action();
				}
				break;
			case IF:
				{
				setState(51);
				check();
				}
				break;
			case T__0:
				{
				setState(52);
				match(T__0);
				setState(53);
				par_step();
				setState(54);
				match(T__1);
				}
				break;
			default:
				throw new NoViableAltException(this);
			}
			_ctx.stop = _input.LT(-1);
			setState(68);
			_errHandler.sync(this);
			_alt = getInterpreter().adaptivePredict(_input,3,_ctx);
			while ( _alt!=2 && _alt!=org.antlr.v4.runtime.atn.ATN.INVALID_ALT_NUMBER ) {
				if ( _alt==1 ) {
					if ( _parseListeners!=null ) triggerExitRuleEvent();
					_prevctx = _localctx;
					{
					setState(66);
					_errHandler.sync(this);
					switch ( getInterpreter().adaptivePredict(_input,2,_ctx) ) {
					case 1:
						{
						_localctx = new StepContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_step);
						setState(58);
						if (!(precpred(_ctx, 6))) throw new FailedPredicateException(this, "precpred(_ctx, 6)");
						setState(59);
						sequence_step();
						}
						break;
					case 2:
						{
						_localctx = new StepContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_step);
						setState(60);
						if (!(precpred(_ctx, 5))) throw new FailedPredicateException(this, "precpred(_ctx, 5)");
						setState(61);
						and_step();
						}
						break;
					case 3:
						{
						_localctx = new StepContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_step);
						setState(62);
						if (!(precpred(_ctx, 4))) throw new FailedPredicateException(this, "precpred(_ctx, 4)");
						setState(63);
						or_step();
						}
						break;
					case 4:
						{
						_localctx = new StepContext(_parentctx, _parentState);
						pushNewRecursionContext(_localctx, _startState, RULE_step);
						setState(64);
						if (!(precpred(_ctx, 2))) throw new FailedPredicateException(this, "precpred(_ctx, 2)");
						setState(65);
						arrow_step();
						}
						break;
					}
					} 
				}
				setState(70);
				_errHandler.sync(this);
				_alt = getInterpreter().adaptivePredict(_input,3,_ctx);
			}
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			unrollRecursionContexts(_parentctx);
		}
		return _localctx;
	}

	public static class MainContext extends ParserRuleContext {
		public StepContext step() {
			return getRuleContext(StepContext.class,0);
		}
		public TerminalNode EOF() { return getToken(StepGrammarParser.EOF, 0); }
		public MainContext(ParserRuleContext parent, int invokingState) {
			super(parent, invokingState);
		}
		@Override public int getRuleIndex() { return RULE_main; }
	}

	public final MainContext main() throws RecognitionException {
		MainContext _localctx = new MainContext(_ctx, getState());
		enterRule(_localctx, 18, RULE_main);
		try {
			enterOuterAlt(_localctx, 1);
			{
			setState(71);
			step(0);
			setState(72);
			match(EOF);
			}
		}
		catch (RecognitionException re) {
			_localctx.exception = re;
			_errHandler.reportError(this, re);
			_errHandler.recover(this, re);
		}
		finally {
			exitRule();
		}
		return _localctx;
	}

	public boolean sempred(RuleContext _localctx, int ruleIndex, int predIndex) {
		switch (ruleIndex) {
		case 8:
			return step_sempred((StepContext)_localctx, predIndex);
		}
		return true;
	}
	private boolean step_sempred(StepContext _localctx, int predIndex) {
		switch (predIndex) {
		case 0:
			return precpred(_ctx, 6);
		case 1:
			return precpred(_ctx, 5);
		case 2:
			return precpred(_ctx, 4);
		case 3:
			return precpred(_ctx, 2);
		}
		return true;
	}

	public static final String _serializedATN =
		"\3\u608b\ua72a\u8133\ub9ed\u417c\u3be7\u7786\u5964\3\16M\4\2\t\2\4\3\t"+
		"\3\4\4\t\4\4\5\t\5\4\6\t\6\4\7\t\7\4\b\t\b\4\t\t\t\4\n\t\n\4\13\t\13\3"+
		"\2\3\2\3\3\3\3\3\4\3\4\3\4\3\5\3\5\3\5\3\6\3\6\3\6\3\7\3\7\3\b\3\b\3\t"+
		"\3\t\3\t\3\t\3\t\3\t\3\t\3\t\3\t\3\t\5\t\62\n\t\3\n\3\n\3\n\3\n\3\n\3"+
		"\n\3\n\5\n;\n\n\3\n\3\n\3\n\3\n\3\n\3\n\3\n\3\n\7\nE\n\n\f\n\16\nH\13"+
		"\n\3\13\3\13\3\13\3\13\2\3\22\f\2\4\6\b\n\f\16\20\22\24\2\3\3\2\13\f\2"+
		"I\2\26\3\2\2\2\4\30\3\2\2\2\6\32\3\2\2\2\b\35\3\2\2\2\n \3\2\2\2\f#\3"+
		"\2\2\2\16%\3\2\2\2\20\61\3\2\2\2\22:\3\2\2\2\24I\3\2\2\2\26\27\7\r\2\2"+
		"\27\3\3\2\2\2\30\31\5\22\n\2\31\5\3\2\2\2\32\33\7\5\2\2\33\34\5\22\n\2"+
		"\34\7\3\2\2\2\35\36\7\6\2\2\36\37\5\22\n\2\37\t\3\2\2\2 !\7\7\2\2!\"\5"+
		"\22\n\2\"\13\3\2\2\2#$\5\22\n\2$\r\3\2\2\2%&\t\2\2\2&\17\3\2\2\2\'(\7"+
		"\t\2\2()\5\16\b\2)*\5\22\n\2*+\7\n\2\2+,\5\22\n\2,\62\3\2\2\2-.\7\t\2"+
		"\2./\5\16\b\2/\60\5\22\n\2\60\62\3\2\2\2\61\'\3\2\2\2\61-\3\2\2\2\62\21"+
		"\3\2\2\2\63\64\b\n\1\2\64;\5\2\2\2\65;\5\20\t\2\66\67\7\3\2\2\678\5\4"+
		"\3\289\7\4\2\29;\3\2\2\2:\63\3\2\2\2:\65\3\2\2\2:\66\3\2\2\2;F\3\2\2\2"+
		"<=\f\b\2\2=E\5\f\7\2>?\f\7\2\2?E\5\6\4\2@A\f\6\2\2AE\5\b\5\2BC\f\4\2\2"+
		"CE\5\n\6\2D<\3\2\2\2D>\3\2\2\2D@\3\2\2\2DB\3\2\2\2EH\3\2\2\2FD\3\2\2\2"+
		"FG\3\2\2\2G\23\3\2\2\2HF\3\2\2\2IJ\5\22\n\2JK\7\2\2\3K\25\3\2\2\2\6\61"+
		":DF";
	public static final ATN _ATN =
		new ATNDeserializer().deserialize(_serializedATN.toCharArray());
	static {
		_decisionToDFA = new DFA[_ATN.getNumberOfDecisions()];
		for (int i = 0; i < _ATN.getNumberOfDecisions(); i++) {
			_decisionToDFA[i] = new DFA(_ATN.getDecisionState(i), i);
		}
	}
}