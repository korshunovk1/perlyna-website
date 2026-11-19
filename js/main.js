(function () {
  "use strict";

  var HOURS = {
    0: null,
    1: [9, 20], 2: [9, 20], 3: [9, 20], 4: [9, 20], 5: [9, 20],
    6: [10, 16]
  };

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () { header.classList.toggle("is-scrolled", window.scrollY > 8); };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  var burger = document.querySelector(".burger");
  var nav = document.getElementById("site-nav");
  if (burger && nav) {
    var setMenu = function (open) {
      nav.classList.toggle("is-open", open);
      document.body.style.overflow = open ? "hidden" : "";
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Закрити меню" : "Відкрити меню");
      burger.querySelector(".icon-menu").style.display = open ? "none" : "";
      burger.querySelector(".icon-close").style.display = open ? "" : "none";
    };
    burger.addEventListener("click", function () {
      setMenu(burger.getAttribute("aria-expanded") !== "true");
    });
    document.addEventListener("click", function (e) {
      if (nav.classList.contains("is-open") && !nav.contains(e.target) && !burger.contains(e.target)) {
        setMenu(false);
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("is-open")) { setMenu(false); burger.focus(); }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1200 && nav.classList.contains("is-open")) setMenu(false);
    });
    nav.addEventListener("click", function (e) { if (e.target.closest("a")) setMenu(false); });
  }

  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  var now = new Date();
  var today = HOURS[now.getDay()];
  var hourNow = now.getHours() + now.getMinutes() / 60;
  var isOpen = !!today && hourNow >= today[0] && hourNow < today[1];

  document.querySelectorAll("[data-status]").forEach(function (el) {
    var dateEl = el.querySelector(".date");
    var stateEl = el.querySelector(".state-text");
    var dotEl = el.querySelector(".status-dot");
    var hoursEl = el.querySelector(".hours");
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString("uk-UA", { day: "numeric", month: "long", year: "numeric" });
    }
    if (stateEl) stateEl.textContent = isOpen ? "Зараз відчинено" : "Зараз зачинено";
    if (dotEl) dotEl.classList.toggle("is-closed", !isOpen);
    if (hoursEl) hoursEl.textContent = today ? "Сьогодні " + today[0] + ":00 – " + today[1] + ":00" : "Сьогодні вихідний";
  });

  document.querySelectorAll("[data-day]").forEach(function (row) {
    var days = row.getAttribute("data-day").split(",").map(Number);
    if (days.indexOf(now.getDay()) !== -1) row.classList.add("is-today");
  });

var mainImg = document.querySelector(".gallery-feature__main");
  var fadeTimer = null;
  if (mainImg) {
    document.querySelectorAll(".thumb").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.getAttribute("aria-pressed") === "true") return;
        document.querySelectorAll(".thumb").forEach(function (b) { b.setAttribute("aria-pressed", "false"); });
        btn.setAttribute("aria-pressed", "true");
        clearTimeout(fadeTimer);
        var swap = function () {
          mainImg.onload = function () { mainImg.classList.remove("is-fading"); };
          mainImg.onerror = function () { mainImg.classList.remove("is-fading"); };
          mainImg.src = btn.dataset.full;
          mainImg.alt = btn.querySelector("img").alt;
          if (mainImg.complete) mainImg.classList.remove("is-fading");
        };
        if (reduceMotion) { swap(); return; }
        mainImg.classList.add("is-fading");
        fadeTimer = setTimeout(swap, 200);
      });
    });
  }

  var track = document.querySelector(".doctors-track");
  var prev = document.querySelector("[data-carousel='prev']");
  var next = document.querySelector("[data-carousel='next']");
  if (track && prev && next) {
    var step = function () {
      var card = track.querySelector("li");
      return card ? card.getBoundingClientRect().width + 16 : 300;
    };
    var update = function () {
      prev.disabled = track.scrollLeft <= 4;
      next.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 4;
    };
    prev.addEventListener("click", function () { track.scrollBy({ left: -step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    next.addEventListener("click", function () { track.scrollBy({ left: step(), behavior: reduceMotion ? "auto" : "smooth" }); });
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  }

  var chips = document.querySelectorAll(".chip[href^='#']");
  if (chips.length && "IntersectionObserver" in window) {
    var byId = {};
    var setActiveChip = function (chip) {
      if (!chip) return;
      chips.forEach(function (c) { c.classList.remove("is-active"); c.removeAttribute("aria-current"); });
      chip.classList.add("is-active");
      chip.setAttribute("aria-current", "true");
      var list = chip.closest(".chips");
      if (list) {
        var left = chip.offsetLeft - list.clientWidth / 2 + chip.offsetWidth / 2;
        list.scrollTo({ left: Math.max(0, left), behavior: reduceMotion ? "auto" : "smooth" });
      }
    };
    chips.forEach(function (c) {
      byId[c.getAttribute("href").slice(1)] = c;
      c.addEventListener("click", function () { setActiveChip(c); });
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) setActiveChip(byId[entry.target.id]);
      });
    }, { rootMargin: "-25% 0px -55% 0px" });
    Object.keys(byId).forEach(function (id) {
      var section = document.getElementById(id);
      if (section) io.observe(section);
    });
  }

  var todayISO = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  document.querySelectorAll("input[type='date']").forEach(function (input) { input.min = todayISO; });

  document.querySelectorAll("[data-promo]").forEach(function (promo) {
    var deadline = new Date(promo.getAttribute("data-deadline")).getTime();
    var out = promo.querySelector("[data-promo-time]");
    var pad = function (n) { return String(n).padStart(2, "0"); };
    var dayWord = function (d) {
      if (d % 10 === 1 && d % 100 !== 11) return "день";
      if (d % 10 >= 2 && d % 10 <= 4 && (d % 100 < 10 || d % 100 >= 20)) return "дні";
      return "днів";
    };
    var timer;
    var tick = function () {
      var left = Math.floor((deadline - Date.now()) / 1000);
      if (!(left > 0)) { promo.hidden = true; clearInterval(timer); return; }
      var d = Math.floor(left / 86400);
      var hms = pad(Math.floor(left % 86400 / 3600)) + ":" + pad(Math.floor(left % 3600 / 60)) + ":" + pad(left % 60);
      out.textContent = (d ? d + " " + dayWord(d) + " " : "") + hms;
      out.setAttribute("datetime", "P" + d + "DT" + Math.floor(left % 86400 / 3600) + "H" + Math.floor(left % 3600 / 60) + "M");
    };
    tick();
    timer = setInterval(tick, 1000);
  });

  var params = new URLSearchParams(window.location.search);
  ["doctor", "service"].forEach(function (key) {
    var value = params.get(key);
    var select = document.querySelector("select[name='" + key + "']");
    if (value && select && select.querySelector("option[value='" + CSS.escape(value) + "']")) select.value = value;
  });

  var bookingTarget = location.hash === "#booking" && document.getElementById("booking");
  if (bookingTarget) {
    var userScrolled = false;
    var markScrolled = function () { userScrolled = true; };
    window.addEventListener("wheel", markScrolled, { passive: true, once: true });
    window.addEventListener("touchmove", markScrolled, { passive: true, once: true });
    var toBooking = function () {
      if (!userScrolled) bookingTarget.scrollIntoView({ block: "start", behavior: "instant" });
    };
    requestAnimationFrame(toBooking);
    window.addEventListener("load", toBooking, { once: true });
  }

  var formatPhone = function (raw) {
    var digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    if (digits[0] === "0") digits = "38" + digits;
    else if (digits[0] === "8" && digits[1] === "0") digits = "3" + digits;
    else if (digits[0] !== "3") digits = "380" + digits;
    digits = digits.slice(0, 12);

    var res = "+" + digits.slice(0, 3);
    if (digits.length > 3) res += " " + digits.slice(3, 5);
    if (digits.length > 5) res += " " + digits.slice(5, 8);
    if (digits.length > 8) res += " " + digits.slice(8, 10);
    if (digits.length > 10) res += " " + digits.slice(10, 12);
    return res;
  };

  var syncTimeOptions = function (form, dateValue) {
    var timeSelect = form.querySelector("select[name='time']");
    if (!timeSelect) return;
    var isSat = false;
    if (dateValue) {
      var d = new Date(dateValue + "T12:00:00");
      isSat = d.getDay() === 6;
    }
    Array.prototype.forEach.call(timeSelect.options, function (opt) {
      if (!opt.value) return;
      var hour = parseInt(opt.value, 10);
      opt.disabled = isSat && (hour < 10 || hour > 15);
    });
    var selected = timeSelect.options[timeSelect.selectedIndex];
    if (selected && selected.disabled) timeSelect.value = "";
  };

  var MESSAGES = {
    valueMissing: "Заповніть це поле.",
    typeMismatch: "Перевірте формат, наприклад name@mail.com.",
    patternMismatch: "Вкажіть номер у форматі +380 XX XXX XX XX.",
    rangeUnderflow: "Оберіть сьогоднішню або майбутню дату."
  };

  var validateField = function (input) {
    var field = input.closest(".field");
    if (!field) return input.checkValidity();
    var errorEl = field.querySelector(".field__error");
    var msg = "";
    input.setCustomValidity("");

    if (!input.checkValidity()) {
      var v = input.validity;
      msg = v.valueMissing ? MESSAGES.valueMissing
        : v.typeMismatch ? MESSAGES.typeMismatch
        : v.patternMismatch ? MESSAGES.patternMismatch
        : v.rangeUnderflow ? MESSAGES.rangeUnderflow
        : input.validationMessage;
    }

    if (!msg && input.type === "date" && input.value) {
      var d = new Date(input.value + "T12:00:00");
      if (d.getDay() === 0) {
        msg = "У неділю ми не працюємо. Оберіть інший день.";
        input.setCustomValidity(msg);
      }
    }

    if (!msg && input.name === "time" && input.value) {
      var form = input.closest("form");
      var dateInput = form && form.querySelector("input[type='date']");
      if (dateInput && dateInput.value) {
        var day = new Date(dateInput.value + "T12:00:00").getDay();
        var hour = parseInt(input.value, 10);
        if (day === 6 && (hour < 10 || hour > 15)) {
          msg = "У суботу прийом з 10:00 до 16:00.";
          input.setCustomValidity(msg);
        }
      }
    }

    field.classList.toggle("has-error", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (errorEl) errorEl.textContent = msg;
    return !msg;
  };

  document.querySelectorAll("form[data-booking]").forEach(function (form) {
    var inputs = form.querySelectorAll(".input");
    var dateInput = form.querySelector("input[type='date']");
    var consent = form.querySelector("input[name='consent']");
    var consentError = form.querySelector("[data-consent-error]");

    if (dateInput) {
      syncTimeOptions(form, dateInput.value);
      dateInput.addEventListener("change", function () {
        syncTimeOptions(form, dateInput.value);
        validateField(dateInput);
      });
    }

    inputs.forEach(function (input) {
      input.addEventListener("blur", function () {
        if (input.value) validateField(input);
      });
      input.addEventListener("input", function () {
        if (input.type === "tel") input.value = formatPhone(input.value);
        if (input.closest(".field").classList.contains("has-error")) validateField(input);
      });
    });

    if (consent) {
      consent.addEventListener("change", function () {
        if (consent.checked) {
          consent.setAttribute("aria-invalid", "false");
          if (consentError) consentError.textContent = "";
        }
      });
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstInvalid = null;
      inputs.forEach(function (input) {
        if (!validateField(input) && !firstInvalid) firstInvalid = input;
      });

      if (consent && !consent.checked) {
        consent.setAttribute("aria-invalid", "true");
        if (consentError) consentError.textContent = "Потрібна ваша згода, щоб ми могли зателефонувати.";
        if (!firstInvalid) firstInvalid = consent;
      } else if (consent) {
        consent.setAttribute("aria-invalid", "false");
        if (consentError) consentError.textContent = "";
      }

      if (firstInvalid) { firstInvalid.focus(); return; }

      var button = form.querySelector("button[type='submit']");
      var label = button.querySelector("span");
      var original = label.textContent;
      button.disabled = true;
      label.textContent = "Надсилаємо…";
      setTimeout(function () {
        button.disabled = false;
        label.textContent = original;
        form.reset();
        syncTimeOptions(form, "");
        inputs.forEach(function (i) { i.removeAttribute("aria-invalid"); });
        if (consent) consent.removeAttribute("aria-invalid");
        var success = form.querySelector(".form-success");
        if (success) {
          success.classList.add("is-visible");
          success.focus();
        }
      }, 900);
    });
  });
})();