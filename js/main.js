/* SurakshaJob demo - "Every job is a sealed case"
   Motion language: paper slides in, typewriter prints IDs, stamps land with a thud,
   lines only ever connect through the Control Room. */
(function () {
  "use strict";
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasGsap = typeof window.gsap !== "undefined" && typeof window.ScrollTrigger !== "undefined";

  /* ---------- helpers ---------- */
  function typeText(el, text, speed, done) {
    if (!el) return;
    if (reduce) { el.textContent = text; if (done) done(); return; }
    var i = 0; el.textContent = "";
    (function tick() {
      el.textContent = text.slice(0, ++i);
      if (i < text.length) setTimeout(tick, speed || 40); else if (done) done();
    })();
  }
  function stampIn(el) {
    if (!el) return;
    if (!hasGsap || reduce) { el.style.opacity = 1; return; }
    gsap.fromTo(el, { scale: 2.6, opacity: 0, rotate: -18 },
      { scale: 1, opacity: 1, rotate: -8, duration: .5, ease: "back.out(2.2)" });
  }
  function rupee(n) { return "₹" + n.toLocaleString("en-IN"); }
  function rupee2(n) { return "₹" + n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
  function pad(n) { return (n < 10 ? "0" : "") + n; }

  /* ---------- stars ---------- */
  $$(".stars").forEach(function (s) {
    var n = +s.dataset.n || 5, h = "";
    for (var i = 0; i < 5; i++) h += '<svg class="' + (i < n ? "" : "off") + '"><use href="#i-star"/></svg>';
    s.innerHTML = h;
  });

  /* ---------- nav ---------- */
  var nav = $("#nav");
  function onScroll() { nav.classList.toggle("is-solid", window.scrollY > 40); }
  window.addEventListener("scroll", onScroll, { passive: true }); onScroll();

  /* ---------- intro + hero ---------- */
  var intro = $("#intro");
  function heroIn() {
    if (!hasGsap || reduce) return;
    var tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tl.from(".hero__title .line > span", { yPercent: 110, duration: 1.1, stagger: .14 })
      .from(".hero__kicker", { opacity: 0, y: 12, duration: .6 }, "-=.8")
      .from(".hero__sub, .hero__cta", { opacity: 0, y: 24, duration: .8, stagger: .1 }, "-=.6")
      .from(".hfile", { y: -160, rotateX: 60, opacity: 0, duration: 1.1, ease: "power4.out" }, .2)
      .from(".hfile__stamp", { scale: 2.6, opacity: 0, duration: .45, ease: "back.out(2.4)" }, "-=.2")
      .from(".hero__scroll", { opacity: 0, duration: .6 }, "-=.2");
  }
  function endIntro() {
    if (!intro) return heroIn();
    if (!hasGsap || reduce) { intro.classList.add("done"); return; }
    gsap.to(intro, { yPercent: -100, duration: .9, ease: "power4.inOut", onComplete: function () { intro.classList.add("done"); } });
    setTimeout(heroIn, 250);
  }
  if (intro && !reduce) {
    typeText($("#introType"), "OPENING CASE FILE SJ-2026-04817", 32, function () { setTimeout(endIntro, 380); });
  } else { endIntro(); }

  /* folder follows the mouse a little (desktop only) */
  var hfile = $(".hfile");
  if (hfile && hasGsap && window.matchMedia("(hover:hover) and (min-width:901px)").matches && !reduce) {
    var hero = $("#hero");
    hero.addEventListener("mousemove", function (e) {
      var r = hero.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      gsap.to(hfile, { rotateY: -18 + x * 16, rotateX: 14 - y * 12, duration: .8, ease: "power2.out" });
    });
  }

  /* ---------- verify desk ---------- */
  var desk = $("#desk");
  $$(".desk__tab", desk).forEach(function (t) {
    t.addEventListener("click", function () {
      $$(".desk__tab", desk).forEach(function (x) { x.classList.toggle("is-on", x === t); });
      $$(".desk__pane", desk).forEach(function (p) { p.classList.toggle("is-on", p.dataset.pane === t.dataset.tab); });
    });
  });
  var agentInput = $("#agentInput"), agentLabel = $("#agentLabel"), agentResult = $("#agentResult");
  var scanner = $("#scanner"), agentForm = $("#agentForm");
  var AGENTS = {
    "AG-1024": { name: "Priya Sharma", roll: "AG-1024", mobile: "98290 41024", area: "Jaipur Central", valid: "31 Mar 2027", img: "assets/img/agent-priya.jpg" }
  };
  function showAgent(q) {
    var key = (q || "").trim().toUpperCase().replace(/\s+/g, "");
    var a = AGENTS[key] || (key.replace(/\D/g, "").slice(-5) === "41024" ? AGENTS["AG-1024"] : null);
    if (!key) { agentInput.focus(); return; }
    if (a) {
      agentResult.innerHTML = '<div class="idcard"><img src="' + a.img + '" alt="Field agent ' + a.name + '"><div class="idcard__info"><span class="mono small muted">FIELD AGENT</span><b>' + a.name + '</b><span class="mono">Roll ' + a.roll + '</span><span>' + a.area + '</span><span class="small muted">Valid till ' + a.valid + '</span></div><span class="stamp stamp--green">REAL</span></div>';
    } else {
      agentResult.innerHTML = '<div class="idcard idcard--fake"><div class="ph-unknown">?</div><div class="idcard__info"><span class="mono small t-red">NOT IN OUR RECORDS</span><b>' + key.replace(/[<>&"]/g, "") + '</b><span class="small">Do not share documents or pay money. Report this person on the helpline.</span></div><span class="stamp stamp--red">FAKE</span></div>';
    }
    if (hasGsap && !reduce) gsap.from(agentResult.firstChild, { y: 20, opacity: 0, duration: .45, ease: "power3.out" });
    stampIn($(".stamp", agentResult));
  }
  $$(".desk__modes .chip", desk).forEach(function (c) {
    c.addEventListener("click", function () {
      $$(".desk__modes .chip", desk).forEach(function (x) { x.classList.toggle("is-on", x === c); });
      if (c.dataset.mode === "qr") {
        agentForm.hidden = true; scanner.hidden = false; agentResult.innerHTML = "";
        setTimeout(function () { scanner.hidden = true; agentForm.hidden = false; agentInput.value = "AG-1024"; showAgent("AG-1024"); }, 1900);
      } else {
        agentForm.hidden = false; scanner.hidden = true;
        agentLabel.textContent = c.dataset.mode;
        agentInput.placeholder = c.dataset.mode === "Mobile number" ? "e.g. 98290 41024" : "e.g. AG-1024";
        agentInput.inputMode = c.dataset.mode === "Mobile number" ? "numeric" : "text";
      }
    });
  });
  agentForm.addEventListener("submit", function (e) { e.preventDefault(); showAgent(agentInput.value); });
  $$("[data-try]").forEach(function (b) { b.addEventListener("click", function () { agentInput.value = b.dataset.try; showAgent(b.dataset.try); }); });

  var noticeInput = $("#noticeInput"), noticeResult = $("#noticeResult");
  function showNotice(q) {
    var key = (q || "").trim().toUpperCase();
    if (!key) { noticeInput.focus(); return; }
    if (key === "NT-2026-0417") {
      noticeResult.innerHTML = '<div class="letter"><span class="mono small t-green">GENUINE DOCUMENT</span><dl><dt>Type</dt><dd>Joining letter</dd><dt>Case</dt><dd class="mono">SJ-2026-04817</dd><dt>Issued</dt><dd>12 Nov 2026 by Control Room</dd><dt>Joining</dt><dd>18 Nov 2026, 10:00 AM</dd></dl><span class="stamp stamp--green">GENUINE</span></div>';
    } else {
      noticeResult.innerHTML = '<div class="letter" style="background:#f7e4dd"><span class="mono small t-red">NO SUCH NOTICE</span><p class="small" style="margin:.5em 0 2.4em">We never issued <b class="mono">' + key.replace(/[<>&"]/g, "") + '</b>. Do not trust this letter or pay any fee for it.</p><span class="stamp stamp--red">NOT ISSUED</span></div>';
    }
    if (hasGsap && !reduce) gsap.from(noticeResult.firstChild, { y: 20, opacity: 0, duration: .45, ease: "power3.out" });
    stampIn($(".stamp", noticeResult));
  }
  $("#noticeForm").addEventListener("submit", function (e) { e.preventDefault(); showNotice(noticeInput.value); });
  $$("[data-ntry]").forEach(function (b) { b.addEventListener("click", function () { noticeInput.value = b.dataset.ntry; showNotice(b.dataset.ntry); }); });

  /* ---------- app prototype ---------- */
  var screens = $$(".scr"), steps = $$(".step"), chips = $$("#appChips .chip"), current = -1, userTouched = false;
  function setScreen(i) {
    if (i === current) return; current = i;
    screens.forEach(function (s) { s.classList.toggle("is-on", +s.dataset.s === i); });
    steps.forEach(function (s) { s.classList.toggle("is-on", +s.dataset.step === i); });
    chips.forEach(function (c) { c.classList.toggle("is-on", +c.dataset.go === i); });
    var on = chips[i]; if (on && on.parentNode.scrollWidth > on.parentNode.clientWidth) on.parentNode.scrollTo({ left: on.offsetLeft - 16, behavior: "smooth" });
    if (i === 0 && hasGsap && !reduce) gsap.from(".otp i", { y: -10, opacity: 0, stagger: .12, duration: .3, delay: .2 });
  }
  setScreen(0);
  chips.forEach(function (c) { c.addEventListener("click", function () { userTouched = true; setScreen(+c.dataset.go); }); });
  $("#phone").addEventListener("click", function () { userTouched = true; setScreen((current + 1) % screens.length); });
  if ("IntersectionObserver" in window) {
    var stepIO = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) { if (en.isIntersecting) setScreen(+en.target.dataset.step); });
    }, { rootMargin: "-45% 0px -45% 0px" });
    steps.forEach(function (s) { stepIO.observe(s); });
    /* on phones the steps are hidden: auto-play the screens while visible */
    var autoTimer = null;
    var phoneIO = new IntersectionObserver(function (ents) {
      ents.forEach(function (en) {
        var mobile = window.matchMedia("(max-width:900px)").matches;
        clearInterval(autoTimer);
        if (en.isIntersecting && mobile && !reduce) autoTimer = setInterval(function () { if (!userTouched) setScreen((current + 1) % screens.length); }, 3200);
      });
    }, { threshold: .5 });
    phoneIO.observe($("#phone"));
  }

  /* ---------- duty: in/out timer ---------- */
  var clock = $("#clock"), checkBtn = $("#checkBtn"), tStart = 0, tId = null;
  checkBtn.addEventListener("click", function () {
    if (!tId) {
      tStart = Date.now();
      tId = setInterval(function () {
        var s = Math.floor((Date.now() - tStart) / 1000);
        clock.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60);
      }, 250);
      clock.classList.add("running"); checkBtn.textContent = "Check out";
    } else {
      clearInterval(tId); tId = null; clock.classList.remove("running");
      checkBtn.textContent = "Check in again";
    }
  });

  /* emergency leave */
  var ringFg = $("#ringFg"), ringTime = $("#ringTime"), ringState = $("#ringState"), ring = $("#ring"), leaveBtn = $("#leaveBtn");
  var C = 326.7;
  leaveBtn.addEventListener("click", function () {
    leaveBtn.disabled = true; ring.classList.remove("ok");
    ringState.textContent = "waiting for agent"; var total = 1800, left = total, t0 = Date.now();
    var iv = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / 3200); left = Math.round(total - p * 412);
      ringTime.textContent = pad(Math.floor(left / 60)) + ":" + pad(left % 60);
      ringFg.style.strokeDashoffset = (C * (1 - left / total)).toFixed(1);
      if (p >= 1) {
        clearInterval(iv); ring.classList.add("ok"); ringTime.textContent = "✓";
        ringState.textContent = "approved by AG-1024 in 6m 52s"; leaveBtn.disabled = false; leaveBtn.textContent = "Request again";
      }
    }, 50);
  });

  /* planned leave calendar */
  var cal = $("#cal"), calMsg = $("#calMsg"), DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  var MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var today = new Date();
  for (var d = 0; d < 14; d++) {
    var dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() + d);
    var b = document.createElement("button");
    b.type = "button"; b.innerHTML = DAYS[dt.getDay()] + "<b>" + dt.getDate() + "</b>";
    b.dataset.off = d; b.dataset.label = DAYS[dt.getDay()] + " " + dt.getDate() + " " + MON[dt.getMonth()];
    if (d === 0) b.classList.add("today"); else if (d < 3) b.classList.add("blocked");
    cal.appendChild(b);
  }
  cal.addEventListener("click", function (e) {
    var b = e.target.closest("button"); if (!b) return;
    $$("button", cal).forEach(function (x) { x.classList.remove("picked", "bad"); });
    var off = +b.dataset.off;
    if (off < 3) {
      if (off) b.classList.add("bad");
      calMsg.innerHTML = '<b class="t-red">Too late for planned leave.</b> Planned leave needs 3&ndash;4 days notice. Use emergency leave instead.';
    } else {
      b.classList.add("picked");
      calMsg.innerHTML = '<b class="t-green">Applied for ' + b.dataset.label + '.</b> One day’s salary (&#8377;540) is held until you are back on duty.';
    }
  });

  /* ---------- complaint ticket ---------- */
  var ticketBtn = $("#ticketBtn"), ticketId = $("#ticketId"), track = $$("#ticketTrack li");
  ticketBtn.addEventListener("click", function () {
    ticketBtn.disabled = true;
    track.forEach(function (l) { l.classList.remove("on"); });
    var id = "TKT-2026-" + (10000 + Math.floor(Math.random() * 89999));
    typeText(ticketId, id, 55, function () {
      track.forEach(function (l, i) { setTimeout(function () { l.classList.add("on"); if (i === track.length - 1) ticketBtn.disabled = false; }, 500 + i * 700); });
    });
  });

  /* ---------- fees ---------- */
  var baseFee = $("#baseFee"), payFee = $("#payFee"), codeNote = $("#codeNote"), wallet = $("#wallet"), walletAmt = $("#walletAmt"), walletUses = $("#walletUses");
  var countdown = $("#countdown"), cdTime = $("#cdTime"), receipt = $("#receipt"), cdId = null, uses = 312;
  var rFee = $("#rFee"), rDisc = $("#rDisc"), rPaid = $("#rPaid");
  function printReceipt(fee, pay) {
    rFee.textContent = rupee2(fee); rDisc.textContent = "−" + rupee2(fee - pay); rPaid.textContent = rupee2(pay);
    if (hasGsap && !reduce) gsap.fromTo(receipt, { yPercent: -100 }, { yPercent: 0, duration: 1.1, ease: "steps(14)" });
  }
  function countTo(el, from, to) {
    if (!hasGsap || reduce) { el.textContent = rupee(to); return; }
    var o = { v: from }; gsap.to(o, { v: to, duration: .7, ease: "power2.out", onUpdate: function () { el.textContent = rupee(Math.round(o.v)); } });
  }
  $$("[data-code]").forEach(function (c) {
    c.addEventListener("click", function () {
      $$("[data-code]").forEach(function (x) { x.classList.toggle("is-on", x === c); });
      wallet.hidden = true; countdown.hidden = true; clearInterval(cdId); baseFee.classList.add("cut");
      var code = c.dataset.code, fee = 500, pay = 500;
      if (code === "creator") {
        pay = 100; codeNote.innerHTML = "Creator code applied. The creator earns <b>&#8377;2</b> in their wallet for every use, up to their limit.";
        wallet.hidden = false; uses++; walletUses.textContent = uses; countTo(walletAmt, (uses - 1) * 2, uses * 2);
      } else if (code === "ref") {
        pay = 400; codeNote.innerHTML = "Referral code applied. Ravi&rsquo;s friend gets &#8377;100 off, and Ravi gets a reward too.";
      } else {
        fee = 200; pay = 20; codeNote.innerHTML = "Promo video link approved by admin. Fee drops from &#8377;200 to &#8377;20 for a limited time.";
        countdown.hidden = false; var end = Date.now() + 48 * 3600 * 1000 - 1000;
        var tick = function () { var s = Math.max(0, Math.floor((end - Date.now()) / 1000)); cdTime.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s / 60) % 60) + ":" + pad(s % 60); };
        tick(); cdId = setInterval(tick, 1000);
      }
      baseFee.textContent = rupee(fee);
      countTo(payFee, 500, pay);
      printReceipt(fee, pay);
    });
  });

  /* ---------- control room ---------- */
  var rows = $("#caseRows"), rowN = 4818, rowTimer = null;
  var ST = [["pill--blue", "Docs review"], ["pill--amber", "Meeting fixed"], ["pill--green", "Verified"], ["pill--blue", "New match"]];
  function addRow() {
    var st = ST[Math.floor(Math.random() * ST.length)];
    var tr = document.createElement("tr"); tr.className = "new";
    tr.innerHTML = '<td class="mono">SJ-2026-0' + (rowN++) + '</td><td>W-' + (2300 + Math.floor(Math.random() * 90)) + '</td><td>E-0' + (720 + Math.floor(Math.random() * 60)) + '</td><td>AG-10' + (10 + Math.floor(Math.random() * 30)) + '</td><td><span class="pill ' + st[0] + '">' + st[1] + '</span></td>';
    rows.insertBefore(tr, rows.firstChild);
    if (rows.children.length > 6) rows.removeChild(rows.lastElementChild);
  }

  /* =====================================================
     SCROLL STORY (GSAP)
     ===================================================== */
  if (!hasGsap) {
    document.documentElement.classList.remove("js");
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  if (reduce) {
    gsap.set(".reveal", { opacity: 1, y: 0 });
    $$(".strike").forEach(function (s) { s.style.setProperty("--s", "100%"); });
    $$(".wire i").forEach(function (w) { w.style.setProperty("--w", 1); });
    gsap.set("#hubCase", { opacity: 1 });
    gsap.set(".doc, #sealStamp", { opacity: 1 });
    gsap.set("#folderFront", { opacity: 0 });
    $$("#dosSteps li").forEach(function (l) { l.classList.add("on"); });
    $$(".icard").forEach(function (c) { c.classList.add("in"); });
    $$("[data-count]").forEach(function (k) { k.textContent = k.dataset.count; });
    return;
  }

  /* generic reveals: paper sliding onto the desk */
  ScrollTrigger.batch(".reveal", {
    start: "top 88%",
    onEnter: function (els) { gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: .12, overwrite: true }); }
  });

  /* hero: scrolling lifts the file cover */
  gsap.timeline({ scrollTrigger: { trigger: "#hero", start: "top top", end: "bottom top", scrub: .6 } })
    .to(".hfile__front", { rotateY: -38, ease: "none" }, 0)
    .to(".hfile__paper--2", { y: -60, rotate: 6, ease: "none" }, 0)
    .to(".hfile__paper--1", { y: -30, rotate: -6, ease: "none" }, 0)
    .to(".hero__video", { scale: 1.12, ease: "none" }, 0);

  /* problem: each complaint gets struck through as you read */
  $$(".strike").forEach(function (s) {
    gsap.to(s, { "--s": "100%", ease: "none", scrollTrigger: { trigger: s, start: "top 80%", end: "top 45%", scrub: .5 } });
  });
  ScrollTrigger.create({ trigger: "#notHere", start: "top 85%", once: true, onEnter: function () { stampIn($("#notHere")); } });
  gsap.set("#notHere", { opacity: 0 });

  /* blind match: lines run only into the Control Room */
  var mm = gsap.matchMedia();
  mm.add({ desk: "(min-width:901px)", mob: "(max-width:900px)" }, function (ctx) {
    var desk = ctx.conditions.desk;
    var tl = gsap.timeline({ scrollTrigger: { trigger: "#board", start: desk ? "top 75%" : "top 80%", end: desk ? "center 45%" : "bottom 60%", scrub: .6 } });
    tl.from(".person--w", desk ? { x: -80, opacity: 0, rotate: -3 } : { y: 60, opacity: 0 }, 0)
      .from(".person--e", desk ? { x: 80, opacity: 0, rotate: 3 } : { y: 60, opacity: 0 }, desk ? 0 : .5)
      .from(".hub", { scale: .6, opacity: 0 }, .15)
      .to(".wire--l i", { "--w": 1, ease: "none" }, .4)
      .to(".wire--r i", { "--w": 1, ease: "none" }, .4)
      .from(".nodirect", { opacity: 0, y: -10 }, .5)
      .to("#hubCase", { opacity: 1 }, .9);
  });

  /* ===== THE DOSSIER - pinned film sequence ===== */
  var dosTitle = $("#dosTitle"), dosSteps = $$("#dosSteps li");
  var titles = ["A permanent record for every case.", "Every document, checked by hand.", "Every promise, signed by three.", "Verified. Sealed. Kept forever."];
  var lastTitle = 0;
  function setTitle(i) {
    if (i === lastTitle) return; lastTitle = i;
    gsap.to(dosTitle, { opacity: 0, y: -10, duration: .2, onComplete: function () { dosTitle.textContent = titles[i]; gsap.to(dosTitle, { opacity: 1, y: 0, duration: .3 }); } });
  }
  mm.add({ desk: "(min-width:901px)", mob: "(max-width:900px)" }, function (ctx) {
    var desk = ctx.conditions.desk;
    var docs = $$(".doc");
    var from = [
      { x: -420, y: -380, rotate: -40 }, { x: 420, y: -420, rotate: 35 },
      { x: -380, y: 420, rotate: 25 }, { x: 420, y: 380, rotate: -30 }
    ];
    var rest = [-4, 3, 2, -3];
    var tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#dossier", pin: ".dossier__pin", start: "top top", end: desk ? "+=280%" : "+=230%", scrub: .8,
        onUpdate: function (self) {
          var p = self.progress;
          var n = p < .12 ? 1 : p < .3 ? 2 : p < .44 ? 3 : p < .58 ? 4 : p < .72 ? 5 : 6;
          dosSteps.forEach(function (l, i) { l.classList.toggle("on", i < n); });
          setTitle(p < .26 ? 0 : p < .5 ? 1 : p < .74 ? 2 : 3);
        }
      }
    });
    tl.fromTo("#folder", { rotateX: 58, rotateZ: -6, y: 140, scale: .78, opacity: .4 }, { rotateX: 8, rotateZ: 0, y: 0, scale: 1, opacity: 1, duration: 1.2, ease: "power2.out" })
      /* cover lifted away by the agent */
      .to("#folderFront", { rotateY: -55, x: desk ? -60 : -30, duration: .7, ease: "power2.in" })
      .to("#folderFront", { y: "120%", rotate: -14, opacity: 0, duration: .7, ease: "power2.in" });
    docs.forEach(function (d, i) {
      var f = from[i];
      tl.fromTo(d, { x: desk ? f.x : f.x * .5, y: desk ? f.y : f.y * .6, rotate: f.rotate, opacity: 0, scale: 1.25 },
        { x: 0, y: 0, rotate: rest[i], opacity: 1, scale: 1, duration: 1, ease: "power3.out" }, i === 0 ? ">-.2" : ">-.35");
    });
    /* the stamp falls, ink spreads, the desk shakes */
    tl.to("#folder", { rotateX: 0, duration: .4 })
      .fromTo("#sealStamp", { scale: 3.2, opacity: 0, rotate: -30 }, { scale: 1, opacity: 1, rotate: -12, duration: .45, ease: "power4.in" })
      .fromTo("#ink", { scale: 0, opacity: 1 }, { scale: 1.6, opacity: 0, duration: .6, ease: "power2.out" })
      .to("#folder", { keyframes: [{ x: -8, y: 4 }, { x: 7, y: -3 }, { x: -4, y: 2 }, { x: 0, y: 0 }], duration: .35 }, "<")
      .to({}, { duration: .8 });
  });

  /* duty bars rise like a register filling up */
  gsap.from(".bars div", { scaleY: 0, stagger: .06, duration: .8, ease: "power3.out", scrollTrigger: { trigger: ".bars", start: "top 90%" } });

  /* rule book: blacklist stamp lands when the card arrives */
  $$(".icard").forEach(function (c) {
    ScrollTrigger.create({ trigger: c, start: "top 75%", once: true, onEnter: function () { setTimeout(function () { c.classList.add("in"); }, 400); } });
  });

  /* receipt prints when the fees chapter opens */
  ScrollTrigger.create({ trigger: ".fees__receipt", start: "top 75%", once: true, onEnter: function () { printReceipt(500, 500); } });
  gsap.from(".flow li", { opacity: 0, x: -20, stagger: .15, duration: .6, scrollTrigger: { trigger: ".flow", start: "top 85%" } });

  /* control room comes alive */
  ScrollTrigger.create({
    trigger: "#admin", start: "top 75%", end: "bottom top",
    onEnter: function () {
      $$("[data-count]").forEach(function (k) { var o = { v: 0 }; gsap.to(o, { v: +k.dataset.count, duration: 1.4, ease: "power2.out", onUpdate: function () { k.textContent = Math.round(o.v); } }); });
      clearInterval(rowTimer); rowTimer = setInterval(addRow, 3500);
    },
    onLeave: function () { clearInterval(rowTimer); },
    onEnterBack: function () { clearInterval(rowTimer); rowTimer = setInterval(addRow, 3500); },
    onLeaveBack: function () { clearInterval(rowTimer); }
  });
  gsap.from(".admin", { rotateX: 18, y: 60, transformPerspective: 1400, transformOrigin: "50% 100%", ease: "none", scrollTrigger: { trigger: "#admin", start: "top 95%", end: "top 45%", scrub: .6 } });

  /* case closed */
  var closedVid = $(".closed__video");
  ScrollTrigger.create({
    trigger: "#closed", start: "top 90%", end: "bottom top",
    onToggle: function (self) { if (!closedVid) return; if (self.isActive) { var p = closedVid.play(); if (p && p.catch) p.catch(function () {}); } else closedVid.pause(); }
  });
  gsap.set("#closedStamp", { opacity: 0 });
  ScrollTrigger.create({ trigger: "#closedStamp", start: "top 88%", once: true, onEnter: function () { stampIn($("#closedStamp")); } });
  gsap.from(".closed__h", { opacity: 0, y: 40, duration: 1, ease: "power3.out", scrollTrigger: { trigger: ".closed__h", start: "top 85%" } });

  window.addEventListener("load", function () { ScrollTrigger.refresh(); });
})();
