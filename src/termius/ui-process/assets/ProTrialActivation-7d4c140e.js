import{ey as m,bg as w,bQ as O,r as o,bl as u,bn as i,ex as D,bW as c,ce as Y,bs as y,cy as Z,bh as U,bi as I,xw as G,z$ as V,A0 as q,nn as K,fA as Q,cH as J,cc as X,wG as ee,A1 as E,ez as L,eA as T,aD as B,A2 as te}from"./reconnectSaga-e33541d6.js";import{M as oe}from"./checkIconGradient.react-d7eac3e2.js";const ae=m`
  0% {
    transform: translateY(100%);
  }
  100% {
    transform: translateY(0);
  }
`,ie=m`
  100% {
    height: 0;
    width: 0,
    visibility: hidden;
    opacity: 0;
  }
`,ne=m`
  0% {
    opacity: 1;
  }
  99% {
    opacity: 0;
  }
  100% {
    opacity: 0;
    display: none;
  }
`,re=({animationOffsetBottom:r,animationOffsetLeft:e})=>m`
  0% {
    visibility: hidden;
    max-height: 68px;
    width: 68px;
    position: fixed;
  }
  50% {
    visibility: visible;
    border-radius: 10px;
  }
  100% {
    visibility: visible;
    max-height: 245px;
    border-radius: 10px;
    position: fixed;
    bottom: ${r}px;
    left: ${e}px;
    width: 250px;
    z-index: 1200;
  }
`,se=m`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;function ce(r){const{isCompactMode:e,children:a,icon:l,classNames:n,animationOffsetBottom:h,animationOffsetLeft:d}=r,{cx:f,classes:p}=le({animationOffsetBottom:h,animationOffsetLeft:d}),[S,g]=o.useState(!1),$=()=>{g(!0)};return u("div",{className:f(p.root,{[p.compactMode]:e,[p.animate]:S,[(n==null?void 0:n.compactModeClassName)??""]:e}),onMouseEnter:$,"aria-label":"Bubble notification",children:[i("div",{className:f(p.compactContent,n==null?void 0:n.compactContentClassName),children:i("div",{className:p.compactContentChildren,children:l})}),i("div",{className:f(p.defaultContent,n==null?void 0:n.defaultContentClassName),children:i("div",{className:f(p.defaultContentChildren,n==null?void 0:n.defaultContentChildrenClassName),children:a})})]})}const le=w()((r,e,a)=>({compactMode:{"--animation-delay":"0.1s","--animation-duration":"0.2s",width:"100%",position:"relative",[`& .${a.compactContent}`]:{display:"flex",zIndex:"2",position:"relative",borderRight:"1px solid var(--border-color)",borderTop:"1px solid var(--border-color)"},[`& .${a.defaultContent}`]:{zIndex:"1",bottom:"0px",left:"0px",borderRadius:"0px",maxHeight:"68px",width:"68px",overflow:"hidden",position:"absolute",visibility:"hidden"},[`& .${a.defaultContentChildren}`]:{opacity:0}},root:{zIndex:1300,position:"relative",overflow:"visible",transform:"translateY(100%)",animation:`${ae} 0.3s forwards`,[`&:not(.${a.compactMode})`]:{zIndex:1,[`& .${a.compactContent}`]:{display:"none"},[`& .${a.defaultContent}`]:{display:"block"}}},defaultContent:{position:"relative",fontSize:"12px",width:"100%",padding:"20px",background:"none",color:"var(--main)",overflow:"hidden","&:hover":{"& .bubble-notification-close-button":{opacity:"1"}},[`.${a.compactMode} &`]:{border:"1px solid var(--border-color)",padding:"10px",overflow:"visible",background:"var(--light-grey-7)",".termius-dark-theme &":{background:"var(--dark-grey-5)"}}},defaultContentChildren:{},compactContent:{background:"var(--light-grey-5)",height:"68px",display:"flex",justifyContent:"center",alignItems:"center",".termius-dark-theme &":{background:"var(--dark-grey-5)"}},compactContentChildren:{display:"flex",alignItems:"center",justifyContent:"center"},animate:{[`&.${a.compactMode}`]:{"&:hover":{[`& .${a.compactContentChildren}`]:{animation:`${ne} var(--animation-delay) forwards`},[`& .${a.compactContent}`]:{animation:`${ie} 0s var(--animation-delay) forwards`},[`& .${a.defaultContent}`]:{animation:`${re({...e})} var(--animation-duration) var(--animation-delay) forwards`},[`& .${a.defaultContentChildren}`]:{animation:`${se} var(--animation-duration) calc(var(--animation-duration) + var(--animation-delay)) forwards`}}}}})),de=O.memo(ce),pe=(r,e)=>o.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",ref:e,...r},o.createElement("circle",{cx:8,cy:8,r:7.25,stroke:"currentColor",strokeWidth:1.5})),me=o.forwardRef(pe),he=o.memo(me),ue=(r,e)=>o.createElement("svg",{width:16,height:16,viewBox:"0 0 16 16",fill:"none",xmlns:"http://www.w3.org/2000/svg",ref:e,...r},o.createElement("path",{fillRule:"evenodd",clipRule:"evenodd",d:"M8 16C12.4183 16 16 12.4183 16 8C16 3.58172 12.4183 0 8 0C3.58172 0 0 3.58172 0 8C0 12.4183 3.58172 16 8 16ZM12.127 6.02142C12.3933 5.7672 12.4031 5.3452 12.1489 5.07887C11.8947 4.81254 11.4727 4.80272 11.2064 5.05695L6.77778 9.28422L4.79366 7.39028C4.52732 7.13605 4.10533 7.14587 3.8511 7.4122C3.59688 7.67853 3.60669 8.10053 3.87302 8.35476L6.77778 11.1275L12.127 6.02142Z",fill:"url(#paint0_linear_1054_23678)"}),o.createElement("defs",null,o.createElement("linearGradient",{id:"paint0_linear_1054_23678",x1:8,y1:0,x2:8,y2:16,gradientUnits:"userSpaceOnUse"},o.createElement("stop",{stopColor:"#2093F0"}),o.createElement("stop",{offset:1,stopColor:"#2097E0"})))),fe=o.forwardRef(ue),ve=o.memo(fe),z=r=>{const{isChecked:e,id:a}=r,{classes:l}=ge(),n=a*100,[h,d]=o.useState(!1);return e&&setTimeout(()=>{d(!0)},n),u("div",{className:l.iconsWrapper,children:[i(he,{className:c(l.uncheckedIcon,{[l.uncheckedIconAnimation]:h})}),i(ve,{className:c(l.checkedIcon,{[l.checkedIconAnimation]:h})})]})};z.defaultProps={disableRipple:!0};const Ce=D`
  0% {
    stroke-dasharray: 100;
    color: var(--dark-grey-6);
  }
  100% {
    stroke-dasharray: 2;
    color: var(--sidebar-accent);
  }
`,be=D`
  0% {
    stroke-dasharray: 2;
    opacity: 0;
  }
  100% {
    stroke-dasharray: 30;
    opacity: 1;
  }
`,ge=w()({iconsWrapper:{position:"relative"},uncheckedIcon:{position:"absolute",color:"var(--light-grey-3)",".termius-dark-theme &":{color:"var(--dark-grey-6)"}},uncheckedIconAnimation:{"& circle":{animation:`${Ce} 1.2s forwards`}},checkedIcon:{position:"absolute",opacity:0},checkedIconAnimation:{display:"block",opacity:0,animation:`${be} 0.8s 0.5s forwards`}}),xe=r=>{const{label:e,isChecked:a,openStepDialog:l,id:n}=r,{classes:h}=ye();return u("div",{className:c(h.stepWrapper,{[h.activeStep]:!a}),onClick:()=>l(e),children:[i(z,{id:n,isChecked:a}),i(Y,{left:16,children:i(y,{variant:"body2",color:"main",fontSize:12,className:c({[h.activeStep]:!a}),children:e})})]})},ye=w()({stepWrapper:{display:"flex",gap:"10px",marginBottom:"10px","&:last-child":{marginBottom:"0"}},activeStep:{cursor:"pointer","&:hover":{color:"var(--secondary)"}}}),we=m`
  0% {
    height: 72px;
  }
  100% {
    height: 160px;
  }
`,Se=m`
  0% {
    height: 160px;
  }
  100% {
    height: 72px;
  }
`,_=m`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`,W=m`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`,$e=m`
  0% {
    opacity: 0;
  }
  40% {
    opacity: 0;
    top: 70px;
  }
  80% {
    opacity: 1;
  }
  100% {
    opacity: 1;
  }
`,ke=m`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    bottom: 100px;
  }
`,Ne=m`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
`,Ie=m`
  0%'{
    top: 0;
    height: 160px;
  }
  100% {
    top: 190px;
    height: 0px;
  }
`,Me=(r,e)=>o.createElement("svg",{width:22,height:22,viewBox:"0 0 22 22",fill:"none",xmlns:"http://www.w3.org/2000/svg",ref:e,...r},o.createElement("path",{d:"M3.44411 5.73184C3.06305 6.0838 2.45381 6.09211 2.07274 5.74015L0.285842 4.01491C-0.0952807 3.6469 -0.0952808 3.05023 0.285842 2.68222C0.666965 2.31421 1.28489 2.31421 1.66601 2.68222L2.75403 3.73281L6.33399 0.276009C6.71511 -0.0920028 7.33303 -0.092003 7.71416 0.276009C8.09528 0.644021 8.09528 1.24069 7.71416 1.6087L3.44411 5.73184Z",fill:"currentColor"}),o.createElement("rect",{x:12,y:2,width:10,height:2,rx:1,fill:"currentColor"}),o.createElement("path",{d:"M3.44411 13.7318C3.06305 14.0838 2.45381 14.0921 2.07274 13.7401L0.285842 12.0149C-0.0952807 11.6469 -0.0952808 11.0502 0.285842 10.6822C0.666965 10.3142 1.28489 10.3142 1.66601 10.6822L2.75403 11.7328L6.33399 8.27601C6.71511 7.908 7.33303 7.908 7.71416 8.27601C8.09528 8.64402 8.09528 9.24069 7.71416 9.6087L3.44411 13.7318Z",fill:"currentColor"}),o.createElement("rect",{x:12,y:10,width:10,height:2,rx:1,fill:"currentColor"}),o.createElement("path",{d:"M3.44411 21.7318C3.06305 22.0838 2.45381 22.0921 2.07274 21.7401L0.285842 20.0149C-0.0952807 19.6469 -0.0952808 19.0502 0.285842 18.6822C0.666965 18.3142 1.28489 18.3142 1.66601 18.6822L2.75403 19.7328L6.33399 16.276C6.71511 15.908 7.33303 15.908 7.71416 16.276C8.09528 16.644 8.09528 17.2407 7.71416 17.6087L3.44411 21.7318Z",fill:"currentColor"}),o.createElement("rect",{x:12,y:18,width:10,height:2,rx:1,fill:"currentColor"})),Ae=o.forwardRef(Me),Ee=o.memo(Ae),_e=r=>{const{isCompactMode:e}=r,a=Z(),l=U(),n=I(G),h=I(V),[d,f]=o.useState(!0),[p,S]=o.useState(!0),[g,$]=o.useState(!0),[k,R]=o.useState(!1),x=I(q),b=K([{id:1,name:"add_hosts",label:"Add hosts",isCompleted:!p,completedStepNumber:x.indexOf("add_hosts")},{id:2,name:"connect_to_host",label:"Connect to a host",isCompleted:!p,completedStepNumber:x.indexOf("connect_to_host")},{id:3,name:"add_second_device",label:"Sync to mobile",isCompleted:p?!1:n,completedStepNumber:x.indexOf("add_second_device")},{id:4,name:"invite_members",label:"Invite team members",isCompleted:p?!1:h,completedStepNumber:x.indexOf("invite_members")}],["isCompleted","completedStepNumber"],["desc","asc"]),M=b.every(s=>s.isCompleted);M&&setTimeout(()=>{R(!0),f(!0)},2e3);const N=b.filter(s=>s.isCompleted).length*(100/b.length);Q(()=>{const s=setTimeout(()=>{S(!1)},300);return()=>{clearTimeout(s)}});const{classes:t}=Le({progressBarValue:N}),A=s=>{s==="Sync to mobile"&&(l(E({onboardingAction:"Install"})),L(a,{dialog:"AddSecondDeviceDialog",target:T(),props:{}}).catch(B)),s==="Invite team members"&&(l(E({onboardingAction:"Invite"})),L(a,{dialog:"InviteMembersTrialOnboarding",target:T(),props:{}}).catch(B))},F=()=>{e||(g&&$(!1),d&&l(te()),f(!d))},v=b.find(s=>!s.isCompleted),H=u("div",{className:c({[t.mainSectionCompact]:e}),children:[u("div",{className:c(t.label,{[t.noPointer]:e}),onClick:F,children:[i(y,{variant:"h2",fontSize:12,color:"main",children:"Finish your setup:"}),!e&&i("div",{className:t.chevronWrapper,children:i(J,{className:c(t.chevron,{[t.chevronOpened]:!d})})})]}),i(X,{className:t.progressBar,value:p?0:N,variant:"determinate",classes:{bar:t.bar}})]}),P=u("div",{className:c({[t.hideDefaultSection]:k}),children:[u("div",{className:t.defaultSection,children:[i("div",{className:c({[t.topBorder]:!e}),children:H}),i("div",{className:c(t.steps,{[t.stepsCompact]:e,[t.animationShowText]:d,[t.animationHideText]:!d}),children:b.map(s=>i(xe,{label:s.label,isChecked:s.isCompleted,openStepDialog:A,id:s.completedStepNumber},s.id))})]}),!g&&i("div",{className:t.stepLabelWrapper,onClick:()=>{v!=null&&v.label&&A(v.label)},children:i(y,{variant:"body2",color:"main",fontSize:12,className:c(t.stepLabel,{[t.animationShowCurrentStep]:!d,[t.animationHideCurrentStep]:d,[t.stepLabelCompactMode]:e}),children:v?`${N}%: ${v==null?void 0:v.label.toLowerCase()}`:"Your setup is complete!"})})]}),j=u(O.Fragment,{children:[M&&i(ee,{className:t.confettiAnimation}),i("div",{className:c(t.successWrapper,{[t.topBorder]:!e,[t.fixedWidth]:!e,[t.successAnimation]:k}),children:u("div",{className:t.successContent,children:[i(y,{variant:"h2",fontSize:12,color:"main",children:"Your setup is complete!"}),i(oe,{className:c({[t.successIconAnimation]:k})})]})})]});return o.useEffect(()=>{f(!0)},[e]),u(de,{classNames:{defaultContentClassName:t.bubbleDefaultContent},isCompactMode:e,icon:i(Ee,{className:t.icon}),animationOffsetBottom:10,animationOffsetLeft:10,children:[i("div",{className:c({[t.wrapperCompact]:e,[t.showElement]:d,[t.hideElement]:!d}),children:P}),j]})},C="forwards cubic-bezier(0.7, -0.3, 0.53, 1.26 )",Le=w()((r,e,a)=>({successAnimation:{position:"relative",animation:`${_} 0.3s forwards linear, ${Ie} 0.45s 2s ${C}`},hideDefaultSection:{pointerEvents:"none",animation:`${W} 0.3s forwards linear`},animationShowText:{position:"relative",animation:`${_} 0.3s ${C}`},animationHideText:{position:"relative",animation:`${W} 0.3s ${C}`},animationShowCurrentStep:{position:"relative",animation:`${$e} 0.3s ${C}`},animationHideCurrentStep:{position:"relative",animation:`${ke} 0.3s ${C}`},topBorder:{borderTop:"1px solid var(--light-grey-4)",paddingTop:"10px",".termius-dark-theme &":{borderTop:"1px solid var(--dark-grey-6)"}},fixedWidth:{width:"150px"},confettiAnimation:{position:"absolute",bottom:"-35px",left:"calc((100% - 200px) / 2)",width:"200px",height:"200px",zIndex:1},mainSectionCompact:{position:"relative",bottom:"10px"},defaultSection:{display:"flex",flexDirection:"column",gap:"10px"},progressBar:{height:"5px",background:"var(--light-grey-5)",color:"red",marginTop:"10px",marginBottom:"0",".termius-dark-theme &":{background:"var(--dark-grey-1)"}},label:{cursor:"pointer",display:"flex",gap:"30px",alignItems:"flex-start",justifyContent:"space-between"},chevronWrapper:{minWidth:"10px",minHeight:"7px",cursor:"pointer"},chevron:{fill:"var(--tf-border-color)",transition:"transform 0.2s",color:"var(--secondary)"},chevronOpened:{transform:"rotate(180deg)"},stepLabelWrapper:{position:"absolute",bottom:0},stepLabel:{opacity:"0",position:"absolute",bottom:"20px",cursor:"pointer",color:"var(--main)","&:hover":{color:"var(--secondary)"}},stepLabelCompactMode:{pointerEvents:"none"},bar:{borderRadius:5,background:`linear-gradient(93.24deg, #2091F6 ${100-e.progressBarValue}%, #21B568 100%)`},successWrapper:{pointerEvents:"none",opacity:0,position:"absolute",marginBottom:"0",top:"0",height:"160px"},successContent:{display:"flex",flexDirection:"column",gap:"32.5px",alignItems:"center",justifyContent:"center"},successIconAnimation:{animation:`${Ne} 7s linear 0s`},steps:{position:"relative",bottom:"0",marginTop:"5px"},stepsCompact:{marginTop:"10px",bottom:"15px"},showElement:{animation:`${we} 0.3s ${C}`},hideElement:{animation:`${Se} 0.3s ${C}`},bubbleDefaultContent:{paddingTop:"0px",[`.${a.compactMode} &`]:{padding:"20px",paddingTop:"20px"}},noPointer:{cursor:"auto"},wrapperCompact:{padding:"15px 10px 0px 10px"},compactMode:{},icon:{color:"var(--main)"}}));export{_e as ProTrialActivation};
//# sourceMappingURL=ProTrialActivation-7d4c140e.js.map
