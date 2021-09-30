export function makeCSS() {
  return `
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

`;
}