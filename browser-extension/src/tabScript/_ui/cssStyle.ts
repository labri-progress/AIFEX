export default `

[aifex_style=true] {
  border: 3px solid #2196F3 !important;
}
[aifex_style=true][aifex_frequency=never] {
  border: 3px solid #2196F3 !important;
}
[aifex_style=true][aifex_frequency=rarely]  {
  border: 3px solid #9ACD32 !important;
}
[aifex_style=true][aifex_frequency=sometimes]  {
  border: 3px solid #FFA500 !important;
}
[aifex_style=true][aifex_frequency=often]  {
  border: 3px solid #ff0000 !important;
}
[aifex_style=true][aifex_frequency=session]  {
  border: 3px solid #00cc00 !important;
}
[aifex_style=true][aifex_frequency=followed]  {
  border: 3px solid #ff8000 !important;
}
[aifex_style=true][aifex_frequency=both]  {
  border: 3px solid #b30000 !important;
}

[aifex_style=true][aifex_next_action=true]  {
  border-style: dashed !important;
}

#AIFEX_probabilityPopup {
  background: rgba(30, 32, 44, .95);
  max-width: 400px;
  height: initial;
  margin-top: 1em;
  padding: 20px;
  font-size: 14px;
  line-height: 24px;
  min-width: 250px !important;
  position: absolute;
  text-align: left;
  will-change: transform;
  border-radius: 14px;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 8px 0px, rgba(0, 0, 0, 0.24) 0px 4px 8px 0px;
  visibility: hidden;
  z-index: 9999;
}

.popupAction {
  color: #bd93f9;
}

.popupProbability {
  color: #ff0000;
  margin-left: 5px;
}

.popupProbabilityFollowed {
  color: #ffA500;
  margin-left: 5px;
}

.popupCommentType{
  color: rgb(241, 250, 140)
}

.popupCommentDescription{
  color: rgb(238, 238, 238);
}

.comment{
  padding-left: 30px
}

#AIFEX_tab {
  position: absolute;
  background: rgba(30, 32, 44, .95);
  border: solid 4px black;
  max-width: 400px;
  height: initial;
  font-size: 14px;
  line-height: 24px;
  min-width: 250px !important;
  text-align: left;
  will-change: transform;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 8px 0px, rgba(0, 0, 0, 0.24) 0px 4px 8px 0px;
  z-index: 9999;
  color: #fff;

}

#AIFEX_tab_dragger {
  background-color: dodgerblue;
  border-radius: 10px;
  cursor: move;
  height: 14px;
  width: 100%;
  box-shadow: rgba(0, 0, 0, 0.12) 0px 0px 8px 0px, rgba(0, 0, 0, 0.24) 0px 4px 8px 0px;
}

#commentSectionHeader {
  padding: 5px;
  z-index: 10;
  color: #fff;
}

#commentSectionBody {
  overflow: auto;
  padding: 10px;
}

.commentUpButton {
  color: darkblue;
  margin: 5px;
  border-color: #FB8C00;
  background: linear-gradient(to bottom, #FFB74D 0%, #FFA726 100%);
  box-shadow: inset 0 1px #FFE0B2, 0 1px 2px rgba(0, 0, 0, 0.2);
}

.commentContext {
  padding-left: 30px;
}

.commentOccurence {
  color: #bd93f9;
  display: inline-block;
}

.commentKind {
  color: #bd93f9;
}

.commentMessage {
  padding-left: 5px;
}

.user-view-header {
  text-decoration: underline;
  font-size: 15px;
  font-weight: bold;
}

.commentActionContext {
  color: #61cbe0;
  padding-left: 5px;
}

#AIFEX_evaluationSectionBody {
  color: #fff;
  padding-left: 5px;
}


.aifex-validated-step {
  color: lightgreen;
  padding-right: 5px;
  display: block;

}

.aifex-not-validated-step {
  color: red;
  padding-right: 5px;
  display: block;
}

.aifex_stepAction {
  display: block;
  border: 5px;
}

.aifex_action_name {
  font-weight: bold;
}

.aifex_definition_li {
  padding-left: 2rem;
}

.aifex_question_button {
   display: inline-block;
   padding: 0.35em 1.2em;
   border: 0.1em solid #FFFFFF;
   margin: 0 0.3em 0.3em 0;
   border-radius: 0.12em;
   box-sizing: border-box;
   text-decoration: none;
   font-family: 'Roboto',sans-serif;
   font-weight: 300;
   text-align: center;
   transition: all 0.2s;
}

.answerQuestionButtonYes: hover {
  color:#1dcf11;
  background-color:#1dcf11;
}

.answerQuestionButtonYes{
   color: #1dcf11;
}

.answerQuestionButtonNo: hover {
  color: #cf2411;
  background-color :#cf2411;
}

.answerQuestionButtonNo {
   color: #cf2411;
}

[aifex_style=true][aifex_step_action="entering"] {
  outline: 3px rgba(255,0,255) solid !important;
    outline-offset: -9px;
}

[aifex_style=true][aifex_step_action="continuing"] {
    outline: 3px rgba(255,0,255) solid !important;
    outline-offset: -9px;
}

[aifex_style=true][aifex_step_action="finishing"] {
    outline: 3px rgba(255,0,255) solid !important;
    outline-offset: -9px;
}

`;