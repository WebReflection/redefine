/*! (C) WebReflection Mit Style License */
var _=this._=function(e,t,n){function q(e,t,n,r){j(n||Y.defaults||{},_),j(r,_);if(S.call(r,a)||S.call(r,p))delete _[g],delete _[m];E(e,t,_),A(_)}function R(e,t,n,r){q(e,t,r,n instanceof X?n:n instanceof Q?W(e,t,n):(P[m]=n,P)),delete P[m]}function U(e,t,n){for(var r in t)S.call(t,r)&&R(e,r,t[r],n)}function z(e,t){for(var n=0,r,i;n<t.length;n++)r=t[n],K(r)&&(r=(r.type||r.name)==="mixin"?r.call(r)||r:r[h]),C(e,r)}function W(e,t,n){var r=n._,s=S.call(n,i)?!!n[i]:!0,u=S.call(n,o)&&n[o],f=S.call(n,g)&&n[g],l;return n[a]=function(){return H&&(n=x(e,t),delete e[t]),_[m]=r.call(l=this),_[i]=s,_[o]=u,_[g]=f,E(l,t,_),A(_),H&&(j(n,_),E(e,t,_),A(_)),l[t]},H&&(n[i]=!0),n}function X(e){j(e,this)}function V(e){return new X(e)}function $(e){return k(K(e)?e[h]:e)}function J(e,t,n){var r=$(e);return t?Y(r,t,n):r}function K(e){return typeof e=="function"}function Q(e){this._=K(e)?e:j(e,this)||e[m]}function G(e){return new Q(e)}function Y(e,t,n,r){return(typeof t=="string"?R(e,t,n,r):U(e,t,n))||e}function Z(e){return function(n,r,i){return(typeof r=="string"?R(n,r,i,e):U(n,r,e))||n}}function et(e,t){var n,r,i,s;while(t=N(t)){i=T(t),n=i.length;while(n--)if(t[r=i[n]]===e){do s=N(t),t=s;while(s[r]===e);return s[r]}}}function tt(){return et(tt.caller,this).apply(this,arguments)}function nt(e){return this[l+e]||rt(this,e)}function rt(e,t){return O[m]=b.call(e[t],e),E(e,l+t,O),O[m]=nt,e[l+t]}function it(e,t){var n=S.call(e,s)?e[s]:function(){},i=S.call(e,d)&&e[d],o=S.call(e,u)&&e[u],a;t||(t={},t[g]=!0),delete e[s];if(o){delete e[u],Y(n[h]=$(o),"constructor",n);if(K(o))for(a in o)S.call(o,a)&&a!=="name"&&a!=="length"&&q(n,a,_,x(o,a))}return i&&(delete e[d],U(n,i,D)),S.call(e,f)&&(z(n[h],[].concat(e[f])),delete e[f]),U(n[h],e,t),st(n[h]),r in n[h]||E(n[h],r,O),n}function st(e){return S.call(e,v)?object:E(e,v,M)}var r="bound",i="configurable",s="constructor",o="enumerable",u="extend",a="get",f="mixin",l="__@",c="__proto__",h="prototype",p="set",d="statics",v="super",m="value",g="writable",y=t,b=t.bind||function(t){var n=this;return function(){return n.apply(t,arguments)}},w=function(t,r){return e[t]||n[t]||r},E=w("defineProperty"),S=w("hasOwnProperty"),x=w("getOwnPropertyDescriptor"),T=w("getOwnPropertyNames",n.keys),N=w("getPrototypeOf",function(t){return t[c]}),C=n.mixin||function(t,n){for(var r=T(n),i=r.length;i--;q(t,r[i],_,x(n,r[i])));return t},k=e.create||e.inherit||n.create,L=[i,o,a,p,m,g],A=y("o","delete o."+L.join(";delete o.")),O=k(null),M=k(null),_=k(null),D={},P={},H=!1,B,j,F,I;D[g]=!0,D[o]=!0;for(B=0;B<L.length;B++)L[B]=['if(h.call(a,"','"))b.',"=a.",";"].join(L[B]);j=y("h","return function(a,b){"+L.join("")+"}")(S),M[m]=function ut(e){return b.apply(et(ut.caller,e),arguments)},M[i]=M[o]=M[g]=!1,E(tt,"bind",M),M[m]=tt,O[o]=!1,O[i]=O[g]=!0,O[m]=nt,Y.Class=it,Y.as=V,Y.from=J,Y.later=G,Y.mixin=C,Y.using=Z,Y[v]=st,Y.defaults={},"undefined"!=typeof module&&module.exports&&((module.exports=Y).redefine=Y),e.mixin?e.mixin({redefine:Y}):e.redefine=Y;try{I=k(Y({},{_:G(n)}))._}catch(ot){A(_),H=!0}return e}(_||this,Function,Object);