import{b2 as m,bi as i,zL as u,bN as d,ga as $,zM as p,vy as S}from"./reconnectSaga-e33541d6.js";import{d as a}from"./device-cbcdfeff.js";const f=({email:o,subject:n="",body:e="",cc:t=[]})=>{if(!o)throw new Error("Cannot mailto without correct email");const c=encodeURIComponent(n),l=encodeURIComponent(e),s=`&cc=${t.join(";")}`,r=`mailto:${o}?subject=${c}&body=${l}${s}`;m({title:`Email to ${o}`,url:r})},I=({userId:o,planType:n,username:e,currentPeriodExpiration:t})=>{const c=o?`
AccountID: ${o}`:"",l=n?`
Plan: ${n}`:"",s=e?`
Email: ${e}`:"",r=t!=null&&t.until?`
Valid Until: ${t.until}`:"";return`

----------
App Information:
Platform: Desktop
OS Version: ${a.os}
App Version: ${a.appVersion}
App Source: ${S}${c}${s}${l}${r}
`},T=()=>{const o=i(u),n=i(d),e=i($),t=i(p),c=I({planType:o,userId:n,username:e,currentPeriodExpiration:t});return s=>{const r=`${s.body||""}${c}`;return f({...s,body:r})}},U=()=>{const o=T();return()=>o({subject:"Need help with Termius",email:"support@termius.com"})};export{f as m,U as u};
//# sourceMappingURL=mailto-866ebc24.js.map
