(function(){
  'use strict';
  function setup(){
    const container=document.getElementById('active-order-container');
    if(!container || container.dataset.swipeReady==='1') return;
    container.dataset.swipeReady='1';
    let startX=0,startY=0,card=null,tracking=false,moved=false;
    container.addEventListener('touchstart',function(e){
      const t=e.touches[0];
      card=e.target.closest('.multi-order-card');
      if(!card) return;
      const pill=card.querySelector('.order-status-pill');
      if(!pill || !/cancelled/i.test(pill.textContent)) { card=null; return; }
      startX=t.clientX; startY=t.clientY; tracking=true; moved=false;
      card.style.transition='none';
    },{passive:true});
    container.addEventListener('touchmove',function(e){
      if(!tracking || !card) return;
      const t=e.touches[0],dx=t.clientX-startX,dy=t.clientY-startY;
      if(Math.abs(dx)<8) return;
      if(Math.abs(dy)>Math.abs(dx)*1.15){ tracking=false; card=null; return; }
      if(dx>0){
        moved=true;
        e.preventDefault();
        card.style.transform='translateX('+Math.min(dx,window.innerWidth)+'px)';
        card.style.opacity=String(Math.max(.15,1-dx/260));
      }
    },{passive:false});
    container.addEventListener('touchend',function(e){
      if(!tracking || !card) return;
      const t=e.changedTouches[0],dx=t.clientX-startX,dy=t.clientY-startY;
      const target=card;
      tracking=false; card=null;
      if(moved && dx>90 && Math.abs(dx)>Math.abs(dy)*1.1){
        const cards=[...container.querySelectorAll('.multi-order-card')];
        const index=cards.indexOf(target);
        try{
          const orders=JSON.parse(localStorage.getItem('cozy_orders')||'[]').sort((a,b)=>b.order_time-a.order_time);
          const order=orders[index];
          if(order && order.status==='cancelled'){
            localStorage.setItem('cozy_orders',JSON.stringify(orders.filter(o=>o.id!==order.id)));
            target.style.transition='transform .28s ease,opacity .28s ease';
            target.style.transform='translateX(110%)';
            target.style.opacity='0';
            setTimeout(function(){
              if(typeof renderTrackerModalContent==='function') renderTrackerModalContent();
            },280);
          }
        }catch(err){ console.error('Swipe delete error',err); }
      }else{
        target.style.transition='transform .2s ease,opacity .2s ease';
        target.style.transform='translateX(0)';
        target.style.opacity='1';
      }
    },{passive:true});
  }

  /* ===== PREMIUM NAV ICON POLISH ===== */
  const iconSVG={
    menu:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7.5h16M4 12h16M4 16.5h16"/></svg>`,
    browse:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.8 10.5 12 3.8l8.2 6.7"/><path d="M6.2 9.2V20h11.6V9.2"/><path d="M9.2 20v-5.7h5.6V20"/><path d="M9.3 8.8h.01"/></svg>`,
    orders:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 7.2h13l.9 12.8H4.6L5.5 7.2Z"/><path d="M8.8 7.2a3.2 3.2 0 0 1 6.4 0"/><path d="M8.5 11.2h.01M15.5 11.2h.01"/><path d="M8.2 15.2h7.6"/></svg>`,
    account:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.8" r="3.1"/><path d="M5.2 20c.8-3.4 3.1-5.3 6.8-5.3s6 1.9 6.8 5.3"/><path d="M18.5 5.2v3.2M16.9 6.8h3.2"/></svg>`,
    coffee:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 8.7h11.2v6.1A5.2 5.2 0 0 1 11 20H10a5 5 0 0 1-5-5V8.7Z"/><path d="M16.2 11h1.1a2.9 2.9 0 0 1 0 5.8h-1.5"/><path d="M8 5.2c-1.1-1.3 1-2 0-3.2M12 5.2c-1.1-1.3 1-2 0-3.2M16 5.2c-1.1-1.3 1-2 0-3.2"/></svg>`,
    delivery:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3.2 6.5h10.9v10.7H3.2z"/><path d="M14.1 10.3h4l3 3.1v3.8h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/><path d="M17 10.3v3.1h4"/></svg>`,
    reviews:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3.8 2.1 4.3 4.7.7-3.4 3.3.8 4.7-4.2-2.2-4.2 2.2.8-4.7-3.4-3.3 4.7-.7L12 3.8Z"/><path d="M12 7.7v4.1M12 14.8h.01"/></svg>`,
    profile:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7.8" r="3"/><path d="M5 20c.8-3.3 3.2-5.2 7-5.2s6.2 1.9 7 5.2"/><path d="M19 4.8v4M17 6.8h4"/></svg>`,
    sparkle:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 2.8 1.6 5.8 5.8 1.6-5.8 1.6-1.6 5.8-1.6-5.8-5.8-1.6 5.8-1.6L12 2.8Z"/><path d="m19.2 15 .7 2.1 2.1.7-2.1.7-.7 2.1-.7-2.1-2.1-.7 2.1-.7.7-2.1Z"/></svg>`,
    types:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6.2h14M5 12h14M5 17.8h14"/><circle cx="8.2" cy="6.2" r="1.2"/><circle cx="15.8" cy="12" r="1.2"/><circle cx="10.2" cy="17.8" r="1.2"/></svg>`,
    arrow:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h14M13 6.5l5.5 5.5-5.5 5.5"/></svg>`,
    basket:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4.8 9h14.4l-1.1 11H5.9L4.8 9Z"/><path d="M8.5 9a3.5 3.5 0 0 1 7 0"/><path d="M8.5 13h.01M12 13h.01M15.5 13h.01"/></svg>`
  };

  function polishIcons(){
    if(!document.getElementById('cozy-icon-polish')){
      const style=document.createElement('style');
      style.id='cozy-icon-polish';
      style.textContent=`
        .menu-trigger,.top-nav,.top-cart,.side-menu-list button,.mobile-nav-item{position:relative;}
        .logo{transform:translateX(-18px);}
        .menu-trigger svg,.top-nav svg,.top-cart svg,.side-menu-icon svg,.mobile-nav-item svg{width:19px;height:19px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;transition:transform .25s ease,filter .25s ease;}
        .menu-trigger{display:grid!important;place-items:center;transition:transform .25s ease,box-shadow .25s ease,background .25s ease!important;}
        .menu-trigger:hover{transform:translateY(-2px) rotate(-2deg);box-shadow:0 12px 26px rgba(74,43,27,.16)!important;background:#EAD8C9!important;}
        .menu-trigger:hover svg{transform:scale(1.08);}
        .top-nav{transition:transform .22s ease,background .22s ease,color .22s ease,box-shadow .22s ease!important;}
        .top-nav:hover{transform:translateY(-2px);box-shadow:0 8px 20px rgba(74,43,27,.10);}
        .top-nav svg{width:18px;height:18px;filter:drop-shadow(0 1px 1px rgba(74,43,27,.12));}
        .top-nav:hover svg{transform:scale(1.09);}
        .top-nav.active svg{stroke-width:2.15;}
        .top-cart>span{display:grid!important;place-items:center;}
        .top-cart>span svg{width:21px;height:21px;}
        .top-cart:hover svg{transform:scale(1.1) rotate(-4deg);}
        .side-menu-list button{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease,background .22s ease!important;}
        .side-menu-list button:hover{transform:translateX(4px);box-shadow:0 10px 24px rgba(74,43,27,.10);border-color:#D6B8A0;background:#FFFEFB;}
        .side-menu-list button:active{transform:scale(.985);}
        .side-menu-list .side-menu-icon{transition:transform .25s ease,background .25s ease,color .25s ease,box-shadow .25s ease;}
        .side-menu-list button:hover .side-menu-icon{transform:scale(1.08) rotate(-3deg);background:#E8D1C0;color:#754631;box-shadow:0 5px 13px rgba(74,43,27,.10);}
        .side-menu-list b{display:grid;place-items:center;transition:transform .2s ease;color:#8B6048;}
        .side-menu-list b svg{width:17px;height:17px;}
        .side-menu-list button:hover>b{transform:translateX(3px);}
        .mobile-nav-item svg{width:18px;height:18px;}
        .mobile-nav-item:hover svg{transform:translateY(-2px) scale(1.08);}
        @media(max-width:800px){
          .menu-trigger svg{width:18px;height:18px;}
          .top-nav svg{width:17px;height:17px;}
          .side-menu-list .side-menu-icon{width:40px;height:40px;}
        }
      `;
      document.head.appendChild(style);
    }

    const menu=document.querySelector('.menu-trigger');
    if(menu && !menu.querySelector('svg')) menu.innerHTML=iconSVG.menu;

    const topNavs=document.querySelectorAll('.top-nav');
    topNavs.forEach(btn=>{
      const text=btn.textContent.trim().toLowerCase();
      const key=text.includes('browse')?'browse':text.includes('order')?'orders':'account';
      const old=btn.querySelector('span');
      if(old && !old.querySelector('svg')) old.innerHTML=iconSVG[key];
    });

    const cart=document.querySelector('.top-cart>span');
    if(cart && !cart.querySelector('svg')) cart.innerHTML=iconSVG.basket;

    const sideButtons=document.querySelectorAll('.side-menu-list button');
    const keys=['coffee','delivery','reviews','profile','sparkle','types'];
    sideButtons.forEach((btn,i)=>{
      const icon=btn.querySelector('.side-menu-icon');
      if(icon && !icon.querySelector('svg')) icon.innerHTML=iconSVG[keys[i]||'sparkle'];
      const arrow=btn.querySelector(':scope > b');
      if(arrow && !arrow.querySelector('svg')) arrow.innerHTML=iconSVG.arrow;
    });

    document.querySelectorAll('.mobile-nav-item').forEach(btn=>{
      const small=btn.querySelector('small');
      const label=small?.textContent.trim().toLowerCase()||'';
      const key=label.includes('home')?'browse':label.includes('search')?'types':label.includes('order')?'orders':label.includes('account')?'account':'basket';
      const span=btn.querySelector('span');
      if(span && iconSVG[key] && !span.querySelector('svg')) span.innerHTML=iconSVG[key];
    });
  }

  function init(){ setup(); polishIcons(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  const observer=new MutationObserver(function(){ setup(); polishIcons(); });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
