/*
  script.js
  Sahil Saifi Portfolio Interactive JS
  Author: Sahil Saifi | Created by AI (2025)
  Purpose: UI interactivity, smooth nav, typing, modals, gallery, contact, accessibility
  - See top comments for features.
  TODO:
    - Insert your Formspree endpoint (search "Formspree endpoint") to enable contact form.
    - Update asset paths in HTML/CSS as needed.
*/

document.addEventListener("DOMContentLoaded", () => {
  // ===== HAMBURGER NAV TOGGLE =====
  const hamburger = document.getElementById("hamburger");
  const navLinks = document.getElementById("navLinks");
  hamburger.addEventListener("click", () => {
    const expanded = hamburger.getAttribute("aria-expanded") === "true" || false;
    hamburger.setAttribute("aria-expanded", !expanded);
    hamburger.classList.toggle("open");
    navLinks.classList.toggle("open");
    if (navLinks.classList.contains("open")) navLinks.querySelector("a").focus();
  });
  // Trap focus inside mobile nav
  document.addEventListener("keydown", (e) => {
    if (navLinks.classList.contains("open") && e.key === "Tab") {
      const focusable = navLinks.querySelectorAll("a");
      if (focusable.length === 0) return;
      const first = focusable[0], last = focusable[focusable.length-1];
      if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      else if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    }
    if (navLinks.classList.contains("open") && e.key === "Escape") {
      hamburger.click();
      hamburger.focus();
    }
  });

  // ===== TYPING EFFECT =====
  // Accessible typing effect with aria-live in hero
  const typedElem = document.getElementById("typed");
  const descriptors = ["Video Editor", "Graphic Designer", "Visual Storyteller", "Motion Graphics Artist"];
  let typeIndex = 0, charIndex = 0, typing = true;
  function typeWords() {
    if (!typedElem) return;
    let word = descriptors[typeIndex % descriptors.length];
    if (charIndex <= word.length) {
      typedElem.textContent = word.slice(0, charIndex);
      charIndex++;
      setTimeout(typeWords, 70);
    } else {
      setTimeout(() => {
        charIndex = 0;
        typeIndex++;
        typeWords();
      }, 1200);
    }
  }
  typeWords();

  // ===== SMOOTH SCROLL FOR ANCHORS =====
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", function(e){
      const target = document.querySelector(this.getAttribute("href"));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({behavior: 'smooth', block: 'start'});
      }
    });
  });

  // ===== HERO PLAY/PAUSE BUTTON =====
  const heroVideo = document.getElementById("heroVideo");
  const playBtn = document.getElementById("heroPlayPause");
  let playing = true;
  playBtn && playBtn.addEventListener("click", () => {
    if (!heroVideo) return;
    playing = !playing;
    if (playing) {
      heroVideo.play();
      playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else {
      heroVideo.pause();
      playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    }
    playBtn.focus();
  });
  // Hide video on mobile (redundant in CSS, but extra fallback)
  function toggleHeroMedia(){
    if(window.innerWidth<900){
      if(heroVideo) heroVideo.style.display="none";
      playBtn && (playBtn.style.display="none");
    }else{
      if(heroVideo) heroVideo.style.display="block";
      playBtn && (playBtn.style.display="flex");
    }
  }
  window.addEventListener("resize", toggleHeroMedia);
  toggleHeroMedia();

  // ===== INTERSECTION OBSERVER ANIMATIONS =====
  const fadeElems = document.querySelectorAll(".fade-in");
  const obsOptions = { threshold: .32 };
  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if(entry.isIntersecting){
        entry.target.classList.add("in-view");
      }
    });
  }, obsOptions);
  fadeElems.forEach(elem => obs.observe(elem));

  // ===== PORTFOLIO MODAL VIDEO PLAYER =====
  let modal, modalContent;
  function createModal(){
    if(document.getElementById("videoModal")) return;
    modal = document.createElement("div");
    modal.id = "videoModal"; modal.className = "lightbox-modal";
    modal.tabIndex = -1;
    modalContent = document.createElement("div");
    modalContent.className = "lightbox-content";
    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox-close";
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.setAttribute("aria-label","Close modal");
    closeBtn.onclick = closeModal;
    modalContent.appendChild(closeBtn);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    setTimeout(()=>modal.focus(),90);
    // Trap focus
    modal.addEventListener("keydown", (e) => {
      if(e.key === "Escape"){closeModal();}
    });
    // Overlay click closes
    modal.addEventListener("mousedown", (e) => {
      if (e.target === modal) closeModal();
    });
  }
  function closeModal(){
    if(modal){
      // Stop video/iframe
      modalContent && (modalContent.innerHTML = '');
      modal.remove();
      document.body.style.overflow = "";
      modal = null;
      modalContent = null;
    }
  }
  function openModalWithVideo(videoSource){
    createModal();
    document.body.style.overflow = "hidden";
    // Detect YouTube vs local .mp4
    if(/youtube\.com|youtu\.be/.test(videoSource)){
      let ytIdMatch = videoSource.match(/(?:v=|\/embed\/|\.be\/)([\w\-]+)/);
      let videoId = ytIdMatch ? ytIdMatch[1] : "";
      let embedURL = videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : videoSource;
      let iframe = document.createElement("iframe");
      iframe.src = embedURL;
      iframe.width = "560"; iframe.height = "315";
      iframe.allow = "autoplay; encrypted-media";
      iframe.setAttribute("loading","lazy");
      iframe.setAttribute("frameborder","0");
      modalContent.appendChild(iframe);
    }else if(/\.mp4($|\?)/.test(videoSource)){
      let video = document.createElement("video");
      video.src = videoSource;
      video.controls = true;
      video.autoplay = true;
      video.playsInline = true;
      video.style.maxWidth = "100%";
      video.onended = () => closeModal();
      modalContent.appendChild(video);
    }else{
      modalContent.innerHTML += "<p>Unable to play media.</p>";
    }
    // Add close btn again
    const closeBtn = document.createElement("button");
    closeBtn.className = "lightbox-close";
    closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    closeBtn.setAttribute("aria-label","Close modal");
    closeBtn.onclick = closeModal;
    modalContent.appendChild(closeBtn);
  }
  // Portfolio card click modal
  document.querySelectorAll(".portfolio-card").forEach(card => {
    card.addEventListener("click",function(e){
      let videoSrc = card.getAttribute("data-video");
      if (videoSrc) openModalWithVideo(videoSrc);
    });
    card.addEventListener("keydown",function(e){
      if(e.key==="Enter"||e.key===" "){card.click();}
    });
    card.setAttribute("tabindex","0");
    card.setAttribute("role","button");
    card.setAttribute("aria-label","Open video preview");
  });

  // ===== GALLERY FILTER & LIGHTBOX =====
  // Filter
  document.querySelectorAll(".filter-btn").forEach(btn => {
    btn.addEventListener("click",function(){
      document.querySelectorAll(".filter-btn").forEach(b=>b.classList.remove("active"));
      btn.classList.add("active");
      let filter = btn.getAttribute("data-filter");
      document.querySelectorAll(".gallery-item").forEach(item=>{
        if(filter==="all" || item.getAttribute("data-category")===filter){item.style.display="block";}
        else{item.style.display="none";}
      });
    });
  });
  // Lightbox for gallery images
  document.querySelectorAll(".gallery-item img").forEach(img => {
    img.addEventListener("click", function(){
      createModal();
      let imgEl = document.createElement("img");
      imgEl.src = img.src;
      imgEl.alt = img.alt;
      imgEl.className = "lightbox-image";
      modalContent.appendChild(imgEl);
      let caption = document.createElement("div");
      caption.className = "lightbox-caption";
      caption.textContent = img.parentElement.querySelector(".gallery-caption").textContent;
      modalContent.appendChild(caption);
      // Close btn
      const closeBtn = document.createElement("button");
      closeBtn.className = "lightbox-close";
      closeBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      closeBtn.setAttribute("aria-label","Close modal");
      closeBtn.onclick = closeModal;
      modalContent.appendChild(closeBtn);
    });
    img.setAttribute("tabindex","0");
    img.setAttribute("role","button");
    img.setAttribute("aria-label","Open image preview");
    img.addEventListener("keydown",function(e){
      if(e.key==="Enter"||e.key===" "){img.click();}
    });
  });

  // ===== CONTACT FORM SUBMIT =====
  const contactForm = document.getElementById("contactForm");
const formStatus = document.getElementById("formStatus");

contactForm && contactForm.addEventListener("submit", function(e) {
  e.preventDefault();
  // Validate honeypot
  if (contactForm._gotcha.value) { return; }

  // Basic validation
  let name = contactForm.name.value;
  let email = contactForm.email.value;
  let message = contactForm.message.value;

  if (!name || !email || !message) {
    formStatus.textContent = "Please fill out all required fields.";
    return;
  }
  let validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!validEmail) {
    formStatus.textContent = "Please enter a valid email address.";
    return;
  }

 // Replace mailto section with:
fetch("https://formspree.io/f/xqagrydl", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    name: name,
    email: email,
    message: message,
  }),
})
.then(res => {
  formStatus.textContent = "Thanks! Your message has been sent. I’ll get back to you soon";
  formStatus.style.color = "#055801"; // 🟢 green
  contactForm.reset();
})
.catch(() => {
  formStatus.textContent = "Something went wrong. Try again later.";
   formStatus.style.color = "#ff265a"; // 🔴 red
});

});


  // ===== PREFER REDUCED MOTION =====
  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    document.body.classList.add("reduced-motion");
  }
});
