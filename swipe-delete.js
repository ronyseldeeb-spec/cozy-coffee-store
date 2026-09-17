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

  /* ===== NAV ICON POLISH ===== */
  const iconSVG={
    menu:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg>`,
    browse:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5 12 4l8 6.5"/><path d="M6.5 9.5V20h11V9.5"/><path d="M9.5 20v-5.5h5V20"/></svg>`,
    orders:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 7h12l1 13H5L6 7Z"/><path d="M9 7a3 3 0 0 1 6 0"/><path d="M9 11h.01M15 11h.01"/></svg>`,
    account:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3.2"/><path d="M5.5 20c.7-3.3 3-5 6.5-5s5.8 1.7 6.5 5"/></svg>`,
    coffee:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h11v6.2A4.8 4.8 0 0 1 11.2 20H9.8A4.8 4.8 0 0 1 5 15.2V9Z"/><path d="M16 11h1.2a2.8 2.8 0 0 1 0 5.6H16"/><path d="M8 5c-1-1 1-2 0-3M12 5c-1-1 1-2 0-3M16 5c-1-1 1-2 0-3"/></svg>`,
    delivery:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6h11v11H3z"/><path d="M14 10h4l3 3v4h-7z"/><circle cx="7" cy="19" r="2"/><circle cx="18" cy="19" r="2"/></svg>`,
    reviews:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 4 1.9 4 4.4.6-3.2 3.1.8 4.4-3.9-2.1-3.9 2.1.8-4.4-3.2-3.1 4.4-.6L12 4Z"/></svg>`,
    profile:`<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8" r="3"/><path d="M5 20c.8-3.2 3.2-5 7-5s6.2 1.8 7 5"/><path d="M19 5v4M17 7h4"/></svg>`,
    sparkle:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"/><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7L19 15Z"/></svg>`,
    types:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 6h14M5 12h14M5 18h14"/><circle cx="8" cy="6" r="1"/><circle cx="16" cy="12" r="1"/><circle cx="10" cy="18" r="1"/></svg>`,
    arrow:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h13M13 6l6 6-6 6"/></svg>`,
    basket:`<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 9h14l-1 11H6L5 9Z"/><path d="M9 9a3 3 0 0 1 6 0"/></svg>`
  };

  function polishIcons(){
    if(document.getElementById('cozy-icon-polish')) return;
    const style=document.createElement('style');
    style.id='cozy-icon-polish';
    style.textContent=`
      .menu-trigger,.top-nav,.top-cart,.side-menu-list button,.mobile-nav-item{position:relative;}
      .menu-trigger svg,.top-nav svg,.top-cart svg,.side-menu-icon svg,.mobile-nav-item svg{width:19px;height:19px;display:block;fill:none;stroke:currentColor;stroke-width:1.8;stroke-linecap:round;stroke-linejoin:round;}
      .menu-trigger{display:grid!important;place-items:center;transition:transform .22s ease,box-shadow .22s ease,background .22s ease!important;}
      .menu-trigger:hover{transform:translateY(-1px);box-shadow:0 9px 20px rgba(74,43,27,.12)!important;background:#EDE0D5!important;}
      .top-nav{transition:transform .2s ease,background .2s ease,color .2s ease,box-shadow .2s ease!important;}
      .top-nav:hover{transform:translateY(-1px);}
      .top-nav svg{width:17px;height:17px;}
      .top-nav.active svg{stroke-width:2;}
      .top-cart>span{display:grid!important;place-items:center;}
      .top-cart>span svg{width:20px;height:20px;}
      .side-menu-list button{transition:transform .2s ease,box-shadow .2s ease,border-color .2s ease,background .2s ease!important;}
      .side-menu-list button:hover{transform:translateX(3px);box-shadow:0 9px 22px rgba(74,43,27,.08);border-color:#D9BEA9;background:#FFFEFB;}
      .side-menu-list button:active{transform:scale(.985);}
      .side-menu-list .side-menu-icon{transition:transform .2s ease,background .2s ease,color .2s ease;}
      .side-menu-list button:hover .side-menu-icon{transform:scale(1.07) rotate(-2deg);background:#EAD7C8;color:#754631;}
      .side-menu-list b{display:grid;place-items:center;}
      .side-menu-list b svg{width:17px;height:17px;}
      .mobile-nav-item svg{width:18px;height:18px;}
      @media(max-width:800px){
        .menu-trigger svg{width:18px;height:18px;}
        .top-nav svg{width:16px;height:16px;}
        .side-menu-list .side-menu-icon{width:38px;height:38px;}
      }
    `;
    document.head.appendChild(style);

    const menu=document.querySelector('.menu-trigger');
    if(menu) menu.innerHTML=iconSVG.menu;

    const topNavs=document.querySelectorAll('.top-nav');
    topNavs.forEach(btn=>{
      const text=btn.textContent.trim().toLowerCase();
      const key=text.includes('browse')?'browse':text.includes('order')?'orders':'account';
      const old=btn.querySelector('span');
      if(old) old.innerHTML=iconSVG[key];
    });

    const cart=document.querySelector('.top-cart>span');
    if(cart) cart.innerHTML=iconSVG.basket;

    const sideButtons=document.querySelectorAll('.side-menu-list button');
    const keys=['coffee','delivery','reviews','profile','sparkle','types'];
    sideButtons.forEach((btn,i)=>{
      const icon=btn.querySelector('.side-menu-icon');
      if(icon) icon.innerHTML=iconSVG[keys[i]||'sparkle'];
      const arrow=btn.querySelector(':scope > b');
      if(arrow) arrow.innerHTML=iconSVG.arrow;
    });

    document.querySelectorAll('.mobile-nav-item').forEach(btn=>{
      const small=btn.querySelector('small');
      const label=small?.textContent.trim().toLowerCase()||'';
      const key=label.includes('home')?'browse':label.includes('search')?'types':label.includes('order')?'orders':label.includes('account')?'account':'basket';
      const span=btn.querySelector('span');
      if(span && iconSVG[key]) span.innerHTML=iconSVG[key];
    });
  }

  function init(){ setup(); polishIcons(); }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',init); else init();
  const observer=new MutationObserver(function(){ setup(); polishIcons(); });
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
