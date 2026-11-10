import{rj as t}from"./reconnectSaga-e33541d6.js";const p=n=>{const{dialogState:o,onDialogOpened:i,onDialogClosed:e}=n;return t({opacity:o==="opened"?1:0,from:{opacity:0},to:{opacity:1},onRest:()=>{o==="opening"&&i()},onProps:()=>{o==="closing"&&e()},config:{duration:200}})};export{p as u};
//# sourceMappingURL=fadeIn-42e8fead.js.map
