!function(e,t,r){if("function"!=typeof r&&"string"!=typeof r.name)throw new TypeError("Namespaced Class must be a class");let o;if(window?o=window:module&&module.exports&&(o=module.exports),!o.include)throw new ReferenceError("Classes must be included using include.js");t.forEach(e=>o.include(e));let n="My.Namespace".split(".").reduce((e,t)=>("object"!=typeof e[t]&&(e[t]={}),e[t]),o);"function"==typeof r._EXTENSION&&(Object.getOwnPropertyNames(r).forEach(e=>{if(!r.hasOwnProperty(e))return;let t=r[e];t.markAsExtension=(r=>{r.prototype[e]=function(...e){return t(this,...e)}})}),r._EXTENSION(),Object.getOwnPropertyNames(r).forEach(e=>{r.hasOwnProperty(e)&&delete r[e].markAsExtension})),n[r.name]=r}(0,["Another.Namespace.Class","Or.Library"],class{constructor(){return"foo"}});