/*! (C) WebReflection Mit Style License */
var _=this._=function(e,t,n){function j(e,t,n,r){P(n||K.defaults||{},L),P(r,L);if(w.call(r,u)||w.call(r,c))delete L[v],delete L[d];b(e,t,L),k(L)}function F(e,t,n,r){j(e,t,r,n instanceof U?n:n instanceof $?R(e,t,n):(M[d]=n,M)),delete M[d]}function I(e,t,n){for(var r in t)w.call(t,r)&&F(e,r,t[r],n)}function q(e,t){for(var n=0,r;n<t.length;n++)r=t[n],T(e,V(r)?r[l]:r)}function R(e,t,n){var i=n._,o=w.call(n,r)?!!n[r]:!0,a=w.call(n,s)&&n[s],f=w.call(n,v)&&n[v],l;return n[u]=function(){return _&&(n=E(e,t),delete e[t]),L[d]=i.call(l=this),L[r]=o,L[s]=a,L[v]=f,b(l,t,L),k(L),_&&(P(n,L),b(e,t,L),k(L)),l[t]},_&&(n[r]=!0),n}function U(e){P(e,this)}function z(e){return new U(e)}function W(e){return N(V(e)?e[l]:e)}function X(e,t,n){var r=W(e);return t?K(r,t,n):r}function V(e){return typeof e=="function"}function $(e){this._=V(e)?e:P(e,this)||e[d]}function J(e){return new $(e)}function K(e,t,n,r){return(typeof t=="string"?F(e,t,n,r):I(e,t,n))||e}function Q(e){return function(n,r,i){return(typeof r=="string"?F(n,r,i,e):I(n,r,e))||n}}function G(e,t){var n=w.call(e,i)?e[i]:function(){},r=w.call(e,h)&&e[h],s=w.call(e,o)&&e[o],u;t||(t={},t[v]=!0),delete e[i];if(s){delete e[o],K(n[l]=W(s),"constructor",n);if(V(s))for(u in s)w.call(s,u)&&u!=="name"&&u!=="length"&&j(n,u,L,E(s,u))}return r&&(delete e[h],I(n,r,O)),w.call(e,a)&&(q(n[l],[].concat(e[a])),delete e[a]),I(n[l],e,t),Y(n[l]),n}function Y(e){return w.call(e,p)?object:b(e,p,A)}var r="configurable",i="constructor",s="enumerable",o="extend",u="get",a="mixin",f="__proto__",l="prototype",c="set",h="statics",p="super",d="value",v="writable",m=t,g=n.bind||function(t){var n=this;return function(){return n.apply(t,arguments)}},y=function(t,r){return e[t]||n[t]||r},b=y("defineProperty"),w=y("hasOwnProperty"),E=y("getOwnPropertyDescriptor"),S=y("getOwnPropertyNames",n.keys),x=y("getPrototypeOf",function(t){return t[f]}),T=n.mixin||function(t,n){for(var r=S(n),i=r.length;i--;j(t,r[i],L,E(n,r[i])));return t},N=e.create||e.inherit||n.create,C=[r,s,u,c,d,v],k=m("o","delete o."+C.join(";delete o.")),L=N(null),A=N(null),O={},M={},_=!1,D,P,H,B;O[v]=!0,O[s]=!0;for(D=0;D<C.length;D++)C[D]=["if(h.call(a,'","'))b.","=a.",";"].join(C[D]);P=m("h","return function(a,b){"+C.join("")+"}")(w),A[u]=function et(){var e=et.caller,t=this,n,r,i,s;while(t=x(t)){i=S(t).concat("constructor"),n=i.length;while(n--)if(t[r=i[n]]===e){do s=x(t),t=s;while(s[r]===e);return g.call(s[r],this)}}},K.Class=G,K.as=z,K.from=X,K.later=J,K.mixin=T,K.using=Q,K[p]=Y,K.defaults={},"undefined"!=typeof module&&module.exports&&((module.exports=K).redefine=K),e.mixin?e.mixin({redefine:K}):e.redefine=K;try{B=N(K({},{_:J(n)}))._}catch(Z){k(L),_=!0}return e}(_||this,Function,Object);