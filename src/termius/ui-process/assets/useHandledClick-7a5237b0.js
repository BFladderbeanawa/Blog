import{xL as i,r as s,xS as u}from"./reconnectSaga-e33541d6.js";const m=({onClick:a})=>{const r=i(),[c,e]=s.useState("default"),[t,o]=s.useState();return{handleClick:async()=>{t&&clearTimeout(t);try{e("loading"),await r(a()),e("success")}catch(n){if(n instanceof u)return;e("error")}o(setTimeout(()=>e("default"),5e3))},status:c}};export{m as u};
//# sourceMappingURL=useHandledClick-7a5237b0.js.map
