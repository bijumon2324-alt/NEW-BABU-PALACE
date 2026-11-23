(function(){
  'use strict';
  var $=function(s,r){return (r||document).querySelector(s)};
  var $$=function(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s))};
  var PHONE='917510392411';
  var today=new Date().toISOString().split('T')[0];

  // Header, menu, back-to-top
  var header=$('header'),nav=$('#nav'),menuBtn=$('.menu-btn'),toTop=$('#backToTop');
  function onScroll(){header.classList.toggle('scrolled',scrollY>40);toTop.classList.toggle('show',scrollY>600)}
  addEventListener('scroll',onScroll,{passive:true});onScroll();
  menuBtn.addEventListener('click',function(){var o=nav.classList.toggle('open');menuBtn.setAttribute('aria-expanded',o)});
  nav.addEventListener('click',function(e){if(e.target.tagName==='A'){nav.classList.remove('open');menuBtn.setAttribute('aria-expanded','false')}});
  toTop.addEventListener('click',function(){scrollTo({top:0,behavior:'smooth'})});

  // Date rules: no past dates, check-out after check-in
  function wireDates(form){
    var ci=form.elements.checkin,co=form.elements.checkout;
    ci.min=co.min=today;
    ci.addEventListener('change',function(){
      var next=new Date(ci.value);next.setDate(next.getDate()+1);
      co.min=next.toISOString().split('T')[0];
      if(co.value&&co.value<=ci.value)co.value='';
    });
  }

  // Modal helpers
  var lastFocus;
  function openModal(m){lastFocus=document.activeElement;m.classList.add('open');m.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';var f=$('input:not([readonly]),button',m);f&&f.focus()}
  function closeModal(m){m.classList.remove('open');m.setAttribute('aria-hidden','true');document.body.style.overflow='';lastFocus&&lastFocus.focus()}
  $$('.site-modal').forEach(function(m){
    m.addEventListener('click',function(e){if(e.target===m||e.target.classList.contains('modal-close'))closeModal(m)});
  });
  addEventListener('keydown',function(e){
    var open=$('.site-modal.open');if(!open)return;
    if(e.key==='Escape')closeModal(open);
    if(open.id==='imageLightbox'){if(e.key==='ArrowRight')step(1);if(e.key==='ArrowLeft')step(-1)}
  });

  // Booking
  var modal=$('#bookingModal'),form=$('#bookingForm'),err=$('#formError');
  wireDates(form);
  window.bookRoom=function(room,pre){
    form.elements.room.value=room;err.textContent='';
    if(pre){['checkin','checkout','guests'].forEach(function(k){form.elements[k].value=pre[k]})}
    openModal(modal);
  };
  form.addEventListener('submit',function(e){
    e.preventDefault();
    var d=new FormData(form),v=function(k){return String(d.get(k)||'').trim()};
    if(v('checkout')<=v('checkin')){err.textContent='Check-out must be after check-in.';return}
    var msg='Hello BABUS PALACE, I would like to book:\n'+
      'Room: '+v('room')+'\nCheck-in: '+v('checkin')+'\nCheck-out: '+v('checkout')+
      '\nGuests: '+v('guests')+'\nName: '+v('name')+'\nPhone: '+v('phone')+'\nEmail: '+v('email');
    window.open('https://wa.me/'+PHONE+'?text='+encodeURIComponent(msg),'_blank','noopener');
    closeModal(modal);form.reset();
  });

  // Hero quick booking
  var quick=$('#quickForm');
  wireDates(quick);
  quick.addEventListener('submit',function(e){
    e.preventDefault();
    var q=quick.elements;
    if(q.checkout.value<=q.checkin.value){q.checkout.setCustomValidity('Check-out must be after check-in');q.checkout.reportValidity();q.checkout.setCustomValidity('');return}
    bookRoom(q.room.value,{checkin:q.checkin.value,checkout:q.checkout.value,guests:q.guests.value});
  });

  // Lightbox with previous/next
  var lb=$('#imageLightbox'),lbImg=$('#lightboxImage'),lbTitle=$('#lightboxTitle');
  var shots=$$('.gallery-card'),idx=0;
  function show(i){idx=(i+shots.length)%shots.length;var im=$('img',shots[idx]);lbImg.src=im.src;lbImg.alt=im.alt;lbTitle.textContent=im.alt}
  function step(n){show(idx+n)}
  shots.forEach(function(c,i){c.addEventListener('click',function(){show(i);openModal(lb)})});
  $('.prev',lb).addEventListener('click',function(){step(-1)});
  $('.next',lb).addEventListener('click',function(){step(1)});
})();
