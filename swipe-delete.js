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
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',setup); else setup();
  const observer=new MutationObserver(setup);
  observer.observe(document.documentElement,{childList:true,subtree:true});
})();
