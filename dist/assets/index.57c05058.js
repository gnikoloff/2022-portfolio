var Ei=Object.defineProperty,vi=Object.defineProperties;var xi=Object.getOwnPropertyDescriptors;var vt=Object.getOwnPropertySymbols;var Ti=Object.prototype.hasOwnProperty,Ai=Object.prototype.propertyIsEnumerable;var Ye=(e,t,i)=>t in e?Ei(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,w=(e,t)=>{for(var i in t||(t={}))Ti.call(t,i)&&Ye(e,i,t[i]);if(vt)for(var i of vt(t))Ai.call(t,i)&&Ye(e,i,t[i]);return e},R=(e,t)=>vi(e,xi(t));var d=(e,t,i)=>(Ye(e,typeof t!="symbol"?t+"":t,i),i),xt=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)};var Ue=(e,t,i)=>(xt(e,t,"read from private field"),i?i.call(e):t.get(e)),ze=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},ke=(e,t,i,o)=>(xt(e,t,"write to private field"),o?o.call(e,i):t.set(e,i),i);import{c as Mi,a as Si,b as bi,t as wi,f as te,p as Ri,d as ie,s as Oi,n as Ui,e as Tt,g as Z,u as Ni,m as At,h as Mt,i as St,j as Ii,l as yi,k as $e,o as Fi,q as gi,r as Li,v as Ci,w as Di,x as Pi,A as Hi,y as Bi,z as bt,B as Vi,C as ji,D as wt,E as Rt,F as Xi,G as X,H as Ot,I as Ut,J as Nt,K as Wi,L as q,M as Gi,N as ne,O as It,P as oe,Q as $,R as Yi,S as zi,T as ki,U as $i}from"./vendor.636294a8.js";const Ki=function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))o(n);new MutationObserver(n=>{for(const r of n)if(r.type==="childList")for(const s of r.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&o(s)}).observe(document,{childList:!0,subtree:!0});function i(n){const r={};return n.integrity&&(r.integrity=n.integrity),n.referrerpolicy&&(r.referrerPolicy=n.referrerpolicy),n.crossorigin==="use-credentials"?r.credentials="include":n.crossorigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function o(n){if(n.ep)return;n.ep=!0;const r=i(n);fetch(n.href,r)}};Ki();const yt="ui/SET_CHILDREN_ROW_HEIGHT",Ft="ui/SET_ACTIVE_ITEM_UID",gt="ui/SET_MOUSE_POS",Lt="ui/SET_CLICK_POS",Ct="ui/SET_IS_HOVERING",Zi="ui/SET_SHOW_CUBE_HIGHLIGHT",Dt="ui/SET_IS_CURRENTLY_TRANSITIONING_VIEW",qi={isDebugMode:new URLSearchParams(location.search).has("debugMode"),childrenRowHeights:{},activeItemUID:null,mousePos:[-1e3,-1e3],clickPos:[-1e3,-1e3],isHovering:!1,isDisplayCursor:!1,isCurrentlyTransitionViews:!1,showCubeHighlight:!0},Qi=(e=qi,t)=>{switch(t.type){case yt:return R(w({},e),{childrenRowHeights:t.payload});case Ft:return R(w({},e),{activeItemUID:t.payload});case gt:return R(w({},e),{mousePos:t.payload});case Lt:return R(w({},e),{clickPos:t.payload});case Ct:return R(w({},e),{isHovering:t.payload});case Zi:return R(w({},e),{showCubeHighlight:t.payload});case Dt:return R(w({},e),{isCurrentlyTransitionViews:t.payload});default:return e}},Ji=e=>({type:yt,payload:e}),Ke=e=>({type:Ft,payload:e}),Pt=e=>({type:Lt,payload:e}),en=e=>({type:gt,payload:e}),Ze=e=>(t,i)=>{const{ui:{isHovering:o}}=i();e!==o&&(e?document.body.classList.add("hover"):document.body.classList.remove("hover")),t({type:Ct,payload:e})},re=e=>({type:Dt,payload:e});var N=Mi({reducer:Si({ui:Qi}),enhancers:[bi(wi)],middleware:e=>e({serializableCheck:!1}),devTools:window.__REDUX_DEVTOOLS_EXTENSION__&&window.__REDUX_DEVTOOLS_EXTENSION__()});const pe=14,Ht=70;let qe=8,Bt=5;{const e=70*Math.PI/180,i=2*Math.tan(e/2)*qe*(innerWidth/innerHeight);pe>i&&(qe*=pe/i*1.08,Bt=8)}const tn="https://georgi-nikolov.com/api",Vt=document.title,jt=[.1,.1,.1,1],Qe=`vec4(${jt.join(",")})`,se='-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"',_e=4,Je=9,nn=5,ae=3,H=2,Ne=.2,on=ae,rn=.4,Xt=.1,Wt=.1,Gt=.6,sn=.4,an=.3,cn=.3,et=.1,tt=60,ln=Bt,Ie=qe,Yt=5,dn=700,un="exp_InOut",hn=1500,fn="quad_Out",mn=1e3,pn=150,_n="exp_Out",En=400;var vn=Object.defineProperty,xn=(e,t,i)=>t in e?vn(e,t,{enumerable:!0,configurable:!0,writable:!0,value:i}):e[t]=i,W=(e,t,i)=>(xn(e,typeof t!="symbol"?t+"":t,i),i),zt=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},F=(e,t,i)=>(zt(e,t,"read from private field"),i?i.call(e):t.get(e)),Ee=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},kt=(e,t,i,o)=>(zt(e,t,"write to private field"),o?o.call(e,i):t.set(e,i),i),it="-- DEFINES_HOOK --",Tn=(e,t,i,o={})=>{if(Object.keys(o).length&&!i.includes(it))throw new Error(`in order to include defines, you must provide "${it}" in your shader code`);let n="";for(const[l,c]of Object.entries(o)){if(typeof c=="boolean"&&!c)continue;let h=`${c}`;typeof c=="number"&&Number.isInteger(c)&&(h+=".0"),n+=`#define ${l} ${h}
`}i=i.replace(it,n);const r=e.createShader(t);if(e.shaderSource(r,i),e.compileShader(r),e.getShaderParameter(r,e.COMPILE_STATUS))return r;const s=`
    Error in ${t===e.VERTEX_SHADER?"Vertex":"Fragment"} shader:
    ${e.getShaderInfoLog(r)}
  `;throw e.deleteShader(r),new Error(s)},$t=Tn,An=(e,t,i,o)=>{const n=$t(e,e.VERTEX_SHADER,t,o),r=$t(e,e.FRAGMENT_SHADER,i,o),s=e.createProgram();if(e.attachShader(s,n),e.attachShader(s,r),e.linkProgram(s),e.detachShader(s,n),e.deleteShader(n),e.detachShader(s,r),e.deleteShader(r),e.getProgramParameter(s,e.LINK_STATUS))return s;throw e.deleteProgram(s),new Error(`Error linking program: ${e.getProgramInfoLog(s)}`)},Mn=An,Sn=(e,t,i,o)=>{const n=e.getUniformBlockIndex(t,i),r=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_DATA_SIZE),s=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_REFERENCED_BY_VERTEX_SHADER),l=e.getActiveUniformBlockParameter(t,n,e.UNIFORM_BLOCK_REFERENCED_BY_FRAGMENT_SHADER),c=e.getUniformIndices(t,o),h=e.getActiveUniforms(t,c,e.UNIFORM_OFFSET),a={};for(let u=0;u<o.length;u++){const _=o[u],f={index:c[u],offset:h[u]};a[_]=f}return{blockIndex:n,blockSize:r,usedInVertexShader:s,usedInFragmentShader:l,uniforms:a}},bn=Sn,wn=(e,t,i=0,o=e.DYNAMIC_DRAW)=>{const n=e.createBuffer();return e.bindBuffer(e.UNIFORM_BUFFER,n),e.bufferData(e.UNIFORM_BUFFER,t,o),e.bindBuffer(e.UNIFORM_BUFFER,null),e.bindBufferBase(e.UNIFORM_BUFFER,i,n),n},Rn=wn,On=(e,t,i,o)=>{let n;switch(t){case e.FLOAT:return e.uniform1f(i,o);case e.FLOAT_VEC2:return n=o,e.uniform2f(i,n[0],n[1]);case e.FLOAT_VEC3:return n=o,e.uniform3f(i,n[0],n[1],n[2]);case e.FLOAT_VEC4:return n=o,e.uniform4f(i,n[0],n[1],n[2],n[3]);case e.BOOL:case e.INT:case e.SAMPLER_2D:case e.SAMPLER_CUBE:return e.uniform1i(i,o);case e.BOOL_VEC2:case e.INT_VEC2:return n=o,e.uniform2i(i,n[0],n[1]);case e.BOOL_VEC3:case e.INT_VEC3:return n=o,e.uniform3i(i,n[0],n[1],n[2]);case e.BOOL_VEC4:case e.INT_VEC4:return n=o,e.uniform4i(i,n[0],n[1],n[2],n[3]);case e.FLOAT_MAT2:return e.uniformMatrix2fv(i,!1,o);case e.FLOAT_MAT3:return e.uniformMatrix3fv(i,!1,o);case e.FLOAT_MAT4:return e.uniformMatrix4fv(i,!1,o);default:throw new Error("wrong type for uniform")}},Kt=On,Un=(e={})=>{const{width:t=1,height:i=1,widthSegments:o=1,heightSegments:n=1,flipUVy:r=!1}=e,s=o,l=n,c=(s+1)*(l+1),h=s*l*6,a=new Float32Array(c*3+c*2),u=c>65536?new Uint32Array(h):new Uint16Array(h);let _=0,f=0;const E=_,p=t/s,M=i/l,b=1,g=-1,L=0,U=3+2;for(let v=0;v<=l;v++){const T=v*M-i/2;for(let S=0;S<=s;S++,_++){const j=S*p-t/2;if(a[_*U+0]=j*b,a[_*U+1]=T*g,a[_*U+2]=L/2,a[_*U+3]=S/s,a[_*U+4]=r?1-v/l:v/l,v===l||S===s)continue;const we=E+S+v*(s+1),Re=E+S+(v+1)*(s+1),Ge=E+S+(v+1)*(s+1)+1,Oe=E+S+v*(s+1)+1;u[f*6]=we,u[f*6+1]=Re,u[f*6+2]=Oe,u[f*6+3]=Re,u[f*6+4]=Ge,u[f*6+5]=Oe,f++}}return{width:t,height:i,vertexCount:u.length,vertexStride:U,interleavedArray:a,indicesArray:u}},nt=Un,Nn=(e={})=>{const{width:t=1,height:i=1,depth:o=1,widthSegments:n=1,heightSegments:r=1,depthSegments:s=1,uvOffsetEachFace:l=!1}=e,c=n,h=r,a=s,u=(c+1)*(h+1)*2+(c+1)*(a+1)*2+(h+1)*(a+1)*2,_=(c*h*2+c*a*2+h*a*2)*6,f=3+3+2,E=new Float32Array(u*f),p=_>65536?new Uint32Array(_):new Uint16Array(_);let M=0,b=0;return ce(E,p,o,i,t,a,h,4,2,1,0,-1,-1,M,b,f,l),ce(E,p,o,i,-t,a,h,2,2,1,0,1,-1,M+=(a+1)*(h+1),b+=a*h,f,l),ce(E,p,t,o,i,a,h,0,0,2,1,1,1,M+=(a+1)*(h+1),b+=a*h,f,l),ce(E,p,t,o,-i,a,h,5,0,2,1,1,-1,M+=(c+1)*(a+1),b+=c*a,f,l),ce(E,p,t,i,-o,c,h,3,0,1,2,-1,-1,M+=(c+1)*(a+1),b+=c*a,f,l),ce(E,p,t,i,o,c,h,1,0,1,2,1,-1,M+=(c+1)*(h+1),b+=c*h,f,l),{width:t,height:i,depth:o,vertexCount:_,vertexStride:f,interleavedArray:E,indicesArray:p}},In=Nn;function ce(e,t,i,o,n,r,s,l,c=0,h=1,a=2,u=1,_=-1,f=0,E=0,p=8,M=!1){const b=f,g=i/r,L=o/s;for(let U=0;U<=s;U++){const v=U*L-o/2;for(let T=0;T<=r;T++,f++){const S=T*g-i/2;e[f*p+0+c]=S*u,e[f*p+0+h]=v*_,e[f*p+0+a]=n/2,e[f*p+3+c]=0,e[f*p+3+h]=0,e[f*p+3+a]=n>=0?1:-1;const j=1/6,we=j*l,Re=M?we+T/r*j:T/r,Ge=M?we+U/s*j:U/s;if(e[f*p+6+0]=Re,e[f*p+6+1]=Ge,U===s||T===r)continue;const Oe=b+T+U*(r+1),_t=b+T+(U+1)*(r+1),_i=b+T+(U+1)*(r+1)+1,Et=b+T+U*(r+1)+1;t[E*6]=Oe,t[E*6+1]=_t,t[E*6+2]=Et,t[E*6+3]=_t,t[E*6+4]=_i,t[E*6+5]=Et,E++}}}var Zt=(e,t,i)=>Math.min(Math.max(e,t),i),qt=class{constructor(){d(this,"position",te(1,2,3));d(this,"lookAt",te(0,0,0));d(this,"projectionMatrix",Z());d(this,"viewMatrix",Z());d(this,"viewMatrixInverse",Z());d(this,"projectionViewMatrix",Z())}updateViewMatrix(){return yi(this.viewMatrix,this.position,this.lookAt,qt.UP_VECTOR),St(this.viewMatrixInverse,this.viewMatrix),this}updateProjectionViewMatrix(){return At(this.projectionViewMatrix,this.projectionMatrix,this.viewMatrix),this}},Qt=qt;W(Qt,"UP_VECTOR",te(0,1,0));var Jt=class extends Qt{constructor(e,t,i,o){super();d(this,"fieldOfView");d(this,"aspect");d(this,"near");d(this,"far");this.fieldOfView=e,this.aspect=t,this.near=i,this.far=o,this.updateProjectionMatrix()}updateProjectionMatrix(){return Ri(this.projectionMatrix,this.fieldOfView,this.aspect,this.near,this.far),this}},le=class{constructor(){d(this,"value",0);d(this,"damping");this.damping=.5}addForce(e){this.value+=e}update(){return this.value*this.value>1e-6?this.value*=this.damping:this.stop(),this.value}stop(){this.value=0}},yn=class{constructor(e,t=document.body,i=!1,o=1){d(this,"camera");d(this,"domElement");d(this,"target",ie());d(this,"minDistance",0);d(this,"maxDistance",1/0);d(this,"isEnabled",!0);d(this,"isDamping");d(this,"dampingFactor");d(this,"isZoom");d(this,"zoomSpeed");d(this,"isRotate");d(this,"rotateSpeed");d(this,"isPan");d(this,"keyPanSpeed");d(this,"enableKeys");d(this,"keys");d(this,"originTarget");d(this,"originPosition");d(this,"targetXDampedAction",new le);d(this,"targetYDampedAction",new le);d(this,"targetZDampedAction",new le);d(this,"targetThetaDampedAction",new le);d(this,"targetPhiDampedAction",new le);d(this,"targetRadiusDampedAction",new le);d(this,"_isShiftDown",!1);d(this,"_rotateStart",{x:9999,y:9999});d(this,"_rotateEnd",{x:9999,y:9999});d(this,"_roatteDelta",{x:9999,y:9999});d(this,"_spherical");d(this,"_zoomDistanceEnd",0);d(this,"_zoomDistance",0);d(this,"state","");d(this,"loopId",0);d(this,"_panStart",{x:0,y:0});d(this,"_panDelta",{x:0,y:0});d(this,"_panEnd",{x:0,y:0});d(this,"_paused",!1);d(this,"_isDebug",!1);d(this,"_outputEl");d(this,"mouseWheelForce",1);this.mouseWheelForce=o,e||console.error("camera is undefined"),this.camera=e,this.domElement=t,this.isDamping=!1,this.dampingFactor=.25,this.isZoom=!0,this.zoomSpeed=1,this.isRotate=!0,this.rotateSpeed=1,this.isPan=!0,this.keyPanSpeed=7,this.enableKeys=!0,this.keys={LEFT:"37",UP:"38",RIGHT:"39",BOTTOM:"40",SHIFT:"16"},this.originTarget=ie(),this.originPosition=ie(),this.originPosition[0]=e.position[0],this.originPosition[1]=e.position[0],this.originPosition[2]=e.position[0];const n=this.camera.position[0],r=this.camera.position[1],s=this.camera.position[2],l=Math.sqrt(n*n+r*r+s*s),c=Math.atan2(this.camera.position[0],this.camera.position[2]),h=Math.acos(Zt(this.camera.position[1]/l,-1,1));this._spherical={radius:l,theta:c,phi:h},this._bindEvens(),this.setEventHandler(),this.startTick(),this._isDebug=i,i&&(this._outputEl=document.createElement("div"),this._outputEl.setAttribute("style",`
      position: fixed;
      bottom: 24px;
      left: 24px;
      z-index: 999;
      font-family: monospace;
      font-size: 14px;
      user-select: none;
      background: rgba(255, 255, 255, 0.7);
      border-radius: 4px;
      padding: 3px 6px;
    `),document.body.appendChild(this._outputEl))}lookAt([e,t,i]){return Oi(this.target,e,t,i),this}setEventHandler(){this.domElement.addEventListener("contextmenu",this._contextMenuHandler,!1),this.domElement.addEventListener("mousedown",this._mouseDownHandler,!1),this.domElement.addEventListener("wheel",this._mouseWheelHandler,!1),this.domElement.addEventListener("touchstart",this._touchStartHandler,!1),this.domElement.addEventListener("touchmove",this._touchMoveHandler,!1),window.addEventListener("keydown",this._onKeyDownHandler,!1),window.addEventListener("keyup",this._onKeyUpHandler,!1)}removeEventHandler(){this.domElement.removeEventListener("contextmenu",this._contextMenuHandler,!1),this.domElement.removeEventListener("mousedown",this._mouseDownHandler,!1),this.domElement.removeEventListener("wheel",this._mouseWheelHandler,!1),this.domElement.removeEventListener("mousemove",this._mouseMoveHandler,!1),window.removeEventListener("mouseup",this._mouseUpHandler,!1),this.domElement.removeEventListener("touchstart",this._touchStartHandler,!1),this.domElement.removeEventListener("touchmove",this._touchMoveHandler,!1),window.removeEventListener("keydown",this._onKeyDownHandler,!1),window.removeEventListener("keydown",this._onKeyUpHandler,!1)}startTick(){this.loopId=requestAnimationFrame(this.tick)}pause(){this._paused=!0}start(){this._paused=!1}tick(){if(!this._paused&&(this.updateDampedAction(),this.updateCamera(),this._isDebug)){const e=Math.round(this.camera.position[0]*100)/100,t=Math.round(this.camera.position[1]*100)/100,i=Math.round(this.camera.position[2]*100)/100;this._outputEl.textContent=`x: ${e} y: ${t} z: ${i}`}this.loopId=requestAnimationFrame(this.tick)}updateDampedAction(){this.target[0]+=this.targetXDampedAction.update(),this.target[1]+=this.targetYDampedAction.update(),this.target[2]+=this.targetZDampedAction.update(),this._spherical.theta+=this.targetThetaDampedAction.update(),this._spherical.phi+=this.targetPhiDampedAction.update(),this._spherical.radius+=this.targetRadiusDampedAction.update()}updateCamera(){const e=this._spherical,t=Math.sin(e.phi)*e.radius;this.camera.position[0]=t*Math.sin(e.theta)+this.target[0],this.camera.position[1]=Math.cos(e.phi)*e.radius+this.target[1],this.camera.position[2]=t*Math.cos(e.theta)+this.target[2],this.camera.lookAt[0]=this.target[0],this.camera.lookAt[1]=this.target[1],this.camera.lookAt[2]=this.target[2]}_bindEvens(){this.tick=this.tick.bind(this),this._contextMenuHandler=this._contextMenuHandler.bind(this),this._mouseDownHandler=this._mouseDownHandler.bind(this),this._mouseWheelHandler=this._mouseWheelHandler.bind(this),this._mouseMoveHandler=this._mouseMoveHandler.bind(this),this._mouseUpHandler=this._mouseUpHandler.bind(this),this._touchStartHandler=this._touchStartHandler.bind(this),this._touchMoveHandler=this._touchMoveHandler.bind(this),this._onKeyDownHandler=this._onKeyDownHandler.bind(this),this._onKeyUpHandler=this._onKeyUpHandler.bind(this)}_contextMenuHandler(e){!this.isEnabled||e.preventDefault()}_mouseDownHandler(e){!this.isEnabled||(e.button===0?(this.state="rotate",this._rotateStart={x:e.clientX,y:e.clientY}):(this.state="pan",this._panStart={x:e.clientX,y:e.clientY}),this.domElement.addEventListener("mousemove",this._mouseMoveHandler,!1),window.addEventListener("mouseup",this._mouseUpHandler,!1))}_mouseUpHandler(){this.domElement.removeEventListener("mousemove",this._mouseMoveHandler,!1),window.removeEventListener("mouseup",this._mouseUpHandler,!1)}_mouseMoveHandler(e){!this.isEnabled||(this.state==="rotate"?(this._rotateEnd={x:e.clientX,y:e.clientY},this._roatteDelta={x:this._rotateEnd.x-this._rotateStart.x,y:this._rotateEnd.y-this._rotateStart.y},this._updateRotateHandler(),this._rotateStart={x:this._rotateEnd.x,y:this._rotateEnd.y}):this.state==="pan"&&(this._panEnd={x:e.clientX,y:e.clientY},this._panDelta={x:-.5*(this._panEnd.x-this._panStart.x),y:.5*(this._panEnd.y-this._panStart.y)},this._updatePanHandler(),this._panStart={x:this._panEnd.x,y:this._panEnd.y}))}_mouseWheelHandler(e){const t=this.mouseWheelForce;e.deltaY>0?this.targetRadiusDampedAction.addForce(t):this.targetRadiusDampedAction.addForce(-t)}_touchStartHandler(e){let t,i;switch(e.touches.length){case 1:this.state="rotate",this._rotateStart={x:e.touches[0].clientX,y:e.touches[0].clientY};break;case 2:this.state="zoom",t=e.touches[1].clientX-e.touches[0].clientX,i=e.touches[1].clientY-e.touches[0].clientY,this._zoomDistance=Math.sqrt(t*t+i*i);break;case 3:this.state="pan",this._panStart={x:(e.touches[0].clientX+e.touches[1].clientX+e.touches[2].clientX)/3,y:(e.touches[0].clientY+e.touches[1].clientY+e.touches[2].clientY)/3};break}}_touchMoveHandler(e){let t,i,o;switch(e.preventDefault(),e.touches.length){case 1:if(this.state!=="rotate")return;this._rotateEnd={x:e.touches[0].clientX,y:e.touches[0].clientY},this._roatteDelta={x:(this._rotateEnd.x-this._rotateStart.x)*.5,y:(this._rotateEnd.y-this._rotateStart.y)*.5},this._updateRotateHandler(),this._rotateStart={x:this._rotateEnd.x,y:this._rotateEnd.y};break;case 2:if(this.state!=="zoom")return;t=e.touches[1].clientX-e.touches[0].clientX,i=e.touches[1].clientY-e.touches[0].clientY,this._zoomDistanceEnd=Math.sqrt(t*t+i*i),o=this._zoomDistanceEnd-this._zoomDistance,o*=1.5;let n=this._spherical.radius-o;n=Zt(n,this.minDistance,this.maxDistance),this._zoomDistance=this._zoomDistanceEnd,this._spherical.radius=n;break;case 3:this._panEnd={x:(e.touches[0].clientX+e.touches[1].clientX+e.touches[2].clientX)/3,y:(e.touches[0].clientY+e.touches[1].clientY+e.touches[2].clientY)/3},this._panDelta={x:this._panEnd.x-this._panStart.x,y:this._panEnd.y-this._panStart.y},this._panDelta.x*=-1,this._updatePanHandler(),this._panStart={x:this._panEnd.x,y:this._panEnd.y};break}}_onKeyDownHandler(e){let t=0,i=0;switch(e.key){case this.keys.SHIFT:this._isShiftDown=!0;break;case this.keys.LEFT:t=-10;break;case this.keys.RIGHT:t=10;break;case this.keys.UP:i=10;break;case this.keys.BOTTOM:i=-10;break}this._isShiftDown?(this._roatteDelta={x:-t,y:i},this._updateRotateHandler()):(this._panDelta={x:t,y:i},this._updatePanHandler())}_onKeyUpHandler(e){switch(e.key){case this.keys.SHIFT:this._isShiftDown=!1;break}}_updatePanHandler(){const e=ie(),t=ie(),i=ie();i[0]=this.target[0]-this.camera.position[0],i[1]=this.target[1]-this.camera.position[1],i[2]=this.target[2]-this.camera.position[2],Ui(i,i),Tt(e,i,[0,1,0]),Tt(t,e,i);const o=Math.max(this._spherical.radius/2e3,.001);this.targetXDampedAction.addForce((e[0]*this._panDelta.x+t[0]*this._panDelta.y)*o),this.targetYDampedAction.addForce((e[1]*this._panDelta.x+t[1]*this._panDelta.y)*o),this.targetZDampedAction.addForce((e[2]*this._panDelta.x+t[2]*this._panDelta.y)*o)}_updateRotateHandler(){this.targetThetaDampedAction.addForce(-this._roatteDelta.x/this.domElement.clientWidth),this.targetPhiDampedAction.addForce(-this._roatteDelta.y/this.domElement.clientHeight)}},Fn=class{constructor(){d(this,"position",te(0,0,0));d(this,"rotation",te(0,0,0));d(this,"scale",te(1,1,1));d(this,"modelMatrix",Z());d(this,"shouldUpdate",!0)}copyFromMatrix(e){return Mt(this.modelMatrix,e),this.shouldUpdate=!1,this}setPosition(e){return $e(this.position,e),this.shouldUpdate=!0,this}setScale(e){return $e(this.scale,e),this.shouldUpdate=!0,this}setRotation(e){return $e(this.rotation,e),this.shouldUpdate=!0,this}updateModelMatrix(){return Fi(this.modelMatrix),gi(this.modelMatrix,this.modelMatrix,this.position),Li(this.modelMatrix,this.modelMatrix,this.rotation[0]),Ci(this.modelMatrix,this.modelMatrix,this.rotation[1]),Di(this.modelMatrix,this.modelMatrix,this.rotation[2]),Pi(this.modelMatrix,this.modelMatrix,this.scale),this.shouldUpdate=!1,this}},de=class extends Fn{constructor(e=void 0){super();d(this,"parentNode",null);d(this,"_children",[]);d(this,"_visible",!0);d(this,"worldMatrix",Z());d(this,"normalMatrix",Z());d(this,"uid",Ni(9));d(this,"name");this.name=e}get visible(){return this._visible}set visible(e){this._visible=e}get children(){return this._children}get siblings(){return this.parentNode?this.parentNode._children:[]}get levelIndex(){let e=0,t=this.parentNode;for(;t;)e++,t=t.parentNode;return e}setParent(e=null){if(this.parentNode){const t=this.parentNode._children.indexOf(this);t>=0&&this.parentNode._children.splice(t,1)}return e&&e.addChild(this),this.parentNode=e,this}addChild(e){return this._children.push(e),this}updateWorldMatrix(e=null){this.shouldUpdate&&this.updateModelMatrix(),e?At(this.worldMatrix,e,this.modelMatrix):Mt(this.worldMatrix,this.modelMatrix),St(this.normalMatrix,this.worldMatrix),Ii(this.normalMatrix,this.normalMatrix);for(let t=0;t<this._children.length;t++)this._children[t].updateWorldMatrix(this.worldMatrix);return this}traverse(e,t=0){e(this,t),t++;for(let i=0;i<this._children.length;i++)this._children[i].traverse(e,t)}findChild(e){if(e(this))return this;let t=null;for(let i=0;i<this._children.length&&!(t=this._children[i].findChild(e));i++);return t}findChildByName(e){if(this.name===e)return this;let t=null;for(let i=0;i<this._children.length&&!(t=this._children[i].findChildByName(e));i++);return t}findParent(e){if(e(this))return this;let t=null,i=this.parentNode;for(;i&&!(t=i.findParent(e));)i=i==null?void 0:i.parentNode;return t}findParentByName(e){if(this.name===e)return this;let t=null,i=this.parentNode;for(;i&&!(t=i.findParentByName(e));)i=i==null?void 0:i.parentNode;return t}render(){if(!!this._visible)for(let e=0;e<this._children.length;e++)this._children[e].render()}},ue,ye=class extends de{constructor(e,t,i,o={},n){super(n);if(W(this,"gl"),W(this,"vao"),W(this,"vertexCount"),W(this,"uploadWorldMatrixToGPU",!1),Ee(this,ue,new Map),W(this,"boundingBox"),W(this,"program"),this.gl=e,this.vao=e.createVertexArray(),this.program=Mn(e,t,i,o),this.program.__SPECTOR_Metadata={name:n,shaderDefines:o},!this.setUniform(ye.WORLD_MATRIX_UNIFORM_NAME,{type:e.FLOAT_MAT4}))throw new Error(`Each Drawable is expected to have a mat4 ${ye.WORLD_MATRIX_UNIFORM_NAME} implemented in shader`)}setUniform(e,{type:t,value:i}){const o=this.gl;let n;if(n=F(this,ue).get(e))n.value=i;else{const r=o.getUniformLocation(this.program,e);if(!r)return console.error(`uniform with name ${e} was not found in the program`),!1;n={type:t,location:r,value:i},F(this,ue).set(e,n)}return i!=null&&(o.useProgram(this.program),Kt(o,n.type,n.location,i)),!0}updateUniform(e,t){let i;if(i=this.getUniform(e)){i.value=t;const o=this.gl;return o.useProgram(this.program),Kt(o,i.type,i.location,t),!0}return!1}getUniform(e){let t;return(t=F(this,ue).get(e))?t:(console.error("can't locate uniform with that name"),null)}updateWorldMatrix(e){return super.updateWorldMatrix(e),this.uploadWorldMatrixToGPU=!0,this}uploadWorldMatrix(){return this.uploadWorldMatrixToGPU?(this.uploadWorldMatrixToGPU=!1,this.updateUniform(ye.WORLD_MATRIX_UNIFORM_NAME,this.worldMatrix),this):this}destroy(){F(this,ue).clear();const e=this.gl;e.deleteVertexArray(this.vao),e.deleteProgram(this.program)}},ve=ye;ue=new WeakMap;W(ve,"WORLD_MATRIX_UNIFORM_NAME","u_worldMatrix");var gn=document.createElement("canvas"),ei=gn.getContext("webgl2"),K=ei.MAX_TEXTURE_SIZE,Fe=ei.RGB,ot,O,rt=!1,Q,he,fe,st=class{constructor(){if(Ee(this,Q,[]),Ee(this,he,[]),Ee(this,fe,document.createElement("div")),rt){const e=400,t=document.createElement("style"),i="hwoa-rang-texture-atlas-debug";t.setAttribute("type","text/css");const o=`
        #${i} {
          position: fixed;
          bottom: 1rem;
          right: 1rem;
          transform-origin: 100% 100%;
          width: ${e}px;
          max-height: 100vh;
          overflow: scroll;
        }
        #${i} canvas {
          max-width: 100%;
        }
      `;t.appendChild(document.createTextNode(o)),document.getElementsByTagName("head")[0].appendChild(t),kt(this,fe,document.createElement("div")),F(this,fe).setAttribute("id",i),document.body.appendChild(F(this,fe))}}static set debugMode(e){rt=e}static get textureSize(){return K}static set textureSize(e){K=e}static set textureFormat(e){Fe=e}static set gl(e){O=e}static getInstance(){if(!O)throw new Error("You must provide a WebGL2RenderingContext first via setting the TextureAtlas.gl property!");return ot||(ot=new st),ot}pack(e,t,i=1){const o=()=>{const f=document.createElement("canvas");F(this,fe).appendChild(f),f.width=K,f.height=K;const E=O.createTexture();O.bindTexture(O.TEXTURE_2D,E),O.texParameterf(O.TEXTURE_2D,O.TEXTURE_MIN_FILTER,O.LINEAR_MIPMAP_LINEAR),O.texImage2D(O.TEXTURE_2D,0,Fe,K,K,0,Fe,O.UNSIGNED_BYTE,null),O.generateMipmap(O.TEXTURE_2D),O.bindTexture(O.TEXTURE_2D,null);const p=new Hi(f);return F(this,Q).push(p),F(this,he).push(E),p};let n=F(this,Q)[F(this,Q).length-1];n||(n=o());const r=i===1?t:st.scaleDownDrawableByFactor(t,i);n.pack(e,r)||(n=o(),n.pack(e,r));const l=n.uv()[e];for(let f=0;f<l.length;f++)l[f][0]*=K,l[f][1]*=K;const c=F(this,he)[F(this,he).length-1],h=l[0][0],a=l[0][1],u=l[2][0]-l[0][0],_=l[2][1]-l[0][1];return O.bindTexture(O.TEXTURE_2D,c),O.texSubImage2D(O.TEXTURE_2D,0,h,a,u,_,Fe,O.UNSIGNED_BYTE,r),O.generateMipmap(O.TEXTURE_2D),O.bindTexture(O.TEXTURE_2D,null),this}getUv2(e){let t=-1;for(let i=0;i<F(this,Q).length;i++){const n=F(this,Q)[i].uv2()[e];if(n){t=i;const r=F(this,he)[t];return[n,r]}}throw new Error("Can't get uvs")}},xe=st;Q=new WeakMap;he=new WeakMap;fe=new WeakMap;W(xe,"scaleDownDrawableByFactor",(e,t)=>{const i=document.createElement("canvas"),o=e instanceof HTMLImageElement?e.naturalWidth:e.width,n=e instanceof HTMLImageElement?e.naturalHeight:e.height;i.width=o/t,i.height=n/t,rt&&console.log(`Scaled ${o}x${n} project image to ${i.width}x${i.height}`);const r=i.getContext("2d");return r.imageSmoothingQuality="high",r.drawImage(e,0,0,o,n,0,0,i.width,i.height),i});var Ln=`#version 300 es
  in vec4 a_position;
  uniform mat4 u_worldMatrix;
  uniform mat4 u_projectionViewMatrix;
  void main () {
    gl_Position = u_projectionViewMatrix * u_worldMatrix * a_position;
  }
`,Cn=`#version 300 es
  precision highp float;
  out vec4 finalColor;
  void main () {
    finalColor = vec4(0.2);
  }
`,ge,Dn=class extends ve{constructor(e,t){super(e,Ln,Cn);Ee(this,ge,void 0),kt(this,ge,t);const i=4,o=Math.PI*2/i,n=new Float32Array(i*2*3+2*3),r=10;for(let c=0;c<=i;c++){const h=Math.PI*.25;n[c*6+0]=0,n[c*6+1]=0,n[c*6+2]=0,n[c*6+3]=Math.cos(c*o+h)*r,n[c*6+4]=Math.sin(c*o+h)*r,n[c*6+5]=-10}n[i*6+0]=0,n[i*6+1]=0,n[i*6+2]=0,n[i*6+3]=0,n[i*6+4]=0,n[i*6+5]=-100,this.vertexCount=i*2+2;const s=e.createBuffer(),l=e.getAttribLocation(this.program,"a_position");this.setUniform("u_worldMatrix",{type:e.FLOAT_MAT4}),this.setUniform("u_projectionViewMatrix",{type:e.FLOAT_MAT4}),e.bindVertexArray(this.vao),e.bindBuffer(e.ARRAY_BUFFER,s),e.bufferData(e.ARRAY_BUFFER,n,e.STATIC_DRAW),e.enableVertexAttribArray(l),e.vertexAttribPointer(l,3,e.FLOAT,!1,0,0),e.bindVertexArray(null)}preRender(e){return this.updateUniform("u_projectionViewMatrix",e.projectionViewMatrix),this}render(){this.updateUniform("u_worldMatrix",F(this,ge).viewMatrixInverse);const e=this.gl;e.useProgram(this.program),e.bindVertexArray(this.vao),e.drawArrays(e.LINES,0,this.vertexCount)}};ge=new WeakMap;var Le=(e,t,i)=>Math.min(Math.max(e,t),i),Ce=(e,t,i,o,n)=>(e-t)*(n-o)/(i-t)+o,ti=e=>e*Math.PI/180,ii=(e,t,i=999)=>{const o=e[0],n=e[1],r=Bi(o,n,-1,1),s=bt(),l=Vi();ji(l,t.projectionMatrix),wt(s,r,l),s[2]=-1,s[3]=0;const c=bt();wt(c,s,t.viewMatrixInverse);const h=Rt(c[0],c[1],c[2]);Xi(h,h);const a=Rt(t.position[0],t.position[1],t.position[2]),u=X();Ot(u,a);const _=X();Ot(_,h),Ut(_,h,i),Nt(u,a,_);const f=X();return Wi(f,u,a),{rayStart:a,rayEnd:u,rayDirection:f}},Pn=(e,t,i,o)=>{const n=X();q(n,i,e);const r=ne(n,o),s=ne(t,o),l=r/s;if(l>=0){const c=X();return Ut(c,t,l),Nt(c,c,e),[l,c]}return null},ni=(e,t,i)=>{const o=i[0],n=i[1],r=i[2],s=X(),l=X();q(l,o,n);const c=X();q(c,r,n),Gi(s,c,l);const h=Pn(e,t,o,s);if(!h)return null;const[a,u]=h;q(l,n,o);const _=X();q(_,u,o);let f=ne(_,l)/ne(l,l);return f<0||f>1||(q(c,r,n),q(_,u,n),f=ne(_,c)/ne(c,c),f<0||f>1)?null:[a,u]},Hn=(e,t,i)=>{const o=(i.min[0]-e[0])/t[0],n=(i.max[0]-e[0])/t[0],r=(i.min[1]-e[1])/t[1],s=(i.max[1]-e[1])/t[1],l=(i.min[2]-e[2])/t[2],c=(i.max[2]-e[2])/t[2],h=Math.max(Math.max(Math.min(o,n),Math.min(r,s)),Math.min(l,c)),a=Math.min(Math.min(Math.max(o,n),Math.max(r,s)),Math.max(l,c));return a<0||h>a?null:h},Te=class{static linear(e){return e}static quad_In(e){return e*e}static quad_Out(e){return e*(2-e)}static quad_InOut(e){return(e*=2)<1?.5*e*e:-.5*(--e*(e-2)-1)}static cubic_In(e){return e*e*e}static cubic_Out(e){return--e*e*e+1}static cubic_InOut(e){return(e*=2)<1?.5*e*e*e:.5*((e-=2)*e*e+2)}static quart_In(e){return e*e*e*e}static quart_Out(e){return 1- --e*e*e*e}static quart_InOut(e){return(e*=2)<1?.5*e*e*e*e:-.5*((e-=2)*e*e*e-2)}static quint_In(e){return e*e*e*e*e}static quint_Out(e){return--e*e*e*e*e+1}static quint_InOut(e){return(e*=2)<1?.5*e*e*e*e*e:.5*((e-=2)*e*e*e*e+2)}static sine_In(e){return 1-Math.cos(e*Math.PI/2)}static sine_Out(e){return Math.sin(e*Math.PI/2)}static sine_InOut(e){return .5*(1-Math.cos(Math.PI*e))}static exp_In(e){return e===0?0:Math.pow(1024,e-1)}static exp_Out(e){return e===1?1:1-Math.pow(2,-10*e)}static exp_InOut(e){return e===0||e===1?e:(e*=2)<1?.5*Math.pow(1024,e-1):.5*(-Math.pow(2,-10*(e-1))+2)}static circ_In(e){return 1-Math.sqrt(1-e*e)}static circ_Out(e){return Math.sqrt(1- --e*e)}static circ_InOut(e){return(e*=2)<1?-.5*(Math.sqrt(1-e*e)-1):.5*(Math.sqrt(1-(e-=2)*e)+1)}static elastic_In(e){return e===0||e===1?e:-Math.pow(2,10*(e-1))*Math.sin((e-1.1)*5*Math.PI)}static elastic_Out(e){return e===0||e===1?e:Math.pow(2,-10*e)*Math.sin((e-.1)*5*Math.PI)+1}static elastic_InOut(e){return e===0||e===1?e:(e*=2,e<1?-.5*Math.pow(2,10*(e-1))*Math.sin((e-1.1)*5*Math.PI):.5*Math.pow(2,-10*(e-1))*Math.sin((e-1.1)*5*Math.PI)+1)}static back_In(e){return e*e*((1.70158+1)*e-1.70158)}static back_Out(e){return--e*e*((1.70158+1)*e+1.70158)+1}static back_InOut(e){const t=1.70158*1.525;return(e*=2)<1?.5*(e*e*((t+1)*e-t)):.5*((e-=2)*e*((t+1)*e+t)+2)}static bounce_In(e){return 1-Te.bounce_Out(1-e)}static bounce_Out(e){return e<1/2.75?7.5625*e*e:e<2/2.75?7.5625*(e-=1.5/2.75)*e+.75:e<2.5/2.75?7.5625*(e-=2.25/2.75)*e+.9375:7.5625*(e-=2.625/2.75)*e+.984375}static bounce_InOut(e){return e<.5?Te.bounce_In(e*2)*.5:Te.bounce_Out(e*2-1)*.5+.5}},G=class{constructor({durationMS:e,delayMS:t=0,easeName:i="linear",onUpdate:o,onComplete:n=()=>{}}){d(this,"startMS",0);d(this,"rafID");d(this,"delayID");d(this,"durationMS");d(this,"delayMS");d(this,"easeFunc");d(this,"onUpdate");d(this,"onComplete");d(this,"update",()=>{this.rafID=window.requestAnimationFrame(this.update);let e=(performance.now()-this.startMS)/this.durationMS;e<0?e=0:e>1&&(e=1);const t=this.easeFunc(e);this.onUpdate(t,e),e>=1&&(this.onComplete(),this.stop())});this.durationMS=e,this.delayMS=t,this.easeFunc=Te[i],this.onUpdate=o,this.onComplete=n}start(){const e=()=>{this.startMS=performance.now(),this.rafID=window.requestAnimationFrame(this.update),clearTimeout(this.delayID)};return this.delayMS?this.delayID=window.setTimeout(e,this.delayMS):e(),this}stop(){return window.clearTimeout(this.delayID),window.cancelAnimationFrame(this.rafID),this.rafID=-1,this}setEase(e){return this.easeFunc=Te[e],this}},at=`#version 300 es

-- DEFINES_HOOK --

uniform Shared {
  float time;
  mat4 viewMatrix;
  mat4 projectionViewMatrix;
};

uniform mat4 u_worldMatrix;

#ifdef USE_TEXTURE
  uniform sampler2D diffuse;
#endif

#ifdef USE_SPIRAL_DEFORM
  uniform float u_deformAngle;
#endif

in vec4 aPosition;
in vec2 aUv;

#ifdef USE_SHADING
  in vec4 aNormal;
  out vec4 vNormal;
#endif

#ifdef USE_INSTANCING
  in mat4 aInstanceMatrix;
#endif

#ifdef IS_FOG
  out float vFogDepth;
#endif

out vec2 vUv;

vec4 doBoxTwist(vec4 pos, float t) {
	float st = sin(t);
	float ct = cos(t);
	vec4 new_pos;
	
	new_pos.y = pos.y * ct - pos.z * st;
	new_pos.z = pos.y * st + pos.z * ct;
	
	new_pos.x = pos.x;
	new_pos.w = pos.w;

	return new_pos;
}

void main () {
  mat4 worldMatrix = mat4(1.0);
  
  #ifdef USE_INSTANCING
    worldMatrix = aInstanceMatrix;
  #endif

  worldMatrix *= u_worldMatrix;
  
  vec4 position = aPosition;

  #ifdef USE_SPIRAL_DEFORM
    float ang = (position.x + 0.5) * sin(u_deformAngle) * u_deformAngle;
    position = doBoxTwist(position, ang);
  #endif

  gl_Position = projectionViewMatrix * worldMatrix * position;
  
  vUv = aUv;

  #ifdef USE_SHADING
    vec4 normal = aNormal;
    #ifdef USE_SPIRAL_DEFORM
      normal = doBoxTwist(normal, ang);
    #endif
    vNormal = normal;
  #endif

  #ifdef IS_FOG
    mat4 worldView = viewMatrix * worldMatrix;
    vFogDepth = -(worldView * aPosition).z;
  #endif

}`,ct=`#version 300 es
precision highp float;

-- DEFINES_HOOK --

uniform Shared {
  float time;
  mat4 viewMatrix;
  mat4 projectionViewMatrix;
};

#ifdef USE_TEXTURE
  uniform sampler2D u_diffuse;
#endif

#ifdef USE_SOLID_COLOR
  uniform vec4 u_solidColor;
#endif

#ifdef USE_UV_TRANSFORM
  uniform vec4 u_uvOffsetSizes;
#endif

#ifdef USE_BACKGROUND_SIZE_COVER
  
  uniform vec2 u_textureSize;
#endif

#ifdef SUPPORTS_FADING
  uniform float u_opacityMixFactor;
  uniform float u_fadeMixFactor;
#endif

#ifdef USE_GAUSSIAN_BLUR
  uniform vec2 u_resolution;
  uniform vec2 u_blurDirection;
#endif

#ifdef USE_MASK_TEXTURE
  uniform sampler2D u_maskTexture;
  uniform vec4 u_uvOffsetSizesMask;
  uniform float u_revealMixFactor;
#endif

#ifdef SUPPORTS_HOVER_MASK_FX
  uniform sampler2D u_maskTexture2;
  uniform float u_hoverMixFactor;
  uniform vec4 u_uvOffsetSizesHoverMask;
#endif

#ifdef IS_CUBE
  uniform float u_loadMixFactor;
#endif

#ifdef IS_FOG
  in float vFogDepth;
#endif

in vec4 vNormal;
in vec2 vUv;

out vec4 finalColor;

const float FOG_NEAR = 0.1;
const float FOG_FAR = 30.0;
const float FACE_COUNT = 6.0;
const float FACE_STEP = 1.0 / FACE_COUNT;
const float FACE_STEP2 = FACE_STEP * 2.0;

vec2 mapVec2Range(vec2 value, vec2 inMin, vec2 inMax, vec2 outMin, vec2 outMax) {
  return outMin + (outMax - outMin) * (value - inMin) / (inMax - inMin);
}
vec2 uvTransformBackgroundCover (vec2 uv, vec2 imageSize, vec2 displaySize) {
  float rs = displaySize.x / displaySize.y;
  float ri = imageSize.x / imageSize.y;
  vec2 new = rs < ri ? vec2(imageSize.x * displaySize.y / imageSize.y, displaySize.y) : vec2(displaySize.x, imageSize.y * displaySize.x / imageSize.x);
  vec2 offset = (rs < ri ? vec2((new.x - displaySize.x) / 2.0, 0.0) : vec2(0.0, (new.y - displaySize.y) / 2.0)) / new;
  return uv * displaySize / new + offset;
}
vec4 blur9(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.3846153846) * direction;
  vec2 off2 = vec2(3.2307692308) * direction;
  color += texture(image, uv) * 0.2270270270;
  color += texture(image, uv + (off1 / resolution)) * 0.3162162162;
  color += texture(image, uv - (off1 / resolution)) * 0.3162162162;
  color += texture(image, uv + (off2 / resolution)) * 0.0702702703;
  color += texture(image, uv - (off2 / resolution)) * 0.0702702703;
  return color;
}
vec4 blur13(sampler2D image, vec2 uv, vec2 resolution, vec2 direction) {
  vec4 color = vec4(0.0);
  vec2 off1 = vec2(1.411764705882353) * direction;
  vec2 off2 = vec2(3.2941176470588234) * direction;
  vec2 off3 = vec2(5.176470588235294) * direction;
  color += texture(image, uv) * 0.1964825501511404;
  color += texture(image, uv + (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv - (off1 / resolution)) * 0.2969069646728344;
  color += texture(image, uv + (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv - (off2 / resolution)) * 0.09447039785044732;
  color += texture(image, uv + (off3 / resolution)) * 0.010381362401148057;
  color += texture(image, uv - (off3 / resolution)) * 0.010381362401148057;
  return color;
}
float linearizeDepth(float depth, float near, float far) {
  float z = depth * 2.0 - 1.0; 
  return (2.0 * near * far) / (far + near - z * (far - near));	
}
vec4 blendNormal(vec4 base, vec4 blend, float opacity) {
	return (blend * opacity + base * (1.0 - opacity));
}
 
void main () {
  vec2 borderUV = vUv;
  vec2 uv = vUv;
  vec2 maskUV = vUv;
  vec2 hoverMaskUV = vUv;

  #ifdef IS_CUBE
    if (vUv.x > FACE_STEP && vUv.x < FACE_STEP2) {
      uv = mapVec2Range(uv, vec2(FACE_STEP), vec2(FACE_STEP2), vec2(0.0), vec2(1.0));
      borderUV = uv;
    }
  #endif

  #ifdef USE_BACKGROUND_SIZE_COVER
    uv = uvTransformBackgroundCover(uv, u_textureSize, vec2(MESH_WIDTH, MESH_HEIGHT));
  #endif

  #ifdef USE_UV_TRANSFORM
    uv = mix(
      u_uvOffsetSizes.xy,
      u_uvOffsetSizes.zw,
      uv
    );
    #ifdef USE_MASK_TEXTURE
      maskUV = uvTransformBackgroundCover(vUv, vec2(64.0), vec2(MESH_WIDTH, MESH_HEIGHT));
      maskUV = mix(
        u_uvOffsetSizesMask.xy,
        u_uvOffsetSizesMask.zw,
        maskUV
      );
    #endif
    #ifdef SUPPORTS_HOVER_MASK_FX
      hoverMaskUV = uvTransformBackgroundCover(vUv, vec2(128.0), vec2(MESH_WIDTH, MESH_HEIGHT));
      hoverMaskUV = mix(
        u_uvOffsetSizesHoverMask.xy,
        u_uvOffsetSizesHoverMask.zw,
        hoverMaskUV
      );
    #endif
  #endif

  #ifdef USE_SOLID_COLOR
    finalColor = u_solidColor;
  #endif

  #ifdef USE_TEXTURE
    
    float lodBias = -0.5;
    #ifdef IS_CUBE
      if (vUv.x > FACE_STEP && vUv.x < FACE_STEP2) { 
        float aspect = MESH_WIDTH / MESH_HEIGHT;
        float borderWidth = 0.02;
        float maxX = 1.0 - borderWidth;
        float minX = borderWidth;
        float maxY = 1.0 - borderWidth;
        float minY = borderWidth;
        if (
          borderUV.x < maxX &&
          borderUV.x > minX &&
          borderUV.y < maxY &&
          borderUV.y > minY
        ) {
          vec4 loadColor = vec4(vec3(sin(gl_FragCoord.x * 0.01 - time) * 0.2 + 0.6), 1.0);
          vec4 texColor = texture(u_diffuse, uv, -0.5);
          finalColor = mix(loadColor, texColor, u_loadMixFactor);
        } else {
          finalColor = vec4(vec3(0.3), 1.0);
        }
      } else {
        finalColor = vec4(vec3(0.3), 1.0);
      }
    #else
      #ifdef USE_GAUSSIAN_BLUR
        finalColor = blur9(u_diffuse, uv, u_resolution, u_blurDirection);
      #else
        #ifdef USE_MASK_TEXTURE
          vec4 maskColor = texture(u_maskTexture, maskUV);
          vec4 texColor = texture(u_diffuse, uv);
          finalColor = mix(vec4(0.0), texColor, 1.0 - step(u_revealMixFactor, maskColor.r));
          #ifdef SUPPORTS_HOVER_MASK_FX
            vec4 maskColor2 = texture(u_maskTexture2, hoverMaskUV);
            vec4 hoverColor = vec4(vec3(1.0) - texColor.rgb, texColor.a);
            hoverColor = mix(vec4(0.0), hoverColor, 1.0 - step(u_hoverMixFactor, maskColor2.r));
            finalColor.rgb = blendNormal(finalColor, hoverColor, u_hoverMixFactor).rgb;
          #endif
        #else
          finalColor = texture(u_diffuse, uv, -0.5);
        #endif
      #endif
    #endif
  #endif

  #ifdef IS_FOG
    float fogAmount = smoothstep(FOG_NEAR, FOG_FAR, vFogDepth);
    finalColor = mix(finalColor, BACKGROUND_COLOR, fogAmount);
  #endif

  #ifdef SUPPORTS_FADING
    finalColor.rgb = mix(BACKGROUND_COLOR.rgb, finalColor.rgb, u_fadeMixFactor);
    finalColor.a *= u_opacityMixFactor;
  #endif
}`,be;class lt extends ve{constructor(t,{geometry:i,solidColor:o,name:n,side:r=t.BACK}){const s={USE_SHADING:!0,USE_SOLID_COLOR:!!o,USE_SPIRAL_DEFORM:!0,USE_TEXTURE:!o,USE_UV_TRANSFORM:!0,USE_BACKGROUND_SIZE_COVER:!0,MESH_WIDTH:i.width,MESH_HEIGHT:i.height,IS_CUBE:!0,SUPPORTS_FADING:!0,BACKGROUND_COLOR:Qe};super(t,at,ct,s);d(this,"cameraUBOIndex");d(this,"textureAtlas");d(this,"side");d(this,"isSolidColor",!1);d(this,"posterLoaded",!1);ze(this,be,0);this.isSolidColor=!!o,this.name=n,this.side=r;const{interleavedArray:l,indicesArray:c,width:h,height:a,depth:u,vertexStride:_,vertexCount:f}=i;this.vertexCount=f,this.boundingBox={min:$(-h/2,-a/2,-u/2),max:$(h/2,a/2,u/2)},this.setUniform("u_deformAngle",{type:t.FLOAT}),this.setUniform("u_fadeMixFactor",{type:t.FLOAT,value:1}),this.setUniform("u_opacityMixFactor",{type:t.FLOAT,value:0}),this.setUniform("u_uvOffsetSizes",{type:t.FLOAT_VEC4}),this.setUniform("u_textureSize",{type:t.FLOAT_VEC2}),this.isSolidColor||(this.setUniform("u_diffuse",{type:t.INT,value:0}),this.setUniform("u_loadMixFactor",{type:t.FLOAT,value:0}));const E=t.createBuffer(),p=t.createBuffer(),M=t.getAttribLocation(this.program,"aPosition"),b=t.getAttribLocation(this.program,"aNormal"),g=t.getAttribLocation(this.program,"aUv");this.isSolidColor&&this.setUniform("u_solidColor",{type:t.FLOAT_VEC4,value:o}),t.bindVertexArray(this.vao),t.bindBuffer(t.ARRAY_BUFFER,E),t.bufferData(t.ARRAY_BUFFER,l,t.STATIC_DRAW),t.enableVertexAttribArray(M),t.vertexAttribPointer(M,3,t.FLOAT,!1,_*Float32Array.BYTES_PER_ELEMENT,0),t.enableVertexAttribArray(b),t.vertexAttribPointer(b,3,t.FLOAT,!1,_*Float32Array.BYTES_PER_ELEMENT,3*Float32Array.BYTES_PER_ELEMENT),t.enableVertexAttribArray(g),t.vertexAttribPointer(g,2,t.FLOAT,!1,_*Float32Array.BYTES_PER_ELEMENT,6*Float32Array.BYTES_PER_ELEMENT),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,p),t.bufferData(t.ELEMENT_ARRAY_BUFFER,c,t.STATIC_DRAW),this.cameraUBOIndex=t.getUniformBlockIndex(this.program,"Camera")}get AABB(){const t=It(this.boundingBox.min),i=It(this.boundingBox.max);return oe(t,t,this.worldMatrix),oe(i,i,this.worldMatrix),{min:t,max:i}}set deformationAngle(t){this.updateUniform("u_deformAngle",t)}get fadeFactor(){return Ue(this,be)}set fadeFactor(t){this.updateUniform("u_fadeMixFactor",t),ke(this,be,t)}set opacityFactor(t){this.updateUniform("u_opacityMixFactor",t)}displayPoster(t,i=!1){if(!this.name)throw new Error("you need to supply a name in order to display a poster");const o=xe.getInstance();o.pack(this.name,t);const[n,r]=o.getUv2(this.name);if(!n)throw new Error("mega texture allocation failed");this.textureAtlas=r,this.updateUniform("u_uvOffsetSizes",new Float32Array([n[0],n[1],n[4],n[5]])),this.updateUniform("u_textureSize",new Float32Array([t.width,t.height])),this.isSolidColor||(i?new G({durationMS:En,onUpdate:s=>{this.updateUniform("u_loadMixFactor",s)}}).start():this.updateUniform("u_loadMixFactor",1)),this.posterLoaded=!0}render(){if(!this.visible)return;const t=this.gl;t.uniformBlockBinding(this.program,this.cameraUBOIndex,0),t.useProgram(this.program),this.uploadWorldMatrix(),this.side!==t.BACK&&(t.enable(t.CULL_FACE),t.cullFace(this.side)),t.blendFunc(t.ONE,t.ONE_MINUS_SRC_ALPHA),t.enable(t.BLEND),t.activeTexture(t.TEXTURE0),t.bindTexture(t.TEXTURE_2D,this.textureAtlas),t.bindVertexArray(this.vao),t.drawElements(t.TRIANGLES,this.vertexCount,t.UNSIGNED_SHORT,0),this.side!==t.BACK&&t.disable(t.CULL_FACE),t.disable(t.BLEND)}}be=new WeakMap;class oi extends ve{constructor(t,{geometry:i,uniforms:o={},defines:n={},name:r}){super(t,at,ct,w({CAMERA_NEAR:et,CAMERA_FAR:tt,BACKGROUND_COLOR:Qe},n),r);d(this,"cameraUBOIndex");d(this,"_worldSpaceVertPositions");const{interleavedArray:s,indicesArray:l,vertexStride:c,vertexCount:h,width:a,height:u}=i;this.vertexCount=h,this.boundingBox={min:[-a/2,u/2,0],max:[a/2,-u/2,0]};for(const[M,{type:b,value:g}]of Object.entries(o))this.setUniform(M,{type:b,value:g});const _=t.createBuffer(),f=t.createBuffer(),E=t.getAttribLocation(this.program,"aPosition"),p=t.getAttribLocation(this.program,"aUv");t.bindVertexArray(this.vao),t.bindBuffer(t.ARRAY_BUFFER,_),t.bufferData(t.ARRAY_BUFFER,s,t.STATIC_DRAW),t.enableVertexAttribArray(E),t.vertexAttribPointer(E,3,t.FLOAT,!1,c*Float32Array.BYTES_PER_ELEMENT,0),t.enableVertexAttribArray(p),t.vertexAttribPointer(p,2,t.FLOAT,!1,c*Float32Array.BYTES_PER_ELEMENT,3*Float32Array.BYTES_PER_ELEMENT),t.bindBuffer(t.ELEMENT_ARRAY_BUFFER,f),t.bufferData(t.ELEMENT_ARRAY_BUFFER,l,t.STATIC_DRAW),this.cameraUBOIndex=t.getUniformBlockIndex(this.program,"Shared"),this.updateWorldMatrix()}get cornersInWorldSpace(){const t=this.boundingBox.max[0]-this.boundingBox.min[0],i=this.boundingBox.max[1]-this.boundingBox.min[1],o=$(-t/2,i/2,0),n=$(-t/2,-i/2,0),r=$(t/2,-i/2,0),s=$(t/2,i/2,0);return oe(o,o,this.worldMatrix),oe(n,n,this.worldMatrix),oe(r,r,this.worldMatrix),oe(s,s,this.worldMatrix),this._worldSpaceVertPositions=[o,n,r,s],this._worldSpaceVertPositions}preRender(t){const i=this.gl;i.uniformBlockBinding(this.program,this.cameraUBOIndex,t),i.useProgram(this.program),this.uploadWorldMatrix()}render(t=0){if(!this._visible)return;const i=this.gl;this.preRender(t),i.bindVertexArray(this.vao),i.drawElements(i.TRIANGLES,this.vertexCount,i.UNSIGNED_SHORT,0)}}var Bn="/assets/label-transition.869895e1.png",Vn="/assets/label-transition2.4b0614e0.png";const We=class extends oi{constructor(t,{geometry:i,label:o,texWidth:n=We.TEXTURE_SIZE,textAlign:r="left",textColor:s="white",fontSize:l=50,transparent:c=!1,supportHover:h=!1}){const a={MESH_WIDTH:i.width,MESH_HEIGHT:i.height,USE_SHADING:!0,USE_MODEL_MATRIX:!0,USE_UV_TRANSFORM:!0,USE_TEXTURE:!0,SUPPORTS_FADING:!0,USE_MASK_TEXTURE:!0};h&&(a.SUPPORTS_HOVER_MASK_FX=!0);super(t,{geometry:i,defines:a,name:o});d(this,"label");d(this,"texture",null);d(this,"maskTexture",null);d(this,"maskTexture2",null);d(this,"transparent",!1);d(this,"supportHover",!1);this.label=o,this.transparent=c,this.supportHover=h;const{width:u,height:_}=i,f=u/_,E=xe.getInstance(),p=v=>{try{E.pack(v.src,v)}catch{}const[T,S]=E.getUv2(v.src);if(!T)throw new Error("could not allocate label mask texture");return Promise.resolve([T,S])};De(Bn).then(p).then(([v,T])=>{this.maskTexture=T,this.updateUniform("u_uvOffsetSizesMask",new Float32Array([v[0],v[1],v[4],v[5]]))}),h&&De(Vn).then(p).then(([v,T])=>{this.maskTexture2=T,this.updateUniform("u_uvOffsetSizesHoverMask",new Float32Array([v[0],v[1],v[4],v[5]]))});const M=n/f,b=`label-${o}`,g=We.drawLabelToCanvas(o,r,s,l,n,M);try{E.pack(b,g)}catch{}const[L,U]=E.getUv2(b);if(!L)throw new Error("mega texture allocation failed");this.texture=U,this.setUniform("u_revealMixFactor",{type:t.FLOAT,value:0}),this.setUniform("u_fadeMixFactor",{type:t.FLOAT,value:1}),this.setUniform("u_opacityMixFactor",{type:t.FLOAT,value:1}),h&&(this.setUniform("u_hoverMixFactor",{type:t.FLOAT,value:0}),this.setUniform("u_uvOffsetSizesHoverMask",{type:t.FLOAT_VEC4}),this.setUniform("u_maskTexture2",{type:t.INT,value:2})),this.setUniform("u_uvOffsetSizes",{type:t.FLOAT_VEC4,value:new Float32Array([L[0],L[1],L[4],L[5]])}),this.setUniform("u_diffuse",{type:t.INT,value:0}),this.setUniform("u_maskTexture",{type:t.INT,value:1}),this.setUniform("u_uvOffsetSizesMask",{type:t.FLOAT_VEC4})}static drawLabelToCanvas(t,i,o,n,r=400,s=120){const l=document.createElement("canvas");l.width=r,l.height=s;const c=l.getContext("2d");c.fillStyle="black",c.fillRect(0,0,l.width,l.height);const h=t.trim();c.font=`${n}px ${se}`;const a=c.measureText(h).width,u=n/a,_=n*u;c.font=`${_} ${se}`,c.fillStyle=o,c.textBaseline="middle";const f=42;c.textAlign=i;const E=i==="center"?l.width/2:f,p=s/2;return c.fillText(h,E,p),l}set revealMixFactor(t){this.updateUniform("u_revealMixFactor",t)}set fadeFactor(t){this.updateUniform("u_fadeMixFactor",t)}set opacityFactor(t){this.updateUniform("u_opacityMixFactor",t)}set hoverFactor(t){!this.supportHover||this.updateUniform("u_hoverMixFactor",t)}render(t=0){if(!this._visible)return;this.preRender(t);const i=this.gl;i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.texture),i.activeTexture(i.TEXTURE1),i.bindTexture(i.TEXTURE_2D,this.maskTexture),this.supportHover&&(i.activeTexture(i.TEXTURE2),i.bindTexture(i.TEXTURE_2D,this.maskTexture2)),this.transparent&&(i.blendFunc(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA),i.enable(i.BLEND),i.disable(i.DEPTH_TEST)),i.bindVertexArray(this.vao),i.drawElements(i.TRIANGLES,this.vertexCount,i.UNSIGNED_SHORT,0),this.transparent&&(i.disable(i.BLEND),i.enable(i.DEPTH_TEST))}};let Ae=We;d(Ae,"TEXTURE_SIZE",1e3);var me;const D=class extends de{constructor(t,{cubeGeometry:i,labelGeometry:o,openButtonGeometry:n,name:r,project:s,hasLabel:l=!1,isAboutView:c=!1,externalURL:h}){super(r);d(this,"gl");d(this,"projectThumbNode");d(this,"hoverThumbNode");d(this,"projectLabelNode");d(this,"projectRoleNode");d(this,"openLabelNode");d(this,"isAboutView",!1);d(this,"project");d(this,"externalURL");d(this,"open",!1);ze(this,me,-1);d(this,"tweenAnimMode",1);d(this,"loadThumbnail",async t=>{var n,r;if(this.projectThumbNode.posterLoaded)return;if(t){this.projectThumbNode.displayPoster(t);return}if((n=this.project)==null?void 0:n.image){const s=await De((r=this.project)==null?void 0:r.image.url);this.projectThumbNode.displayPoster(s,!0);return}const i=document.createElement("canvas");i.width=600,i.height=300;const o=i.getContext("2d");o.font=`100px ${se}`,o.fillStyle="white",o.textAlign="center",o.textBaseline="middle",o.fillText(this.name,i.width/2,i.height/2),this.projectThumbNode.displayPoster(i)});this.gl=t,this.project=s,this.externalURL=h,this.isAboutView=c;const a=new de(D.MESH_WRAPPER_NAME);a.setParent(this),this.projectThumbNode=new lt(t,{geometry:i,name:r}).setScale([0,0,0]).setParent(a),this.hoverThumbNode=new lt(t,{geometry:i,solidColor:[0,0,1,1],side:t.FRONT}),this.hoverThumbNode.visible=!1;const u=1+D.HOVER_MESH_UPSCALE_FACTOR;this.hoverThumbNode.setScale([u,u,u]).setParent(a),l&&(this.projectLabelNode=new Ae(t,{geometry:o,label:r,fontSize:50,transparent:!0}),this.projectLabelNode.visible=!1,this.projectLabelNode.setParent(a),this.projectLabelNode.setPosition([0,-H/2-o.height/2-Xt,Ne/2+Wt])),s&&(this.projectRoleNode=new Ae(t,{geometry:o,label:s.tech||"",fontSize:50,textColor:"#bbb",transparent:!0}),this.projectRoleNode.visible=!1,this.projectRoleNode.setPosition([0,H/2+o.height/2+Xt,Ne/2+Wt]),this.projectRoleNode.revealMixFactor=0,this.projectRoleNode.setParent(a),this.openLabelNode=new Ae(t,{geometry:n,supportHover:!0,transparent:!0,label:"OPEN",texWidth:120,fontSize:30,textAlign:"center",textColor:"#aaa"}),this.openLabelNode.visible=!1,this.openLabelNode.revealMixFactor=0,this.openLabelNode.setPosition([ae/2-Gt/2-.1,-H/2-n.height/2-an-.2,Ne/2+cn+.1]),this.openLabelNode.setParent(a))}set visible(t){!t&&Ue(this,me)!==0&&(this.visibilityTweenFactor=0),this._visible=t;const i=this.findChild(o=>o.name===D.MESH_WRAPPER_NAME);i==null||i.traverse(o=>{o.visible=t})}get children(){return this._children.filter(t=>!t.findParentByName(D.MESH_WRAPPER_NAME))}get siblings(){return this.parentNode?this.parentNode.children:[]}get fadeFactor(){return this.projectThumbNode.fadeFactor}set fadeFactor(t){this.projectThumbNode.fadeFactor=t,this.projectLabelNode&&(this.projectLabelNode.fadeFactor=t)}set opacityFactor(t){this.projectThumbNode.opacityFactor=t,this.projectLabelNode&&(this.projectLabelNode.opacityFactor=t)}set labelRevealFactor(t){this.projectLabelNode&&(this.projectLabelNode.revealMixFactor=t)}set openHoverFactor(t){this.openLabelNode&&(this.openLabelNode.hoverFactor=t)}set metaLabelsRevealFactor(t){this.projectRoleNode&&(this.projectRoleNode.revealMixFactor=t),this.openLabelNode&&(this.openLabelNode.revealMixFactor=t)}get visibilityTweenFactor(){return Ue(this,me)}set visibilityTweenFactor(t){ke(this,me,t);const i=this.tweenAnimMode===0?D.ROTATION_X_AXIS_ON_OPEN:D.ROTATION_X_AXIS_ON_CLOSE,o=this.tweenAnimMode===0?D.DEFORM_ANGLE_ON_OPEN:D.DEFORM_ANGLE_ON_CLOSE,n=i-i*t,r=i-o*t,s=this.tweenAnimMode===1?t:1,l=this.projectThumbNode.rotation[1],c=this.projectThumbNode.rotation[2];this.projectThumbNode.setScale([s,s,s]).setRotation([n,l,c]),this.projectThumbNode.opacityFactor=t,this.projectThumbNode.deformationAngle=D.DEFORM_ANGLE_ON_OPEN-r;const h=s+D.HOVER_MESH_UPSCALE_FACTOR;this.hoverThumbNode.setScale([h,h,h]).setRotation([n,l,c]),this.hoverThumbNode.opacityFactor=t,this.hoverThumbNode.deformationAngle=D.DEFORM_ANGLE_ON_OPEN-r,this.projectLabelNode&&(this.projectLabelNode.revealMixFactor=t),this.updateWorldMatrix()}testRayIntersection(t,i){if(!this._visible)return null;const o=this.projectThumbNode.AABB;let n=null,r=!1;if(n=Hn(t,i,o),this.projectLabelNode){const l=this.projectLabelNode.cornersInWorldSpace,c=ni(t,i,l);if(c){const[h]=c;n=h}}if(this.open&&this.openLabelNode){const l=this.openLabelNode.cornersInWorldSpace,c=ni(t,i,l);if(c){const[h]=c;n=h,r=!0}}return this.open&&this.project?this.hoverThumbNode.visible=!1:this.hoverThumbNode.visible=!!n,[n,r]}render(){if(!!this._visible)for(let t=0;t<this._children.length;t++)this._children[t].render()}};let A=D;me=new WeakMap,d(A,"ROTATION_X_AXIS_ON_OPEN",Math.PI),d(A,"ROTATION_X_AXIS_ON_CLOSE",Math.PI),d(A,"DEFORM_ANGLE_ON_OPEN",Math.PI*.5),d(A,"DEFORM_ANGLE_ON_CLOSE",Math.PI*.6),d(A,"FADED_OUT_FACTOR",.2),d(A,"HOVER_MESH_UPSCALE_FACTOR",.05),d(A,"MESH_WRAPPER_NAME","mesh-wrapper");const jn=e=>e.map(t=>{var i;return{uid:t.uid,title:t.data.project_title[0].text,type:t.data.project_type[0].text,year:parseInt(t.data.project_year[0].text,10),url:(i=t.data.project_link)==null?void 0:i.url,tech:t.data.project_tech[0].text,date:{first:t.first_publication_date,last:t.last_publication_date},image:{url:t.data.project_image.url,width:t.data.project_image.dimensions.width,height:t.data.project_image.dimensions.height}}}),Xn=e=>[...e].reduce((i,o)=>{const n=o.year;return i[n]?i[n].push(o):i[n]=[o],i},{}),Wn=(e,t=0,i)=>{const o=e%_e,n=(e-o)/_e*-1,r=pe/_e,s=r/ae*1.4,l=o*r+r/2-pe/2,c=n*H*s-Je*t,h=t*nn,a=$(l,c,h);return i&&Yi(a,a,i),a},Gn=e=>{const t=Math.ceil(e/_e),o=pe/_e/ae*1.4;return t*H*o+H/2},De=e=>new Promise((t,i)=>{const o=new Image;o.onload=()=>t(o),o.onerror=n=>i(n),o.crossOrigin="anonymous",o.src=e}),Yn=({durationMS:e,delayMS:t,easeName:i,onUpdate:o,onComplete:n})=>new Promise(r=>new G({durationMS:e,delayMS:t,easeName:i,onUpdate:o,onComplete:()=>{n&&n(),r(null)}}).start()),Me=(e,t)=>{e.traverse(i=>{i instanceof A&&t(i)})},zn=e=>`${e.charAt(0).toUpperCase()}${e.slice(1)}`,ri=(e,t=400)=>{const i=document.createElement("canvas"),o=i.getContext("2d");i.width=t;const n=ae/H;i.height=t/n,o.fillStyle="#aaa",o.font=`24px ${se}`;const r=24,s=40;return o.textAlign="left",o.fillText(e,r,s),[i,o,r]},Pe=(e,t,i,o=400)=>{const[n,r,s]=ri(e,o);r.fillStyle="#fff",r.font=`62px ${se}`,r.textBaseline="middle";const l=r.measureText(t),h=(l.actualBoundingBoxAscent+l.actualBoundingBoxDescent)*1.55,a=10;return r.fillText(t,s,n.height/2-h/2+a),r.fillText(i,s,n.height/2+h/2+a),n},dt=(e,t,i=400)=>{const[o,n,r]=ri(e,i);n.fillStyle="#fff",n.font=`36px ${se}`,n.textBaseline="middle";const s=n.measureText(t[0]),l=(s.actualBoundingBoxAscent+s.actualBoundingBoxDescent)*1.9,h=l*3;return t.forEach((a,u)=>{n.fillText(a,r,o.height/2-h/4+u*l)}),o};class kn extends ve{constructor(t,i,o,n=[1,0,0,1]){super(t,at,ct,{USE_SOLID_COLOR:!0});d(this,"cameraUBOIndex");d(this,"startVec3");d(this,"endVec3");this.setUniform("u_solidColor",{type:t.FLOAT_VEC4,value:new Float32Array([1,0,0,1])}),this.setUniform("u_worldMatrix",{type:t.FLOAT_MAT4,value:zi()}),this.startVec3=i,this.endVec3=o;const r=t.getAttribLocation(this.program,"aPosition"),s=t.getUniformLocation(this.program,"solidColor");t.useProgram(this.program),t.uniform4f(s,n[0],n[1],n[2],n[3]),t.useProgram(null);const l=new Float32Array([...i,...o]),c=t.createBuffer();t.bindVertexArray(this.vao),t.bindBuffer(t.ARRAY_BUFFER,c),t.bufferData(t.ARRAY_BUFFER,l,t.STATIC_DRAW),t.enableVertexAttribArray(r),t.vertexAttribPointer(r,3,t.FLOAT,!1,0,0),t.bindVertexArray(null),this.cameraUBOIndex=t.getUniformBlockIndex(this.program,"Camera")}render(){const t=this.gl;t.uniformBlockBinding(this.program,this.cameraUBOIndex,0),t.useProgram(this.program),t.bindVertexArray(this.vao),t.drawArrays(t.LINES,0,2),t.bindVertexArray(null)}}class $n extends oi{constructor(t){const i=tt*2,o=nt({width:i,height:i}),n={IS_FOG:!0,USE_SOLID_COLOR:!0,BACKGROUND_COLOR:Qe};super(t,{geometry:o,defines:n,name:"floor"});this.setPosition([0,-28,0]).setRotation([Math.PI*.5,0,0]).updateWorldMatrix(),this.setUniform("u_solidColor",{type:t.FLOAT_VEC4,value:new Float32Array([.2,.2,.2,1])})}}var Kn="/assets/profile-pic.cc03cda0.png";const J={cameraFreeMode:!1},ut=new ki({autoPlace:!1});N.getState().ui.isDebugMode&&(ut.domElement.setAttribute("style",`
      position: fixed;
      top: 0;
      left: 0;
      z-index: 99999;
    `),document.body.appendChild(ut.domElement));ut.add(J,"cameraFreeMode").onChange(e=>{e?Be.start():Be.pause()});const Zn=document.getElementById("app"),B=document.createElement("canvas");pi();Zn.appendChild(B);const x=B.getContext("webgl2",{antialias:!0,alpha:!1});let si=0,He=3,P,m,ai,ci,ht,Be,Ve=!1;const li=new Float32Array(1),Y=$(0,0,Ie),ee=$i(),V=new Map,di=new de,Se=new de,C=new de,ft=[],je=[];C.setParent(Se);xe.debugMode=N.getState().ui.isDebugMode;xe.gl=x;const z=new Jt(ti(Ht),B.width/B.height,et,1e3);z.position=[7,8,10];z.lookAt=[0,0,0];const I=new Jt(ti(Ht),B.width/B.height,et,tt);I.position=[0,0,Ie];I.lookAt=[0,0,0];N.getState().ui.isDebugMode&&(ht=new Dn(x,I),Be=new yn(z,B),J.cameraFreeMode||Be.pause());const ui=In({width:ae,height:H,depth:Ne,widthSegments:30,depthSegments:30,uvOffsetEachFace:!0}),qn=nt({width:on,height:rn}),Qn=nt({width:Gt,height:sn}),y={cubeGeometry:ui,labelGeometry:qn,openButtonGeometry:Qn},Jn=new $n(x),eo=new lt(x,{geometry:ui,solidColor:[0,0,1,1]}),Xe=bn(x,eo.program,"Shared",["time","viewMatrix","projectionViewMatrix"]),mt=Rn(x,Xe.blockSize,0);fetch(tn).then(e=>e.json()).then(jn).then(e=>{var h;const t=Xn(e),i=C.findChild(a=>a.name==="projects"),o=C.findChild(a=>a.name==="about"),n=C.findChild(a=>a.name==="contact"),r=C.findChild(a=>a.name==="blog"),s=Object.entries(t).map(([a,u])=>[parseInt(a,10),u]).sort(([a],[u])=>u-a);for(const[a,u]of s){const _=new A(x,R(w({},y),{name:a.toString()}));_.visibilityTweenFactor=0,_.visible=!1,_.setParent(i);for(let f=0;f<u.length;f++){const E=u[f],p=new A(x,R(w({},y),{name:E.title,project:E,hasLabel:!0}));p.visible=!1,p.visibilityTweenFactor=0,p.setParent(_)}}const l={};Me(Se,a=>{a.projectLabelNode&&je.push(a.projectLabelNode),a.projectRoleNode&&je.push(a.projectRoleNode),a.openLabelNode&&je.push(a.openLabelNode),ft.push(a.projectThumbNode),ft.push(a.hoverThumbNode),!a.project&&(l[a.uid]=Gn(a.children.length))}),N.dispatch(Ji(l)),mi(C,0,-1),k({node:[i,o,n,r],visible:!0});const c=document.getElementById("lds-dual-ring");(h=c.parentNode)==null||h.removeChild(c)});N.subscribe(()=>{const{ui:{activeItemUID:e}}=N.getState();m&&e!==ai&&(document.title=m.name?`${zn(m.name)} | ${Vt}`:Vt),ai=e});to();document.body.addEventListener("mousemove",no);document.body.addEventListener("click",oo);document.body.addEventListener("mouseup",io);window.addEventListener("resize",ro);requestAnimationFrame(hi);function to(){const e=new A(x,R(w({},y),{name:"projects"}));e.loadThumbnail(),e.visible=!1,e.setParent(C);const t=new A(x,R(w({},y),{name:"about"}));t.visible=!1,t.setParent(C).loadThumbnail();const i=new A(x,R(w({},y),{name:"contact"}));i.visible=!1,i.setParent(C).loadThumbnail();const o=new A(x,R(w({},y),{name:"blog",externalURL:"https://archive.georgi-nikolov.com/"}));o.visible=!1,o.setParent(C).loadThumbnail();const n=new A(x,R(w({},y),{isAboutView:!0,name:"profile-pic"}));De(Kn).then(M=>{n.loadThumbnail(M)}),n.visible=!1,n.setParent(t);const r=new A(x,R(w({},y),{isAboutView:!0,name:"personal-name"}));r.loadThumbnail(Pe("name","Georgi","Nikolov")),r.visible=!1,r.setParent(t);const s=new A(x,R(w({},y),{isAboutView:!0,name:"job-title"}));s.loadThumbnail(Pe("job title","Frontend","Developer")),s.visible=!1,s.setParent(t);const l=new A(x,R(w({},y),{isAboutView:!0,name:"current-country"}));l.loadThumbnail(Pe("lives in","Berlin","Germany")),l.visible=!1,l.setParent(t);const c=new A(x,R(w({},y),{isAboutView:!0,name:"from-country"}));c.loadThumbnail(Pe("from","Sofia","Bulgaria")),c.visible=!1,c.setParent(t);const h=new A(x,R(w({},y),{isAboutView:!0,name:"current-work"}));h.loadThumbnail(dt("position",["Freelancer","AWWWARDS Jury"])),h.visible=!1,h.setParent(t);const a=new A(x,R(w({},y),{isAboutView:!0,name:"skills"}));a.loadThumbnail(dt("skills",["Typescript CSS","WebGL WebGPU","GLSL React Node.js"])),a.visible=!1,a.setParent(t);const u=new A(x,R(w({},y),{isAboutView:!0,name:"website-tech"}));u.loadThumbnail(dt("this site runs on",["hwoa-rang-gl2","hwoa-rang-tween","gl-matrix redux"])),u.visible=!1,u.setParent(t);const _=new A(x,R(w({},y),{name:"twitter",externalURL:"https://twitter.com/georgiNikoloff"}));_.visible=!1,_.setParent(i).loadThumbnail();const f=new A(x,R(w({},y),{name:"github",externalURL:"https://github.com/gnikoloff"}));f.visible=!1,f.setParent(i).loadThumbnail();const E=new A(x,R(w({},y),{name:"codepen",externalURL:"https://codepen.io/gbnikolov"}));E.visible=!1,E.setParent(i).loadThumbnail();const p=new A(x,R(w({},y),{name:"mail",externalURL:"mailto:connect@georgi-nikolov.com"}));p.visible=!1,p.setParent(i).loadThumbnail()}function io(){N.dispatch(Pt([-5e3,-5e3]))}function no(e){N.dispatch(Pt([e.pageX,e.pageY])),N.dispatch(en([e.pageX,e.pageY]))}async function oo(e){const t=e.pageX/innerWidth*2-1,i=2-e.pageY/innerHeight*2-1,{rayStart:o,rayEnd:n,rayDirection:r}=ii([t,i],J.cameraFreeMode?z:I);e.metaKey&&new kn(x,o,n).setParent(di);const{ui:{childrenRowHeights:s,isCurrentlyTransitionViews:l,activeItemUID:c}}=N.getState();if(l)return;const[h,a]=fi(o,r);if(m=h,a&&m.project){open(m.project.url,"_blank");return}N.dispatch(re(!0));const u=c?C.findChild(v=>v.uid===c):null;if(((u==null?void 0:u.project)||(u==null?void 0:u.isAboutView))&&!(m==null?void 0:m.project)&&!(m==null?void 0:m.isAboutView)&&(Me(Se,v=>{v!==u&&new G({durationMS:500,onUpdate:T=>{v.fadeFactor=Le(Ce(T,0,1,A.FADED_OUT_FACTOR,1),A.FADED_OUT_FACTOR,1)}}).start()}),Yn({durationMS:500,onUpdate:v=>{u.metaLabelsRevealFactor=1-v}})),!m){if(N.dispatch(re(!1)),!u||(u.open=!1,!u.parentNode)||u.levelIndex-2<0)return;m=u.parentNode,k({node:u,visible:!1}),N.dispatch(Ke(u.parentNode.uid));const v=u.levelIndex-2,T=s[u.parentNode.uid],S=v===0?0:-T/2-Je*v+H,j=Ie+v*Yt;pt({newX:0,newY:S,newZ:j});return}if(m.externalURL){m.externalURL.startsWith("mailto")?open(m.externalURL):open(m.externalURL,"_blank"),N.dispatch(re(!1));return}if(m.project||m.isAboutView){if(m.open){N.dispatch(re(!1));return}m.open=!0,u&&(u.open=!1),new G({durationMS:500,onUpdate:v=>{m.metaLabelsRevealFactor=v,(u==null?void 0:u.project)||(u==null?void 0:u.isAboutView)?(m.fadeFactor=Le(Ce(v,0,1,A.FADED_OUT_FACTOR,1),A.FADED_OUT_FACTOR,1),u.fadeFactor=Le(Ce(v,0,1,1,A.FADED_OUT_FACTOR),A.FADED_OUT_FACTOR,1),u.metaLabelsRevealFactor=1-v):Me(Se,T=>{T!==m&&(T.fadeFactor=Le(Ce(v,0,1,1,A.FADED_OUT_FACTOR),A.FADED_OUT_FACTOR,1))})}}).start(),pt({newX:m.position[0],newY:m.position[1],newZ:m.position[2]+ln,positionTweenDurationMS:600,positionTweenEaseName:"quad_InOut",lookAtTweenDurationMS:900,lookAtTweenEaseName:"quad_In"}),P=m,N.dispatch(Ke(m.uid)),N.dispatch(re(!1));return}const _=m.levelIndex-2,f=u?u.levelIndex-2:0,E=_-f;let p=0,M=!1;if(E===0)m.open=m===u?!m.open:!0,m===u?k({node:m,visible:m.open}):(m.open=!0,u&&(u.open?k({node:u,visible:!1}):k({node:u,visible:!1}),u.open=!1),k({node:m,visible:!0}));else if(E>0)m.open=!0,P&&(P.open=!1),k({node:m,visible:m.open});else if(E<0){m.open=!!m.findChild(S=>S===P),P&&(P.open=!1,p=m.findChild(S=>S.uid===P.uid)?0:1,(P.project||P.isAboutView)&&!(m.project||m.isAboutView)&&P.parentNode===m&&(p=-1,M=!0));const v=[];Me(Se,S=>{S.findParentByName(A.MESH_WRAPPER_NAME)||S.levelIndex<=m.levelIndex||v.push(S)}),await k({node:v,visible:!1});const T=u==null?void 0:u.findParent(S=>S.levelIndex===m.levelIndex);k({node:m,visible:m!==T})}const b=m.levelIndex-2+(m.open?1:0),g=p===-1?P.project?s[m.parentNode.uid]:H:p===1||m.open?s[m.uid]:s[m.parentNode.uid],L=b===0?0:-g/2-Je*(b+p)+H,U=Ie+(b+p)*Yt;pt({newX:0,newY:L,newZ:U,newLookAtX:0,newLookAtY:L,newLookAtZ:-100}),console.log({isParentActiveUID:M}),M&&(m=m.parentNode),P=m,N.dispatch(Ke(M?m.parentNode.uid:m.uid)),N.dispatch(re(!1))}function hi(e){e*=.001;const t=Math.min(e-si,1);si=e,requestAnimationFrame(hi);const{ui:{mousePos:i,clickPos:o,activeItemUID:n,showCubeHighlight:r}}=N.getState(),s=o[0]/innerWidth*2-1,l=2-o[1]/innerHeight*2-1,{rayStart:c,rayDirection:h}=ii([s,l],J.cameraFreeMode?z:I),[a,u]=fi(c,h);if(a)u&&a===ci&&Ve&&(new G({durationMS:300,onUpdate:T=>{a.openHoverFactor=T}}).start(),Ve=!1);else{const T=n?C.findChild(S=>S.uid===n):null;T&&(Ve||(new G({durationMS:300,onUpdate:S=>{T.openHoverFactor=1-S}}).start(),Ve=!0))}ci=a,a&&a.uid!==n&&r||a&&!a.project&&!a.isAboutView&&r?N.dispatch(Ze(!0)):N.dispatch(Ze(a&&a.open&&u)),He+=((a&&(a.project||a.isAboutView)?1:3)-He)*t;const f=(i[0]/innerWidth-.5)*He,E=(1-i[1]/innerHeight-.5)*He,p=t*2,M=f+-f*p,b=E+-E*p,g=0,L=Y[0]+M,U=Y[1]+b,v=Y[2]+g;if(I.position[0]+=(L-I.position[0])*p,I.position[1]+=(U-I.position[1])*p,I.position[2]+=(v-I.position[2])*p,I.lookAt[0]=0,I.lookAt[1]=ee[1],I.lookAt[2]=0,I.updateViewMatrix().updateProjectionViewMatrix(),z.updateViewMatrix().updateProjectionViewMatrix(),mt){const T=J.cameraFreeMode?z.viewMatrix:I.viewMatrix,S=J.cameraFreeMode?z.projectionViewMatrix:I.projectionViewMatrix;x.bindBuffer(x.UNIFORM_BUFFER,mt),li[0]=e,x.bufferSubData(x.UNIFORM_BUFFER,Xe.uniforms.time.offset,li,0),x.bufferSubData(x.UNIFORM_BUFFER,Xe.uniforms.viewMatrix.offset,T,0),x.bufferSubData(x.UNIFORM_BUFFER,Xe.uniforms.projectionViewMatrix.offset,S,0)}x.bindBuffer(x.UNIFORM_BUFFER,null),x.enable(x.DEPTH_TEST),x.viewport(0,0,x.drawingBufferWidth,x.drawingBufferHeight),x.clearColor(...jt),x.clear(x.COLOR_BUFFER_BIT|x.DEPTH_BUFFER_BIT),ht&&J.cameraFreeMode&&ht.preRender(z).render(),mt&&(Jn.render(),ft.forEach(T=>T.render()),je.forEach(T=>T.render())),di.render()}function fi(e,t){let i=1/0,o,n=!1;return Me(C,r=>{const s=r.testRayIntersection(e,t);if(!s)return;const[l,c]=s;l!==null&&l<i&&(i=l,o=r,n=c)}),[o,n]}async function k({node:e,visible:t,durationMS:i=mn,easeName:o=_n}){const n=Array.isArray(e)?e:e.children;for(let s=0;s<n.length;s++){const l=n[s];l.loadThumbnail(),t&&(l.visible=!0),l.tweenAnimMode=t?0:1}let r=0;return t&&(n.length<4?r=130:n.length<4?r=100:r=75),await Promise.all(n.map((s,l)=>new Promise(c=>{const h=s.uid;let a;(a=V.get(h))&&(a.stop(),V.delete(h)),a=new G({durationMS:i,delayMS:pn+(t?l*r:0),easeName:o,onUpdate:u=>{s.visibilityTweenFactor=t?u:1-u},onComplete:()=>{t||(n[l].visible=!1),V.delete(h),c(null)}}).start(),V.set(h,a)})))}async function pt({newX:e,newY:t,newZ:i,positionDelayMS:o=0,positionTweenDurationMS:n=dn,positionTweenEaseName:r=un,newLookAtX:s=e,newLookAtY:l=t,newLookAtZ:c=i-100,lookAtDelayMS:h=0,lookAtTweenDurationMS:a=hn,lookAtTweenEaseName:u=fn}){const _="camera-pos";let f;(f=V.get(_))&&(f.stop(),V.delete(_)),f=new G({durationMS:n,delayMS:o,easeName:r,onUpdate:M=>{Y[0]+=(e-Y[0])*M,Y[1]+=(t-Y[1])*M,Y[2]+=(i-Y[2])*M},onComplete:()=>{V.delete(_)}}),V.set(_,f);const E="camera-look-at";let p;return(p=V.get(E))&&(p.stop(),V.delete(E)),p=new G({durationMS:a,delayMS:h,easeName:u,onUpdate:M=>{ee[0]+=(s-ee[0])*M,ee[1]+=(l-ee[1])*M,ee[2]+=(c-ee[2])*M}}),V.set(E,p),Promise.all([f.start(),p.start()])}function mi(e,t,i){const o=Wn(t,i);e.setPosition(o).updateWorldMatrix(),i++;const n=e.children;for(let r=0;r<n.length;r++){const s=e.children[r];mi(s,r,i)}return o}function ro(){I.aspect=innerWidth/innerHeight,I.updateProjectionMatrix(),pi()}function pi(){B.width=innerWidth*devicePixelRatio,B.height=innerHeight*devicePixelRatio,B.style.setProperty("width",`${innerWidth}px`),B.style.setProperty("height",`${innerHeight}px`)}
