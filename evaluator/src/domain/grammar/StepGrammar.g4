grammar StepGrammar;
OR: 'or';
ARROW: '=>';
IF: 'if';
ELSE: 'else';
NOT: '!';
PLUS: '+';

fragment DIGIT   
    :   ('0'..'9');

INTEGER_NUMBER
    :   DIGIT+;

SINGLE_STRING
    : '\'' ~('\'')+ '\''
    ;

DOUBLE_STRING
    : '"' ~('"')+ '"'
    ;

ID : [a-zA-Z0-9_\-]+ ;             // match lower-case identifiers

WS : [ \t\r\n]+ -> skip ; // skip spaces, tabs, newlines

action:
    ID
    | ID '$' SINGLE_STRING
    | ID '$' DOUBLE_STRING
    | ID '$' ID
    ;

iteration:
  '[' INTEGER_NUMBER ']'
  ;

string
    : SINGLE_STRING
    | DOUBLE_STRING
    ;

par_step:
    '(' step ')'
    ;

step:
    action
    | step step
    | step OR step
    | NOT step
    | step PLUS
    | step iteration
    | step ARROW step
    | par_step
    ;

main:
    step EOF;