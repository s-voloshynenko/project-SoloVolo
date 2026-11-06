import{g as p,n as d}from"./assets/common-BDuaxnxb.js";import"./assets/vendor-rxgDquHB.js";function l(e,{page:t,totalPages:a}){if(e){if(a<=1){e.innerHTML="";return}e.innerHTML=Array.from({length:a},(o,u)=>{const n=u+1,c=n===t;return`<li>
      <button class="pagination-btn${c?" is-current":""}" type="button"
        data-page="${n}" aria-label="Page ${n}"${c?' aria-current="page"':""}>
        ${n}
      </button>
    </li>`}).join("")}}const g=window.matchMedia("(min-width: 768px)"),i={filter:"Muscles",page:1};let r={};function f(){return g.matches?12:9}function m({name:e,filter:t,imgURL:a}){return`<li>
    <button class="category-card" type="button" data-category="${e}" data-filter="${t}">
      <img class="category-img" src="${a}" alt="" loading="lazy" width="290" height="242" />
      <span class="category-name">${e}</span>
      <span class="category-filter">${t}</span>
    </button>
  </li>`}async function s(){var e,t;try{const{results:a,totalPages:o}=await p({filter:i.filter,page:i.page,limit:f()});r.list.innerHTML=a.map(m).join(""),r.empty.hidden=a.length>0,l(r.pagination,{page:i.page,totalPages:Number(o)})}catch(a){r.list.innerHTML="",r.empty.hidden=!1,l(r.pagination,{page:1,totalPages:0}),d(((t=(e=a.response)==null?void 0:e.data)==null?void 0:t.message)||"Could not load categories, please try again.")}}function y(e){r.filters.querySelectorAll(".filter-btn").forEach(t=>{const a=t===e;t.classList.toggle("is-active",a),t.setAttribute("aria-pressed",String(a))})}function b(){r={filters:document.querySelector("[data-filters]"),list:document.querySelector("[data-categories]"),empty:document.querySelector("[data-categories-empty]"),pagination:document.querySelector("[data-categories-pagination]")},!(!r.filters||!r.list)&&(r.filters.addEventListener("click",e=>{const t=e.target.closest("[data-filter]");!t||t.dataset.filter===i.filter||(i.filter=t.dataset.filter,i.page=1,y(t),s())}),r.pagination.addEventListener("click",e=>{const t=e.target.closest("[data-page]");if(!t)return;const a=Number(t.dataset.page);a!==i.page&&(i.page=a,s())}),g.addEventListener("change",()=>{i.page=1,s()}),s())}b();
//# sourceMappingURL=index.js.map
