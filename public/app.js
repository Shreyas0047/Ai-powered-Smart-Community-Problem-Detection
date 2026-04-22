const form = document.getElementById("complaintForm");
const reportLocationInput = document.getElementById("reportLocation");
const complaintInputMode = document.getElementById("complaintInputMode");
const typedComplaintField = document.getElementById("typedComplaintField");
const typedComplaintInput = document.getElementById("typedComplaintInput");
const voiceComplaintField = document.getElementById("voiceComplaintField");
const voiceTranscriptInput = document.getElementById("voiceTranscriptInput");
const voiceAudioFileInput = document.getElementById("voiceAudioFile");
const voiceAudioPreview = document.getElementById("voiceAudioPreview");
const voiceAudioMeta = document.getElementById("voiceAudioMeta");
const transcribeAudioBtn = document.getElementById("transcribeAudioBtn");
const voiceTranscriptStatus = document.getElementById("voiceTranscriptStatus");
const imageFileInput = document.getElementById("imageFile");
const aiImageDescription = document.getElementById("aiImageDescription");
const uploadPreview = document.getElementById("uploadPreview");
const imagePreview = document.getElementById("imagePreview");
const imageName = document.getElementById("imageName");
const imageHintText = document.getElementById("imageHintText");
const showAiAccuracyBtn = document.getElementById("showAiAccuracyBtn");
const aiAccuracyStatus = document.getElementById("aiAccuracyStatus");
const previewLocationBtn = document.getElementById("previewLocationBtn");
const useLiveLocationBtn = document.getElementById("useLiveLocationBtn");
const resetDashboardBtn = document.getElementById("resetDashboardBtn");
const generatePdfBtn = document.getElementById("generatePdfBtn");
const emailBbmpBtn = document.getElementById("emailBbmpBtn");
const emailProgress = document.getElementById("emailProgress");
const emailProgressLabel = document.getElementById("emailProgressLabel");
const emailProgressValue = document.getElementById("emailProgressValue");
const emailProgressFill = document.getElementById("emailProgressFill");
const audioToggleBtn = document.getElementById("audioToggleBtn");
const testMicrophoneBtn = document.getElementById("testMicrophoneBtn");
const dashboardMessage = document.getElementById("dashboardMessage");
const issueTokenBtn = document.getElementById("issueTokenBtn");
const authRole = document.getElementById("authRole");
const authPermissions = document.getElementById("authPermissions");
const authTokenState = document.getElementById("authTokenState");
const activeUsername = document.getElementById("activeUsername");
const complaintSubmitBtn = document.getElementById("complaintSubmitBtn");
const authOverlay = document.getElementById("authOverlay");
const faqOverlay = document.getElementById("faqOverlay");
const closeAuthBtn = document.getElementById("closeAuthBtn");
const closeFaqBtn = document.getElementById("closeFaqBtn");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authMessage = document.getElementById("authMessage");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const siteNav = document.getElementById("siteNav");
const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const openFaqLink = document.getElementById("openFaqLink");
const userManagementList = document.getElementById("userManagementList");
const mainDashboard = document.getElementById("mainDashboard");
const reportWorkspace = document.getElementById("reportWorkspace");
const reportFormWorkspace = document.getElementById("reportFormWorkspace");
const complaintsWorkspace = document.getElementById("complaintsWorkspace");
const adminWorkspace = document.getElementById("adminWorkspace");
const adminActionCenter = document.getElementById("adminActionCenter");
const alertsWorkspace = document.getElementById("alertsWorkspace");
const alertsList = document.getElementById("alertsList");
const mapWorkspace = document.getElementById("mapWorkspace");
const userManagementWorkspace = document.getElementById("userManagementWorkspace");
const locationMapFrame = document.getElementById("locationMapFrame");
const liveLocationStatus = document.getElementById("liveLocationStatus");

const storageKey = "smart-community-auth";
const audioStorageKey = "smart-community-audio-enabled";
let authState = null;
let authMode = "login";
let currentImageFeatures = null;
let currentImageInsight = null;
let currentImageDataUrl = null;
let lastSubmittedReport = null;
let audioEnabled = true;
let audioContext = null;
let masterGain = null;
let effectsGain = null;
let ambienceGain = null;
let ambienceTimer = null;
let ambienceStarted = false;
let emailProgressTimer = null;
let lastMicrophoneAccessState = "unknown";
let currentVoiceAudioData = null;
let currentVoiceAudioObjectUrl = null;

const permissionMeta = {
  submit_complaint: { label: "Submit Complaint", target: () => reportFormWorkspace },
  view_personal_updates: { label: "View Personal Updates", target: () => complaintsWorkspace },
  view_dashboard: { label: "View Dashboard", target: () => adminWorkspace },
  reset_dashboard: { label: "Reset Dashboard", action: () => resetDashboardBtn.click() },
  manage_alerts: { label: "Manage Alerts", target: () => alertsWorkspace },
  update_complaint_status: { label: "Update Complaint Status", target: () => complaintsWorkspace },
  delete_users: { label: "Delete Users", target: () => userManagementWorkspace }
};

function setDashboardMessage(message, type = "info") {
  dashboardMessage.textContent = message;
  dashboardMessage.dataset.state = type;
}

function loadAudioPreference() {
  try {
    const saved = localStorage.getItem(audioStorageKey);
    if (saved !== null) {
      audioEnabled = saved === "true";
    }
  } catch (_error) {
    audioEnabled = true;
  }
}

function saveAudioPreference() {
  try {
    localStorage.setItem(audioStorageKey, String(audioEnabled));
  } catch (_error) {
    // ignore localStorage failures
  }
}

function updateAudioToggleState() {
  audioToggleBtn.textContent = audioEnabled ? "Sound On" : "Sound Off";
  audioToggleBtn.dataset.state = audioEnabled ? "enabled" : "muted";
}

function ensureAudioContext() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) {
    return null;
  }

  if (!audioContext) {
    audioContext = new AudioContextClass();
    masterGain = audioContext.createGain();
    masterGain.gain.value = 0.32;
    masterGain.connect(audioContext.destination);

    effectsGain = audioContext.createGain();
    effectsGain.gain.value = 0.9;
    effectsGain.connect(masterGain);

    ambienceGain = audioContext.createGain();
    ambienceGain.gain.value = 0.12;
    ambienceGain.connect(masterGain);
  }

  return audioContext;
}

async function unlockAudio() {
  const context = ensureAudioContext();
  if (!context || !audioEnabled) {
    return;
  }

  if (context.state === "suspended") {
    try {
      await context.resume();
    } catch (_error) {
      return;
    }
  }

  if (!ambienceStarted) {
    ambienceStarted = true;
    playReadyChime();
    startAmbientLoop();
  }
}

function playReadyChime() {
  if (!audioContext || audioContext.state !== "running" || !effectsGain) {
    return;
  }

  const now = audioContext.currentTime + 0.02;
  [
    { frequency: 523.25, duration: 0.08, volume: 0.12, startOffset: 0 },
    { frequency: 659.25, duration: 0.1, volume: 0.1, startOffset: 0.06 },
    { frequency: 783.99, duration: 0.12, volume: 0.09, startOffset: 0.12 }
  ].forEach((tone) => {
    createTone({
      frequency: tone.frequency,
      type: "triangle",
      start: now + tone.startOffset,
      duration: tone.duration,
      volume: tone.volume,
      destination: effectsGain,
      attack: 0.01,
      release: 0.12
    });
  });
}

function stopAmbientLoop() {
  if (ambienceTimer) {
    window.clearTimeout(ambienceTimer);
    ambienceTimer = null;
  }

  if (ambienceGain && audioContext) {
    const now = audioContext.currentTime;
    ambienceGain.gain.cancelScheduledValues(now);
    ambienceGain.gain.setValueAtTime(ambienceGain.gain.value, now);
    ambienceGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
  }
}

function createTone({ frequency, type = "sine", start, duration, volume, destination, attack = 0.02, release = 0.2, detune = 0 }) {
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, start);
  oscillator.detune.setValueAtTime(detune, start);
  gainNode.gain.setValueAtTime(0.0001, start);
  gainNode.gain.linearRampToValueAtTime(volume, start + attack);
  gainNode.gain.exponentialRampToValueAtTime(0.0001, start + duration + release);

  oscillator.connect(gainNode);
  gainNode.connect(destination);
  oscillator.start(start);
  oscillator.stop(start + duration + release + 0.02);
}

function scheduleAmbientPhrase(startTime) {
  const padChords = [
    [196, 246.94, 293.66],
    [174.61, 220, 261.63],
    [196, 246.94, 329.63],
    [164.81, 220, 261.63]
  ];
  const leadNotes = [392, 440, 392, 349.23, 329.63, 349.23, 293.66, 329.63];

  padChords.forEach((chord, index) => {
    const chordStart = startTime + index * 4;
    chord.forEach((frequency, voiceIndex) => {
      createTone({
        frequency,
        type: "triangle",
        start: chordStart,
        duration: 3.4,
        volume: 0.045 - voiceIndex * 0.008,
        destination: ambienceGain,
        attack: 0.55,
        release: 0.9,
        detune: voiceIndex === 0 ? -6 : voiceIndex === 2 ? 5 : 0
      });
    });
  });

  leadNotes.forEach((frequency, index) => {
    createTone({
      frequency,
      type: "sine",
      start: startTime + 0.8 + index * 1.9,
      duration: 0.52,
      volume: 0.024,
      destination: ambienceGain,
      attack: 0.04,
      release: 0.22
    });
  });
}

function startAmbientLoop() {
  if (!audioEnabled || !ensureAudioContext()) {
    return;
  }

  const context = audioContext;
  const phraseLengthMs = 16000;
  const phraseLeadSeconds = 0.15;

  ambienceGain.gain.cancelScheduledValues(context.currentTime);
  ambienceGain.gain.setValueAtTime(ambienceGain.gain.value || 0.0001, context.currentTime);
  ambienceGain.gain.linearRampToValueAtTime(0.14, context.currentTime + 0.8);

  const scheduleNext = () => {
    if (!audioEnabled || !audioContext || audioContext.state !== "running") {
      ambienceTimer = null;
      return;
    }

    scheduleAmbientPhrase(audioContext.currentTime + phraseLeadSeconds);
    ambienceTimer = window.setTimeout(scheduleNext, phraseLengthMs - 400);
  };

  if (ambienceTimer) {
    window.clearTimeout(ambienceTimer);
  }

  scheduleNext();
}

function playButtonSound(button) {
  if (!audioEnabled || !ensureAudioContext() || audioContext.state !== "running" || !button) {
    return;
  }

  const now = audioContext.currentTime;
  const soundType = button.classList.contains("danger-button")
    ? "danger"
    : button.id === "complaintSubmitBtn"
      ? "submit"
      : button.id === "generatePdfBtn"
        ? "pdf"
        : button.classList.contains("secondary-button")
          ? "secondary"
          : button.classList.contains("chip-button") || button.classList.contains("login-button")
            ? "navigation"
            : "default";

  const soundProfiles = {
    default: [
      { frequency: 520, duration: 0.05, volume: 0.08, type: "triangle", attack: 0.01, release: 0.08 },
      { frequency: 780, duration: 0.04, volume: 0.045, type: "sine", attack: 0.01, release: 0.08, startOffset: 0.025 }
    ],
    secondary: [
      { frequency: 430, duration: 0.05, volume: 0.07, type: "triangle", attack: 0.01, release: 0.09 },
      { frequency: 645, duration: 0.03, volume: 0.035, type: "sine", attack: 0.01, release: 0.08, startOffset: 0.018 }
    ],
    submit: [
      { frequency: 523.25, duration: 0.07, volume: 0.08, type: "triangle", attack: 0.01, release: 0.1 },
      { frequency: 659.25, duration: 0.07, volume: 0.07, type: "triangle", attack: 0.01, release: 0.1, startOffset: 0.045 },
      { frequency: 783.99, duration: 0.08, volume: 0.06, type: "sine", attack: 0.012, release: 0.12, startOffset: 0.09 }
    ],
    pdf: [
      { frequency: 392, duration: 0.06, volume: 0.075, type: "triangle", attack: 0.01, release: 0.1 },
      { frequency: 587.33, duration: 0.06, volume: 0.055, type: "triangle", attack: 0.01, release: 0.1, startOffset: 0.04 }
    ],
    navigation: [
      { frequency: 610, duration: 0.045, volume: 0.065, type: "sine", attack: 0.01, release: 0.07 },
      { frequency: 915, duration: 0.03, volume: 0.035, type: "sine", attack: 0.01, release: 0.06, startOffset: 0.02 }
    ],
    danger: [
      { frequency: 240, duration: 0.07, volume: 0.085, type: "square", attack: 0.005, release: 0.08 },
      { frequency: 180, duration: 0.08, volume: 0.05, type: "triangle", attack: 0.005, release: 0.1, startOffset: 0.05 }
    ]
  };

  soundProfiles[soundType].forEach((tone) => {
    createTone({
      frequency: tone.frequency,
      type: tone.type,
      start: now + (tone.startOffset || 0),
      duration: tone.duration,
      volume: tone.volume,
      destination: effectsGain,
      attack: tone.attack,
      release: tone.release
    });
  });
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAuthHeaders() {
  if (!authState?.token) {
    return { "Content-Type": "application/json" };
  }

  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${authState.token}`
  };
}

function saveAuthState() {
  if (authState) {
    localStorage.setItem(storageKey, JSON.stringify(authState));
  } else {
    localStorage.removeItem(storageKey);
  }
}

function clearAuthState(message) {
  authState = null;
  lastSubmittedReport = null;
  saveAuthState();
  applyPermissionState();
  setPdfButtonState(false);
  renderLoggedOutState();
  if (message) {
    setDashboardMessage(message, "info");
  }
}

function loadSavedAuthState() {
  authState = null;
  try {
    localStorage.removeItem(storageKey);
  } catch (_error) {
    authState = null;
  }
}

function openAuthOverlay(mode = "login") {
  authMode = mode;
  authOverlay.hidden = false;
  document.body.classList.add("auth-open");
  if (siteNav?.classList.contains("is-open")) {
    siteNav.classList.remove("is-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
  }
  showLoginBtn.classList.toggle("is-active", mode === "login");
  showRegisterBtn.classList.toggle("is-active", mode === "register");
  authSubmitBtn.textContent = mode === "login" ? "Login" : "Register";
  authMessage.textContent =
    mode === "login"
      ? "Choose Admin or Citizen, then login with your username and password."
      : "Choose Admin or Citizen, create a username and password, then register.";
}

function closeAuthOverlay() {
  if (!authState?.token) {
    authMessage.textContent = "Login is required to access the dashboard.";
    return;
  }
  authOverlay.hidden = true;
  if (faqOverlay?.hidden !== false) {
    document.body.classList.remove("auth-open");
  }
}

function openFaqOverlay() {
  faqOverlay.hidden = false;
  document.body.classList.add("auth-open");
  if (siteNav?.classList.contains("is-open")) {
    siteNav.classList.remove("is-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
  }
}

function closeFaqOverlay() {
  faqOverlay.hidden = true;
  if (authOverlay?.hidden !== false) {
    document.body.classList.remove("auth-open");
  }
}

function goToMainDashboard() {
  window.location.hash = "mainDashboard";
  mainDashboard.scrollIntoView({ behavior: "smooth", block: "start" });
}

function scrollToWorkspace(element, message) {
  if (!element) return;
  element.scrollIntoView({ behavior: "smooth", block: "start" });
  if (message) {
    setDashboardMessage(message, "success");
  }
}

function toggleMobileMenu(forceState) {
  if (!siteNav || !mobileMenuToggle) {
    return;
  }

  const nextState = typeof forceState === "boolean" ? forceState : !siteNav.classList.contains("is-open");
  siteNav.classList.toggle("is-open", nextState);
  mobileMenuToggle.setAttribute("aria-expanded", String(nextState));
}

function setupMobileMenu() {
  if (!siteNav || !mobileMenuToggle) {
    return;
  }

  mobileMenuToggle.addEventListener("click", () => toggleMobileMenu());

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => toggleMobileMenu(false));
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 720) {
      toggleMobileMenu(false);
    }
  });
}

function setupRevealAnimations() {
  const revealElements = document.querySelectorAll("[data-reveal]");
  if (!revealElements.length) {
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -40px 0px"
    }
  );

  revealElements.forEach((element) => observer.observe(element));
}

function setupHorizontalTicker() {
  const tickerSection = document.querySelector(".ticker-section");
  const tickerStage = document.getElementById("tickerStage");
  const tickerTrack = document.getElementById("tickerTrack");

  if (!tickerSection || !tickerStage || !tickerTrack || !window.gsap || !window.ScrollTrigger) {
    return;
  }

  window.gsap.registerPlugin(window.ScrollTrigger);

  const existingTrigger = window.ScrollTrigger.getById("civic-ticker");
  if (existingTrigger) {
    existingTrigger.kill();
  }

  window.gsap.killTweensOf(tickerTrack);
  window.gsap.set(tickerTrack, { x: 0 });

  const getTravelDistance = () => {
    const availableWidth = tickerStage.clientWidth;
    const contentWidth = tickerTrack.scrollWidth;
    return Math.max(0, contentWidth - availableWidth + 80);
  };

  const travelDistance = getTravelDistance();
  if (travelDistance <= 0) {
    return;
  }

  window.gsap.to(tickerTrack, {
    x: () => -getTravelDistance(),
    ease: "none",
    scrollTrigger: {
      id: "civic-ticker",
      trigger: tickerSection,
      start: "top top",
      end: () => `+=${getTravelDistance() + window.innerHeight * 0.45}`,
      pin: tickerStage,
      scrub: 1,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });
}

function setupGooeyInteractions() {
  const gooeySurfaces = document.querySelectorAll("[data-gooey]");

  gooeySurfaces.forEach((surface) => {
    if (surface.dataset.gooeyBound === "true") {
      return;
    }

    const interactiveBlob = surface.querySelector(".gooey-interactive");
    const eventSurface = surface.parentElement || surface;
    if (!interactiveBlob) {
      return;
    }

    let currentX = 0;
    let currentY = 0;
    let targetX = 0;
    let targetY = 0;
    let frameId = null;

    function setTargetToCenter() {
      targetX = eventSurface.clientWidth / 2;
      targetY = eventSurface.clientHeight / 2;
    }

    function updateTargetFromPointer(event) {
      const rect = eventSurface.getBoundingClientRect();
      targetX = event.clientX - rect.left;
      targetY = event.clientY - rect.top;
    }

    function animateBlob() {
      currentX += (targetX - currentX) / 18;
      currentY += (targetY - currentY) / 18;
      interactiveBlob.style.transform = `translate(${Math.round(currentX - eventSurface.clientWidth / 2)}px, ${Math.round(currentY - eventSurface.clientHeight / 2)}px)`;
      frameId = window.requestAnimationFrame(animateBlob);
    }

    setTargetToCenter();
    currentX = targetX;
    currentY = targetY;

    eventSurface.addEventListener("pointermove", updateTargetFromPointer);
    eventSurface.addEventListener("pointerleave", setTargetToCenter);
    window.addEventListener("resize", setTargetToCenter);

    frameId = window.requestAnimationFrame(animateBlob);

    surface.dataset.gooeyBound = "true";
  });
}

function renderPermissions(permissions = []) {
  authPermissions.innerHTML = permissions
    .map((permission) => {
      const meta = permissionMeta[permission];
      return `<button type="button" class="permission-pill permission-action" data-permission="${permission}">${
        meta?.label || permission.replace(/_/g, " ")
      }</button>`;
    })
    .join("");

  authPermissions.querySelectorAll(".permission-action").forEach((button) => {
    button.addEventListener("click", () => {
      const permission = button.dataset.permission;
      const meta = permissionMeta[permission];

      if (!meta) {
        return;
      }

      if (meta.action) {
        meta.action();
        return;
      }

      scrollToWorkspace(meta.target?.(), `${meta.label} opened.`);
    });
  });
}

function applyPermissionState() {
  const permissions = authState?.permissions || [];
  const hasToken = Boolean(authState?.token);

  authRole.textContent = hasToken ? authState.role : "No role authenticated";
  authTokenState.textContent = hasToken ? "JWT session active" : "Press login to continue as Citizen or Admin";
  activeUsername.textContent = hasToken ? authState.username : "No username logged in";
  renderPermissions(permissions);
  complaintSubmitBtn.disabled = !permissions.includes("submit_complaint");
  resetDashboardBtn.disabled = !permissions.includes("reset_dashboard");
  adminActionCenter.innerHTML = permissions
    .filter((permission) => permissionMeta[permission])
    .map(
      (permission) =>
        `<button type="button" class="secondary-button admin-action-btn" data-permission="${permission}">${
          permissionMeta[permission].label
        }</button>`
    )
    .join("");

  adminActionCenter.querySelectorAll(".admin-action-btn").forEach((button) => {
    button.addEventListener("click", () => {
      const permission = button.dataset.permission;
      const meta = permissionMeta[permission];
      if (!meta) return;
      if (meta.action) {
        meta.action();
        return;
      }
      scrollToWorkspace(meta.target?.(), `${meta.label} opened.`);
    });
  });

  if (!permissions.includes("delete_users")) {
    userManagementList.innerHTML = `<div class="table-row"><span>Login as Admin to manage accounts.</span></div>`;
  }

  if (!permissions.includes("manage_alerts")) {
    alertsList.innerHTML = `<div class="table-row"><span>Login as Admin to manage alerts.</span></div>`;
  }

}

function getAuthSuccessMessage(mode, data) {
  if (mode === "register") {
    return `Registration successful. ${data.username} is now logged in as ${data.role}.`;
  }

  return `Login successful. ${data.username} is now logged in as ${data.role}.`;
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toLocaleString() : date.toLocaleString();
}

function buildGoogleMapsUrl(location, mapLocation) {
  if (location && String(location).trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
  }

  if (mapLocation?.lat && mapLocation?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${mapLocation.lat},${mapLocation.lng}`;
  }

  return "https://www.google.com/maps";
}

function buildGoogleMapsEmbedUrl(location, mapLocation) {
  if (location && String(location).trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(location.trim())}&output=embed`;
  }

  if (mapLocation?.lat && mapLocation?.lng) {
    return `https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&output=embed`;
  }

  return "";
}

function setPdfButtonState(enabled) {
  generatePdfBtn.disabled = !enabled;
  emailBbmpBtn.disabled = !enabled;
}

function setEmailProgress(value, label) {
  const safeValue = Math.max(0, Math.min(100, Math.round(value)));
  emailProgress.hidden = false;
  emailProgressFill.style.width = `${safeValue}%`;
  emailProgressValue.textContent = `${safeValue}%`;
  if (label) {
    emailProgressLabel.textContent = label;
  }
}

function clearEmailProgressTimer() {
  if (emailProgressTimer) {
    window.clearInterval(emailProgressTimer);
    emailProgressTimer = null;
  }
}

function beginEmailProgress() {
  clearEmailProgressTimer();
  setEmailProgress(6, "Preparing complaint report...");
  emailProgressTimer = window.setInterval(() => {
    const current = Number.parseInt(emailProgressFill.style.width, 10) || 0;
    if (current >= 90) {
      clearEmailProgressTimer();
      return;
    }

    let nextValue = current + (current < 36 ? 7 : current < 68 ? 4 : 2);
    let nextLabel = "Preparing complaint report...";

    if (nextValue >= 28 && nextValue < 56) {
      nextLabel = "Generating formal PDF attachment...";
    } else if (nextValue >= 56 && nextValue < 82) {
      nextLabel = "Encoding report for BBMP delivery...";
    } else if (nextValue >= 82) {
      nextLabel = "Contacting BBMP mail server...";
    }

    setEmailProgress(nextValue, nextLabel);
  }, 280);
}

function finishEmailProgress(success = true) {
  clearEmailProgressTimer();
  setEmailProgress(100, success ? "Complaint email sent successfully." : "Complaint email could not be sent.");
  window.setTimeout(() => {
    emailProgress.hidden = true;
    emailProgressFill.style.width = "0%";
    emailProgressValue.textContent = "0%";
    emailProgressLabel.textContent = "Preparing complaint email...";
  }, success ? 2200 : 2600);
}

function updateLiveLocationMap(location, mapQuery = location) {
  const trimmedLocation = (location || "").trim();
  const trimmedMapQuery = (mapQuery || "").trim();

  if (!trimmedLocation || !trimmedMapQuery) {
    locationMapFrame.hidden = true;
    locationMapFrame.removeAttribute("src");
    liveLocationStatus.textContent = "Type a location in Report an Issue to preview it here.";
    return;
  }

  locationMapFrame.hidden = false;
  locationMapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(trimmedMapQuery)}&output=embed`;
  liveLocationStatus.textContent = `Showing map preview for ${trimmedLocation}.`;
}

function formatReverseGeocodedLocation(data, latitude, longitude) {
  const address = data?.address || {};
  const orderedParts = [
    address.road,
    address.neighbourhood,
    address.suburb,
    address.city_district,
    address.village,
    address.town,
    address.city,
    address.county,
    address.state
  ].filter(Boolean);

  const uniqueParts = [...new Set(orderedParts)];
  if (uniqueParts.length) {
    return uniqueParts.slice(0, 4).join(", ");
  }

  if (typeof data?.display_name === "string" && data.display_name.trim()) {
    return data.display_name
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .slice(0, 4)
      .join(", ");
  }

  return `Current location near ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
}

async function reverseGeocodeLiveLocation(latitude, longitude) {
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(latitude)}&lon=${encodeURIComponent(longitude)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/json"
    }
  });

  if (!response.ok) {
    throw new Error("Unable to translate live location into a readable place.");
  }

  const data = await response.json();
  return formatReverseGeocodedLocation(data, latitude, longitude);
}

function updateLiveLocationMapFromCoordinates(latitude, longitude) {
  const formatted = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
  locationMapFrame.hidden = false;
  locationMapFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(formatted)}&output=embed`;
  liveLocationStatus.textContent = `Showing live location preview for ${formatted}.`;
}

function showTypedLocationOnMap() {
  const location = reportLocationInput.value.trim();

  updateLiveLocationMap(location);
  if (!location) {
    return;
  }

  mapWorkspace.scrollIntoView({ behavior: "smooth", block: "start" });
}

function useLiveLocation() {
  if (!navigator.geolocation) {
    setDashboardMessage("Live location is not supported in this browser.", "error");
    return;
  }

  useLiveLocationBtn.disabled = true;
  setDashboardMessage("Fetching live location...", "info");

  navigator.geolocation.getCurrentPosition(
    async (position) => {
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;
      let readableLocation = "";

      try {
        readableLocation = await reverseGeocodeLiveLocation(latitude, longitude);
      } catch (error) {
        readableLocation = "Current location";
      }

      reportLocationInput.value = readableLocation;
      updateLiveLocationMap(readableLocation, `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      setDashboardMessage("Live location added to the report form.", "success");
      useLiveLocationBtn.disabled = false;
    },
    (error) => {
      const message =
        error.code === error.PERMISSION_DENIED
          ? "Location permission was denied. Allow location access and try again."
          : error.code === error.POSITION_UNAVAILABLE
            ? "Live location is unavailable right now."
            : error.code === error.TIMEOUT
              ? "Live location request timed out. Try again."
              : "Unable to fetch live location.";

      setDashboardMessage(message, "error");
      useLiveLocationBtn.disabled = false;
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000
    }
  );
}

function describeImageFromFeatures(features) {
  if (!features) {
    return {
      description: "Upload an image to let AI inspect the issue.",
      accuracy: 0
    };
  }

  const candidates = [
    {
      label: "Possible fire, smoke, gas leak, or burn-risk area",
      score: features.redHeatRatio * 0.42 + features.smokeLikeRatio * 0.3 + features.hotspotRatio * 0.22 + features.darkRatio * 0.06
    },
    {
      label: "Likely road damage, pothole, or cracked surface",
      score:
        Math.max(
          0,
          features.edgeDensity * 0.42 +
            features.contrast * 0.22 +
            features.darkRatio * 0.18 +
            (1 - features.averageBrightness) * 0.12 -
            features.greenRatio * 0.16
        )
    },
    {
      label: "Likely fallen tree, branch, or vegetation blocking the road",
      score:
        features.greenRatio * 0.58 +
        features.averageSaturation * 0.12 +
        features.edgeDensity * 0.16 +
        features.contrast * 0.12 +
        (1 - features.blueRatio) * 0.08 +
        (1 - features.neutralRatio) * 0.04
    },
    {
      label: "Likely garbage, waste overflow, or clutter accumulation",
      score:
        Math.max(
          0,
          features.edgeDensity * 0.22 +
            features.averageSaturation * 0.2 +
            features.contrast * 0.16 +
            features.darkRatio * 0.12 +
            features.neutralRatio * 0.08 +
            (1 - features.blueRatio) * 0.06 -
            features.greenRatio * 0.24
        )
    },
    {
      label: "Likely sewage overflow, dirty drain water, or open manhole issue",
      score:
        features.neutralRatio * 0.28 +
        features.darkRatio * 0.24 +
        features.contrast * 0.14 +
        (1 - features.blueRatio) * 0.16 +
        (1 - features.averageBrightness) * 0.08
    },
    {
      label: "Likely waterlogging, drainage overflow, or wet surface",
      score: features.blueRatio * 0.42 + features.neutralRatio * 0.2 + (1 - features.averageSaturation) * 0.18 + features.averageBrightness * 0.08
    },
    {
      label: "Likely water leakage, pipe seepage, or burst-line issue",
      score: features.blueRatio * 0.3 + features.neutralRatio * 0.18 + features.averageBrightness * 0.18 + features.edgeDensity * 0.08
    },
    {
      label: "Likely wall crack, ceiling damage, or structural surface issue",
      score:
        features.edgeDensity * 0.26 +
        features.contrast * 0.18 +
        features.neutralRatio * 0.16 +
        (1 - features.averageSaturation) * 0.1 +
        features.darkRatio * 0.08
    },
    {
      label: "Likely streetlight, wire, pole, or electrical public asset issue",
      score: features.edgeDensity * 0.16 + features.hotspotRatio * 0.16 + features.averageBrightness * 0.14 + (1 - features.greenRatio) * 0.1
    },
    {
      label: "Possible vehicle obstruction or access blocked by parking",
      score: features.edgeDensity * 0.14 + features.contrast * 0.14 + features.neutralRatio * 0.16 + (1 - features.greenRatio) * 0.08
    },
    {
      label: "General civic anomaly detected in the uploaded image",
      score: features.edgeDensity * 0.18 + features.averageSaturation * 0.12 + features.darkRatio * 0.08
    }
  ].sort((left, right) => right.score - left.score);

  const best = candidates[0];
  const second = candidates[1];
  const accuracy = Math.max(58, Math.min(97, Math.round(57 + best.score * 38 + (best.score - second.score) * 32)));

  return {
    description: best.label,
    accuracy
  };
}

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        ...(options.headers || {})
      }
    });
  } catch (_error) {
    throw new Error("Unable to reach the server. Make sure the app is running and refresh the page.");
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMessage = data.error || "Request failed";
    const isAuthFailure =
      response.status === 401 ||
      response.status === 403 ||
      /jwt|token|bearer|permission denied/i.test(errorMessage);

    if (isAuthFailure && authState?.token) {
      clearAuthState("Your previous session is no longer valid. Please login again.");
    }

    throw new Error(errorMessage);
  }

  return data;
}

function renderRecentComplaints(complaints) {
  const recentMarkup = complaints
    .slice(0, 3)
    .map(
      (complaint) => `
        <div class="mini-item">
          <div>
            <strong>${escapeHtml(complaint.type)}</strong>
            <span>${escapeHtml(complaint.location)}</span>
          </div>
          <span class="mini-chevron">›</span>
        </div>
      `
    )
    .join("");

  document.getElementById("recentComplaints").innerHTML =
    recentMarkup || `<div class="table-row empty-state"><span>No recent complaints. Report an issue to get started.</span></div>`;
}

function renderMetrics(metrics) {
  document.getElementById("totalComplaints").textContent = metrics.totalComplaints;
  document.getElementById("openComplaints").textContent = metrics.openComplaints;
  document.getElementById("resolvedCount").textContent = Math.max(0, metrics.totalComplaints - metrics.openComplaints);
}

function formatTokenLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function severityBadge(priority) {
  const label = priority || "Low";
  return `<span class="info-chip severity-chip severity-${formatTokenLabel(label)}">${escapeHtml(label)}</span>`;
}

function authorityBadge(authority) {
  const label = authority || "Gram Panchayat";
  return `<span class="info-chip authority-chip authority-${formatTokenLabel(label)}">${escapeHtml(label)}</span>`;
}

function renderAnalysis(result) {
  setDashboardMessage(
    `Complaint logged with ${result.priority.level} severity and routed to ${result.assignedAuthority}. Detected issue: ${result.nlp?.issueType || result.cv.detected}.`,
    "success"
  );
}

function buildSubmittedReport(payload, result) {
  return {
    complaintId: result.complaintId || "Pending",
    submittedAt: new Date().toISOString(),
    reporter: authState?.username || "Citizen",
    role: authState?.role || "Citizen",
    location: payload.location || "Unknown",
    textComplaint: payload.textComplaint || "No complaint text provided.",
    aiDescription: payload.imageHint || "No AI description generated.",
    uploadedPhoto: currentImageDataUrl,
    googleMapsUrl: buildGoogleMapsUrl(payload.location, result.mapLocation),
    googleMapsEmbedUrl: buildGoogleMapsEmbedUrl(payload.location, result.mapLocation),
    issueType: result.nlp?.issueType || "Civic Complaint",
    category: result.nlp?.category || "General",
    priority: result.priority?.level || "Low",
    assignedAuthority: result.assignedAuthority || "Gram Panchayat",
    status: result.status || "Queued",
    detection: result.cv?.detected || "No image analysis available",
    cvReason: result.cv?.reason || "Local AI matched the uploaded issue against known civic patterns.",
    notifications: Array.isArray(result.notifications) ? result.notifications : [],
    alerts: Array.isArray(result.alerts) ? result.alerts : [],
    mapLocation: result.mapLocation || null
  };
}

function buildPdfFilename(report) {
  const safeId = String(report.complaintId || "report").replace(/[^a-z0-9_-]+/gi, "-");
  return `complaint-report-${safeId}.pdf`;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = String(reader.result || "");
      const commaIndex = result.indexOf(",");
      resolve(commaIndex >= 0 ? result.slice(commaIndex + 1) : result);
    };
    reader.onerror = () => reject(new Error("Unable to prepare the generated PDF for email."));
    reader.readAsDataURL(blob);
  });
}

function getJsPdfConstructor() {
  const jsPdfConstructor = window.jspdf?.jsPDF;
  if (!jsPdfConstructor) {
    throw new Error("PDF generator is unavailable. Refresh the page and try again.");
  }
  return jsPdfConstructor;
}

async function generatePdfReport(report, options = {}) {
  if (!report) {
    throw new Error("Submit a complaint first to generate the PDF report.");
  }

  const jsPDF = getJsPdfConstructor();
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;
  const lineColor = [120, 136, 153];
  const textColor = [27, 41, 57];
  const headingColor = [25, 55, 96];
  let cursorY = 14;

  const ensureSpace = (requiredHeight) => {
    if (cursorY + requiredHeight > pageHeight - 18) {
      doc.addPage();
      cursorY = 16;
    }
  };

  const drawSectionTitle = (title) => {
    ensureSpace(12);
    doc.setFillColor(237, 243, 249);
    doc.setDrawColor(...lineColor);
    doc.rect(margin, cursorY, contentWidth, 8, "FD");
    doc.setFont("times", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...headingColor);
    doc.text(title, margin + 3, cursorY + 5.5);
    cursorY += 11;
  };

  const drawRow = (label, value) => {
    const labelWidth = 42;
    const valueLines = doc.splitTextToSize(String(value || "-"), contentWidth - labelWidth - 6);
    const rowHeight = Math.max(8, valueLines.length * 5 + 3);
    ensureSpace(rowHeight);
    doc.setDrawColor(...lineColor);
    doc.rect(margin, cursorY, labelWidth, rowHeight);
    doc.rect(margin + labelWidth, cursorY, contentWidth - labelWidth, rowHeight);
    doc.setFont("times", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...headingColor);
    doc.text(label, margin + 2, cursorY + 5);
    doc.setFont("times", "normal");
    doc.setTextColor(...textColor);
    doc.text(valueLines, margin + labelWidth + 3, cursorY + 5);
    cursorY += rowHeight;
  };

  const drawParagraphBox = (text, minHeight = 28) => {
    const lines = doc.splitTextToSize(String(text || "-"), contentWidth - 8);
    const boxHeight = Math.max(minHeight, lines.length * 5 + 8);
    ensureSpace(boxHeight);
    doc.setDrawColor(...lineColor);
    doc.rect(margin, cursorY, contentWidth, boxHeight);
    doc.setFont("times", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(...textColor);
    doc.text(lines, margin + 4, cursorY + 6);
    cursorY += boxHeight + 3;
  };

  const drawBulletsBox = (items) => {
    const safeItems = items.length ? items : ["No entries recorded."];
    const lines = safeItems.flatMap((item) => [`• ${item}`]);
    const normalizedLines = safeItems.map((item) => `- ${item}`);
    const wrapped = normalizedLines.flatMap((line) => doc.splitTextToSize(line, contentWidth - 10));
    const boxHeight = Math.max(22, wrapped.length * 5 + 8);
    ensureSpace(boxHeight);
    doc.setDrawColor(...lineColor);
    doc.rect(margin, cursorY, contentWidth, boxHeight);
    doc.setFont("times", "normal");
    doc.setFontSize(10.3);
    doc.setTextColor(...textColor);
    doc.text(wrapped, margin + 4, cursorY + 6);
    cursorY += boxHeight + 3;
  };

  doc.setDrawColor(50, 76, 114);
  doc.setLineWidth(0.5);
  doc.rect(margin - 2, cursorY - 2, contentWidth + 4, pageHeight - 28, "S");
  doc.setFont("times", "normal");
  doc.setTextColor(88, 101, 116);
  doc.setFontSize(10);
  doc.text("Citizen Grievance Submission Copy", pageWidth / 2, cursorY + 3, { align: "center" });
  doc.setFont("times", "bold");
  doc.setTextColor(...headingColor);
  doc.setFontSize(16);
  doc.text("FORMAL COMPLAINT REPORT", pageWidth / 2, cursorY + 10, { align: "center" });
  doc.setFont("times", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...textColor);
  doc.text("AI Powered Smart Community Problem Detection System", pageWidth / 2, cursorY + 16, { align: "center" });
  doc.text(`Prepared for submission to ${report.assignedAuthority === "Municipality" ? "Municipal Complaint Cell" : "Gram Panchayat Complaint Cell"} / ${report.assignedAuthority}`, pageWidth / 2, cursorY + 21, { align: "center" });
  doc.line(margin, cursorY + 25, pageWidth - margin, cursorY + 25);
  cursorY += 30;

  drawSectionTitle("1. Reference Details");
  drawRow("Complaint ID", report.complaintId);
  drawRow("Date and Time", formatDateTime(report.submittedAt));
  drawRow("Reported By", report.reporter);
  drawRow("User Role", report.role);
  drawRow("Routed Authority", report.assignedAuthority);
  drawRow("Complaint Status", report.status);

  drawSectionTitle("2. Complaint Particulars");
  drawRow("Issue Type", report.issueType);
  drawRow("Issue Category", report.category);
  drawRow("Severity Level", report.priority);
  drawRow("Location", report.location);

  drawSectionTitle("3. Complaint Narrative");
  drawParagraphBox(report.textComplaint, 34);

  drawSectionTitle("4. AI Assessment and Technical Summary");
  drawRow("AI Description", report.aiDescription);
  drawRow("Detected Pattern", report.detection);
  drawRow("AI Reasoning", report.cvReason);

  drawSectionTitle("5. Evidence and Location Reference");
  ensureSpace(95);
  const leftX = margin;
  const rightX = margin + contentWidth / 2 + 3;
  const panelWidth = contentWidth / 2 - 3;
  const panelTop = cursorY;
  const panelHeight = 88;

  doc.setDrawColor(...lineColor);
  doc.rect(leftX, panelTop, panelWidth, panelHeight);
  doc.rect(rightX, panelTop, panelWidth, panelHeight);
  doc.setFont("times", "bold");
  doc.setFontSize(11);
  doc.setTextColor(...headingColor);
  doc.text("Uploaded Photo", leftX + 3, panelTop + 6);
  doc.text("Google Maps Reference", rightX + 3, panelTop + 6);

  if (report.uploadedPhoto) {
    try {
      const imageFormat = report.uploadedPhoto.includes("image/png") ? "PNG" : "JPEG";
      doc.addImage(report.uploadedPhoto, imageFormat, leftX + 3, panelTop + 10, panelWidth - 6, 58, undefined, "FAST");
    } catch (_error) {
      doc.setFont("times", "normal");
      doc.setTextColor(...textColor);
      doc.text("Uploaded image could not be embedded in the PDF.", leftX + 3, panelTop + 20);
    }
  } else {
    doc.setFont("times", "normal");
    doc.setTextColor(...textColor);
    doc.text("No image was uploaded for this complaint.", leftX + 3, panelTop + 20);
  }

  doc.setFont("times", "normal");
  doc.setTextColor(...textColor);
  const mapIntro = doc.splitTextToSize("Click the following link to open the complaint location in Google Maps:", panelWidth - 6);
  doc.text(mapIntro, rightX + 3, panelTop + 14);
  const linkLines = doc.splitTextToSize(report.googleMapsUrl, panelWidth - 8);
  let linkY = panelTop + 14 + mapIntro.length * 4.6 + 5;
  doc.setTextColor(25, 74, 155);
  linkLines.forEach((line, index) => {
    doc.text(line, rightX + 3, linkY + index * 5);
  });
  doc.link(rightX + 2, linkY - 4, panelWidth - 4, linkLines.length * 5 + 4, { url: report.googleMapsUrl });
  doc.setTextColor(...textColor);
  cursorY += panelHeight + 4;

  drawSectionTitle("6. Alerts and Notifications");
  drawRow("System Alerts", "");
  cursorY -= 8;
  drawBulletsBox(report.alerts);
  drawRow("Notifications Issued", "");
  cursorY -= 8;
  drawBulletsBox(report.notifications);

  ensureSpace(18);
  doc.setDrawColor(...lineColor);
  doc.line(margin, cursorY + 2, pageWidth - margin, cursorY + 2);
  doc.setFont("times", "italic");
  doc.setFontSize(9.5);
  doc.setTextColor(88, 101, 116);
  doc.text(
    "This complaint report has been generated automatically from citizen-submitted inputs for formal escalation and record-keeping.",
    margin,
    cursorY + 8
  );

  const filename = buildPdfFilename(report);
  const blob = doc.output("blob");

  if (options.download !== false) {
    doc.save(filename);
  }

  return { blob, filename };
}

function renderComplaints(complaints) {
  const container = document.getElementById("complaintsList");
  const canUpdateStatus = authState?.permissions?.includes("update_complaint_status");

  if (!complaints.length) {
    container.innerHTML = `<div class="table-row empty-state"><span>No complaints found. The dashboard is currently clear.</span></div>`;
    return;
  }

  container.innerHTML = complaints
    .map(
      (complaint) => `
        <article class="issue-card">
          <div class="issue-card-head">
            <strong>${escapeHtml(complaint.type)}</strong>
            <span class="status-pill" data-status="${escapeHtml(complaint.status)}">${escapeHtml(complaint.status)}</span>
          </div>
          <p>${escapeHtml(complaint.location)}</p>
          <div class="issue-meta">
            ${severityBadge(complaint.priority)}
            ${authorityBadge(complaint.assignedAuthority)}
          </div>
          ${
            canUpdateStatus
              ? `
            <div class="status-actions">
              <select class="status-select" data-complaint-id="${complaint._id}">
                <option value="Queued" ${complaint.status === "Queued" ? "selected" : ""}>Pending</option>
                <option value="In Progress" ${complaint.status === "In Progress" ? "selected" : ""}>In Progress</option>
                <option value="Resolved" ${complaint.status === "Resolved" ? "selected" : ""}>Resolved</option>
                <option value="Escalated" ${complaint.status === "Escalated" ? "selected" : ""}>Escalated</option>
              </select>
              <button type="button" class="secondary-button update-status-btn" data-complaint-id="${complaint._id}">Save</button>
            </div>
          `
              : ""
          }
        </article>
      `
    )
    .join("");

  if (canUpdateStatus) {
    container.querySelectorAll(".update-status-btn").forEach((button) => {
      button.addEventListener("click", async () => {
        const complaintId = button.dataset.complaintId;
        const select = container.querySelector(`.status-select[data-complaint-id="${complaintId}"]`);

        try {
          await apiRequest(`/api/complaints/${complaintId}/status`, {
            method: "PATCH",
            body: JSON.stringify({
              status: select.value,
              alertNote: `Status updated to ${select.value} by ${authState.username}`
            })
          });
          setDashboardMessage(`Complaint status updated to ${select.value}.`, "success");
          await loadDashboard();
        } catch (error) {
          setDashboardMessage(error.message, "error");
        }
      });
    });
  }
}

function renderAdminTable(complaints) {
  const adminMarkup = complaints
    .slice(0, 4)
    .map(
      (complaint) => `
        <div class="table-row">
          <div>
            <strong>${escapeHtml(complaint.location)}</strong>
            <span>${escapeHtml(complaint.type)}</span>
          </div>
          <div>
            <strong>${escapeHtml(complaint.assignedAuthority || "Gram Panchayat")}</strong>
            <span>${escapeHtml(complaint.status)}</span>
          </div>
        </div>
      `
    )
    .join("");

  document.getElementById("adminTable").innerHTML =
    adminMarkup || `<div class="table-row empty-state"><span>No complaints are currently in the admin queue.</span></div>`;
}

function renderAlerts(complaints = []) {
  const canManageAlerts = authState?.permissions?.includes("manage_alerts");

  if (!canManageAlerts) {
    alertsList.innerHTML = `<div class="table-row"><span>Login as Admin to manage alerts.</span></div>`;
    return;
  }

  const alertEntries = complaints
    .filter((complaint) => Array.isArray(complaint.alerts) && complaint.alerts.length)
    .flatMap((complaint) =>
      complaint.alerts.slice(-2).map((alertText) => ({
        id: complaint._id,
        type: complaint.type,
        location: complaint.location,
        text: alertText
      }))
    );

  if (!alertEntries.length) {
    alertsList.innerHTML = `<div class="table-row empty-state"><span>No active alerts need attention.</span></div>`;
    return;
  }

  alertsList.innerHTML = alertEntries
    .map(
      (alert) => `
        <article class="table-row">
          <div>
            <strong>${escapeHtml(alert.type)}</strong>
            <span>${escapeHtml(alert.location)}</span>
            <span>${escapeHtml(alert.text)}</span>
          </div>
          <button type="button" class="secondary-button acknowledge-alert-btn" data-complaint-id="${alert.id}">Acknowledge</button>
        </article>
      `
    )
    .join("");

  alertsList.querySelectorAll(".acknowledge-alert-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      try {
        button.disabled = true;
        await apiRequest(`/api/complaints/${button.dataset.complaintId}/alerts/acknowledge`, {
          method: "POST",
          body: JSON.stringify({})
        });
        setDashboardMessage("Alert acknowledged successfully.", "success");
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });
}

function renderUserManagement(users = []) {
  const canDeleteUsers = authState?.permissions?.includes("delete_users");

  if (!canDeleteUsers) {
    userManagementList.innerHTML = `<div class="table-row"><span>Login as Admin to manage accounts.</span></div>`;
    return;
  }

  if (!users.length) {
    userManagementList.innerHTML = `<div class="table-row"><span>No accounts found.</span></div>`;
    return;
  }

  userManagementList.innerHTML = users
    .map(
      (user) => `
        <article class="table-row user-row">
          <div>
            <strong>${escapeHtml(user.username)}</strong>
            <span>${escapeHtml(user.role)}</span>
          </div>
          <button
            type="button"
            class="danger-button delete-user-btn"
            data-user-id="${user._id}"
            data-username="${user.username}"
            data-role="${user.role}"
          >
            Delete ${user.role}
          </button>
        </article>
      `
    )
    .join("");

  userManagementList.querySelectorAll(".delete-user-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const { userId, username, role } = button.dataset;
      const confirmed = window.confirm(`Delete ${role} account "${username}"?`);

      if (!confirmed) {
        return;
      }

      try {
        button.disabled = true;
        const result = await apiRequest(`/api/users/${userId}`, {
          method: "DELETE"
        });

        if (result.deletedCurrentSession) {
          authState = null;
          lastSubmittedReport = null;
          saveAuthState();
          applyPermissionState();
          resetComposer();
          setPdfButtonState(false);
          setDashboardMessage("Current admin account deleted. Please login again.", "success");
        } else {
          setDashboardMessage(result.message, "success");
        }

        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });
}

function markerColor(status) {
  if (status === "Resolved") return "#49d98f";
  if (status === "In Progress") return "#ffb84d";
  return "#ff6b7a";
}

function renderMap(_complaints) {
  return;
}

function updateVoiceTranscriptValue(finalText, interimText = "") {
  voiceTranscriptInput.value = [finalText.trim(), interimText.trim()].filter(Boolean).join(" ").trim();
}

async function getMicrophonePermissionState() {
  if (!navigator.permissions?.query) {
    return "unknown";
  }

  try {
    const result = await navigator.permissions.query({ name: "microphone" });
    return result.state || "unknown";
  } catch (_error) {
    return "unknown";
  }
}

function isBraveBrowser() {
  return Boolean(navigator.brave);
}

async function verifyMicrophoneAccess() {
  if (!navigator.mediaDevices?.getUserMedia) {
    lastMicrophoneAccessState = "unknown";
    return "unknown";
  }

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach((track) => track.stop());
    lastMicrophoneAccessState = "granted";
    return "granted";
  } catch (error) {
    if (error?.name === "NotAllowedError" || error?.name === "PermissionDeniedError") {
      lastMicrophoneAccessState = "denied";
      return "denied";
    }

    lastMicrophoneAccessState = "unavailable";
    return "unavailable";
  }
}

async function runMicrophoneDiagnostic() {
  testMicrophoneBtn.disabled = true;

  try {
    if (!navigator.mediaDevices?.getUserMedia) {
      setDashboardMessage("This browser does not support direct microphone capture testing.", "error");
      return;
    }

    setDashboardMessage("Testing microphone access...", "info");
    const microphoneState = await verifyMicrophoneAccess();

    if (microphoneState === "granted") {
      setDashboardMessage("Microphone test passed. Raw microphone capture is available for this page.", "success");
      return;
    }

    if (microphoneState === "denied") {
      setDashboardMessage(
        "Microphone test failed. Access is blocked for this page or by Windows privacy settings.",
        "error"
      );
      return;
    }

    setDashboardMessage(
      "Microphone test could not find a working input device. Check the selected microphone in Windows sound settings.",
      "error"
    );
  } catch (_error) {
    setDashboardMessage("Microphone test could not complete. Check browser and system microphone settings.", "error");
  } finally {
    testMicrophoneBtn.disabled = false;
  }
}

function clearVoiceAudioSelection() {
  if (currentVoiceAudioObjectUrl) {
    URL.revokeObjectURL(currentVoiceAudioObjectUrl);
    currentVoiceAudioObjectUrl = null;
  }

  currentVoiceAudioData = null;
  voiceAudioPreview.hidden = true;
  voiceAudioPreview.removeAttribute("src");
  voiceAudioMeta.textContent = "No audio file selected.";
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to prepare the uploaded file."));
    reader.readAsDataURL(file);
  });
}

async function setupVoiceAudioFile() {
  const file = voiceAudioFileInput.files?.[0];
  const existingTranscript = voiceTranscriptInput.value.trim();
  clearVoiceAudioSelection();
  updateVoiceTranscriptValue(existingTranscript);

  if (!file) {
    if (transcribeAudioBtn) {
      transcribeAudioBtn.disabled = true;
    }
    voiceTranscriptStatus.textContent = existingTranscript
      ? "Audio removed. You can still submit the typed voice complaint summary."
      : "Upload an audio file and type the complaint summary manually.";
    return;
  }

  currentVoiceAudioObjectUrl = URL.createObjectURL(file);
  voiceAudioPreview.src = currentVoiceAudioObjectUrl;
  voiceAudioPreview.hidden = false;
  voiceAudioMeta.textContent = `${file.name} - ${file.type || "audio"} - ${Math.max(1, Math.round(file.size / 1024))} KB`;
  currentVoiceAudioData = {
    filename: file.name,
    mimeType: file.type || "application/octet-stream",
    dataUrl: await readFileAsDataUrl(file)
  };
  if (transcribeAudioBtn) {
    transcribeAudioBtn.disabled = false;
  }
  voiceTranscriptStatus.textContent = existingTranscript
    ? "Audio file attached. Review your typed summary and submit the complaint."
    : "Audio file ready. Click Transcribe Audio or type the complaint summary manually.";
}

async function transcribeUploadedAudio() {
  const file = voiceAudioFileInput.files?.[0];
  if (!file) {
    voiceTranscriptStatus.textContent = "Upload an audio file before requesting transcription.";
    return;
  }

  if (!window.browserAudioTranscriber?.transcribeAudioFile) {
    voiceTranscriptStatus.textContent =
      "Browser transcription is unavailable here. Type the complaint summary manually.";
    return;
  }

  transcribeAudioBtn.disabled = true;

  try {
    const result = await window.browserAudioTranscriber.transcribeAudioFile(file, (statusText) => {
      voiceTranscriptStatus.textContent = statusText;
    });

    if (!result.text) {
      voiceTranscriptStatus.textContent =
        "No transcript text was produced. Type the complaint summary manually.";
      return;
    }

    updateVoiceTranscriptValue(result.text);
    voiceTranscriptStatus.textContent =
      "Audio transcribed in the browser. Review the text before submitting.";
  } catch (error) {
    voiceTranscriptStatus.textContent =
      error?.message || "Audio transcription failed in the browser. Type the complaint summary manually.";
  } finally {
    transcribeAudioBtn.disabled = !voiceAudioFileInput.files?.[0];
  }
}

function setComplaintInputMode(mode) {
  const isVoiceMode = mode === "voice";

  typedComplaintField.hidden = isVoiceMode;
  typedComplaintField.style.display = isVoiceMode ? "none" : "";
  typedComplaintInput.disabled = isVoiceMode;
  voiceComplaintField.hidden = !isVoiceMode;
  voiceComplaintField.style.display = isVoiceMode ? "" : "none";
  voiceTranscriptInput.disabled = !isVoiceMode;

  if (isVoiceMode) {
    if (transcribeAudioBtn) {
      transcribeAudioBtn.disabled = !currentVoiceAudioData?.dataUrl;
    }
    if (!voiceTranscriptInput.value.trim()) {
      voiceTranscriptStatus.textContent = currentVoiceAudioData?.dataUrl
        ? "Audio file attached. Click Transcribe Audio or type the complaint summary manually."
        : "Upload an audio file and type the complaint summary manually.";
    } else {
      voiceTranscriptStatus.textContent = currentVoiceAudioData?.dataUrl
        ? "Audio file attached. Review your typed summary and submit the complaint."
        : "Typed voice complaint summary ready. You can submit now or attach the original audio.";
    }
    return;
  }

  voiceTranscriptStatus.textContent = "Select Voice transcript to upload an audio file and type the complaint summary manually.";
}

function getComplaintTextPayload() {
  const mode = complaintInputMode.value;
  const complaintText = mode === "voice" ? voiceTranscriptInput.value.trim() : typedComplaintInput.value.trim();

  if (!complaintText) {
    throw new Error(
      mode === "voice"
        ? "Type the voice complaint summary before submitting."
        : "Enter the complaint text before submitting."
    );
  }

  return {
    complaintInputMode: mode,
    complaintText
  };
}

function setupComplaintInputMode() {
  complaintInputMode.addEventListener("change", (event) => {
    setComplaintInputMode(event.target.value);
  });

  voiceAudioFileInput.addEventListener("change", () => {
    setupVoiceAudioFile().catch((error) => {
      clearVoiceAudioSelection();
      if (transcribeAudioBtn) {
        transcribeAudioBtn.disabled = true;
      }
      voiceTranscriptStatus.textContent = error.message;
    });
  });
  transcribeAudioBtn?.addEventListener("click", transcribeUploadedAudio);
  voiceTranscriptInput.addEventListener("input", () => {
    if (complaintInputMode.value !== "voice") {
      return;
    }

    const hasTranscript = Boolean(voiceTranscriptInput.value.trim());
    voiceTranscriptStatus.textContent = hasTranscript
      ? currentVoiceAudioData?.dataUrl
        ? "Audio file attached. Review your typed summary and submit the complaint."
        : "Typed voice complaint summary ready. You can submit now or attach the original audio."
      : currentVoiceAudioData?.dataUrl
        ? "Audio file attached. Type the complaint summary manually before submitting."
        : "Upload an audio file and type the complaint summary manually.";
  });
}

function renderLoggedOutState() {
  renderMetrics({ totalComplaints: 0, openComplaints: 0 });
  document.getElementById("recentComplaints").innerHTML = `<div class="table-row empty-state"><span>Login to view recent complaints.</span></div>`;
  document.getElementById("complaintsList").innerHTML = `<div class="table-row empty-state"><span>Login to view your complaint history.</span></div>`;
  document.getElementById("adminTable").innerHTML = `<div class="table-row empty-state"><span>Login as Admin to access the command center.</span></div>`;
  alertsList.innerHTML = `<div class="table-row"><span>Login as Admin to manage alerts.</span></div>`;
  userManagementList.innerHTML = `<div class="table-row"><span>Login as Admin to manage accounts.</span></div>`;
}

async function loadDashboard() {
  if (!authState?.token) {
    setDashboardMessage("Login or register to continue as Citizen or Admin.");
    renderPermissions([]);
    renderLoggedOutState();
    return;
  }

  const data = await apiRequest("/api/dashboard", { method: "GET" });
  renderMetrics(data.metrics);
  renderRecentComplaints(data.complaints);
  renderComplaints(data.complaints);
  renderAdminTable(data.complaints);
  renderAlerts(data.complaints);
  renderMap(data.complaints);
  renderUserManagement(data.manageableUsers || []);

  if (data.auth) {
    authState = { ...authState, role: data.auth.role, username: data.auth.username, permissions: data.auth.permissions };
    saveAuthState();
    applyPermissionState();
  }
}

function resetComposer() {
  form.reset();
  uploadPreview.hidden = true;
  imagePreview.removeAttribute("src");
  imageName.textContent = "No image selected";
  imageHintText.textContent = "AI visual inspection will appear here after upload.";
  aiImageDescription.value = "";
  aiAccuracyStatus.textContent = "Upload an image to preview AI confidence.";
  currentImageFeatures = null;
  currentImageInsight = null;
  currentImageDataUrl = null;
  clearEmailProgressTimer();
  emailProgress.hidden = true;
  emailProgressFill.style.width = "0%";
  emailProgressValue.textContent = "0%";
  emailProgressLabel.textContent = "Preparing complaint email...";
  updateLiveLocationMap("");
  clearVoiceAudioSelection();
  updateVoiceTranscriptValue("");
  if (transcribeAudioBtn) {
    transcribeAudioBtn.disabled = true;
  }
  setComplaintInputMode(complaintInputMode.value || "text");
}

function loadImageElement(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("Unable to read the uploaded image."));
      image.src = reader.result;
    };
    reader.onerror = () => reject(new Error("Unable to load the uploaded file."));
    reader.readAsDataURL(file);
  });
}

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to prepare the uploaded image for PDF export."));
    reader.readAsDataURL(file);
  });
}

async function extractImageFeatures(file) {
  if (!file) return null;

  const image = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d", { willReadFrequently: true });
  const targetWidth = 96;
  const scale = targetWidth / image.width;

  canvas.width = targetWidth;
  canvas.height = Math.max(1, Math.round(image.height * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const { data, width, height } = context.getImageData(0, 0, canvas.width, canvas.height);
  let brightnessSum = 0;
  let saturationSum = 0;
  let redDominantPixels = 0;
  let smokyPixels = 0;
  let darkPixels = 0;
  let greenPixels = 0;
  let bluePixels = 0;
  let hotspotPixels = 0;
  let neutralPixels = 0;
  let edgeScore = 0;
  let brightnessSquaredSum = 0;
  const grayscale = new Float32Array(width * height);

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const brightness = (r + g + b) / 3 / 255;
    const saturation = max === 0 ? 0 : (max - min) / max;
    const pixelIndex = i / 4;

    brightnessSum += brightness;
    brightnessSquaredSum += brightness * brightness;
    saturationSum += saturation;
    grayscale[pixelIndex] = brightness;
    if (r > 160 && r > g * 1.15 && g > b) redDominantPixels += 1;
    if (brightness < 0.25) darkPixels += 1;
    if (saturation < 0.18 && brightness > 0.35 && brightness < 0.82) smokyPixels += 1;
    if (g > r * 0.95 && g > b * 1.08 && brightness > 0.25) greenPixels += 1;
    if (b > r * 1.08 && b > g * 0.95 && brightness > 0.25) bluePixels += 1;
    if (brightness > 0.72 && saturation > 0.42 && r > g) hotspotPixels += 1;
    if (saturation < 0.12 && brightness > 0.2 && brightness < 0.85) neutralPixels += 1;
  }

  for (let y = 0; y < height - 1; y += 1) {
    for (let x = 0; x < width - 1; x += 1) {
      const index = y * width + x;
      const dx = Math.abs(grayscale[index] - grayscale[index + 1]);
      const dy = Math.abs(grayscale[index] - grayscale[index + width]);
      edgeScore += dx + dy;
    }
  }

  const pixelCount = width * height;
  const maxEdgeScore = Math.max(1, (width - 1) * (height - 1) * 2);
  const averageBrightness = brightnessSum / pixelCount;
  const brightnessVariance = Math.max(0, brightnessSquaredSum / pixelCount - averageBrightness * averageBrightness);

  return {
    width: image.width,
    height: image.height,
    averageBrightness: Number(averageBrightness.toFixed(3)),
    averageSaturation: Number((saturationSum / pixelCount).toFixed(3)),
    edgeDensity: Number((edgeScore / maxEdgeScore).toFixed(3)),
    redHeatRatio: Number((redDominantPixels / pixelCount).toFixed(3)),
    smokeLikeRatio: Number((smokyPixels / pixelCount).toFixed(3)),
    darkRatio: Number((darkPixels / pixelCount).toFixed(3)),
    greenRatio: Number((greenPixels / pixelCount).toFixed(3)),
    blueRatio: Number((bluePixels / pixelCount).toFixed(3)),
    hotspotRatio: Number((hotspotPixels / pixelCount).toFixed(3)),
    neutralRatio: Number((neutralPixels / pixelCount).toFixed(3)),
    contrast: Number(Math.sqrt(brightnessVariance).toFixed(3))
  };
}

function setupImageUpload() {
  imageFileInput.addEventListener("change", async () => {
    const file = imageFileInput.files[0];
    if (!file) {
      uploadPreview.hidden = true;
      imagePreview.removeAttribute("src");
      aiImageDescription.value = "";
      aiAccuracyStatus.textContent = "Upload an image to preview AI confidence.";
      currentImageFeatures = null;
      currentImageInsight = null;
      currentImageDataUrl = null;
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imageName.textContent = file.name;
    imageHintText.textContent = `Selected ${file.type || "image"} - ${Math.round(file.size / 1024)} KB`;
    uploadPreview.hidden = false;

    try {
      currentImageDataUrl = await readFileAsDataUrl(file);
      currentImageFeatures = await extractImageFeatures(file);
      currentImageInsight = describeImageFromFeatures(currentImageFeatures);
      aiImageDescription.value = currentImageInsight.description;
      aiAccuracyStatus.textContent = "AI description ready. Press Show AI Accuracy to view confidence.";
    } catch (error) {
      currentImageFeatures = null;
      currentImageInsight = null;
      currentImageDataUrl = null;
      aiImageDescription.value = "AI could not inspect this image.";
      aiAccuracyStatus.textContent = error.message;
    }
  });
}

showAiAccuracyBtn.addEventListener("click", () => {
  if (!currentImageInsight) {
    aiAccuracyStatus.textContent = "Upload an image first to calculate AI confidence.";
    return;
  }

  aiAccuracyStatus.textContent = `AI accuracy: ${currentImageInsight.accuracy}% confidence for "${currentImageInsight.description}".`;
});

showLoginBtn.addEventListener("click", () => openAuthOverlay("login"));
showRegisterBtn.addEventListener("click", () => openAuthOverlay("register"));
issueTokenBtn.addEventListener("click", () => openAuthOverlay("login"));
closeAuthBtn.addEventListener("click", closeAuthOverlay);
openFaqLink?.addEventListener("click", (event) => {
  event.preventDefault();
  openFaqOverlay();
});
closeFaqBtn?.addEventListener("click", closeFaqOverlay);
generatePdfBtn.addEventListener("click", async () => {
  try {
    const result = await generatePdfReport(lastSubmittedReport, { download: true });
    setDashboardMessage(`Complaint report PDF downloaded as ${result.filename}.`, "success");
  } catch (error) {
    setDashboardMessage(error.message, "error");
  }
});
emailBbmpBtn.addEventListener("click", async () => {
  try {
    if (!lastSubmittedReport) {
      throw new Error("Submit a complaint first before preparing the BBMP email.");
    }

    emailBbmpBtn.disabled = true;
    beginEmailProgress();
    const { blob, filename } = await generatePdfReport(lastSubmittedReport, { download: false });
    setEmailProgress(42, "Generating formal PDF attachment...");
    const pdfBase64 = await blobToBase64(blob);
    setEmailProgress(68, "Encoding report for BBMP delivery...");

    const response = await apiRequest("/api/email-bbmp", {
      method: "POST",
      body: JSON.stringify({
        subject: (lastSubmittedReport.textComplaint || lastSubmittedReport.issueType || "Complaint report").trim(),
        report: lastSubmittedReport,
        pdfBase64,
        filename
      })
    });

    finishEmailProgress(true);
    setDashboardMessage(response.message || "Complaint email sent to BBMP successfully.", "success");
  } catch (error) {
    finishEmailProgress(false);
    setDashboardMessage(error.message, "error");
  } finally {
    emailBbmpBtn.disabled = !lastSubmittedReport;
  }
});
audioToggleBtn.addEventListener("click", async () => {
  audioEnabled = !audioEnabled;
  saveAudioPreference();
  updateAudioToggleState();

  if (audioEnabled) {
    await unlockAudio();
    setDashboardMessage("Interface sound enabled.", "success");
  } else {
    stopAmbientLoop();
    setDashboardMessage("Interface sound muted.", "info");
  }
});
testMicrophoneBtn.addEventListener("click", runMicrophoneDiagnostic);
reportLocationInput.addEventListener("input", (event) => {
  updateLiveLocationMap(event.target.value);
});
previewLocationBtn.addEventListener("click", showTypedLocationOnMap);
useLiveLocationBtn?.addEventListener("click", useLiveLocation);

document.addEventListener(
  "pointerdown",
  async (event) => {
    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    await unlockAudio();
    playButtonSound(button);
  },
  true
);

document.addEventListener(
  "keydown",
  async (event) => {
    if (event.key !== "Enter" && event.key !== " ") {
      return;
    }

    const button = event.target.closest("button");
    if (!button) {
      return;
    }

    await unlockAudio();
    playButtonSound(button);
  },
  true
);

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    authSubmitBtn.disabled = true;
    const formData = new FormData(authForm);
    const payload = Object.fromEntries(formData.entries());
    const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/register";
    const data = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    authState = data;
    saveAuthState();
    applyPermissionState();
    const successMessage = getAuthSuccessMessage(authMode, data);
    authMessage.textContent = successMessage;
    setDashboardMessage(successMessage, "success");
    authForm.reset();
    closeAuthOverlay();
    goToMainDashboard();
    await loadDashboard();
  } catch (error) {
    authMessage.textContent = error.message;
    setDashboardMessage(error.message, "error");
  } finally {
    authSubmitBtn.disabled = false;
  }
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    complaintSubmitBtn.disabled = true;
    if (!authState?.token) {
      throw new Error("Login or register before submitting a complaint.");
    }

    const formData = new FormData(event.target);
    const payload = Object.fromEntries(formData.entries());
    const imageFile = imageFileInput.files[0];
    const complaintPayload = getComplaintTextPayload();

    payload.textComplaint = complaintPayload.complaintText;
    payload.complaintInputMode = complaintPayload.complaintInputMode;
    payload.iotTriggered = false;
    payload.imageFeatures = currentImageFeatures || (await extractImageFeatures(imageFile));
    payload.imageHint = aiImageDescription.value.trim();
    showTypedLocationOnMap();

    const result = await apiRequest("/api/analyze-complaint", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    lastSubmittedReport = buildSubmittedReport(payload, result);
    setPdfButtonState(true);
    resetComposer();
    renderAnalysis(result);
    await loadDashboard();
  } catch (error) {
    setDashboardMessage(error.message, "error");
  } finally {
    complaintSubmitBtn.disabled = !(authState?.permissions || []).includes("submit_complaint");
  }
});

resetDashboardBtn.addEventListener("click", async () => {
  try {
    const confirmed = window.confirm("Are you sure to reset the dashboard?");
    if (!confirmed) {
      return;
    }

    const data = await apiRequest("/api/reset-dashboard", {
      method: "POST",
      body: JSON.stringify({})
    });
    lastSubmittedReport = null;
    setPdfButtonState(false);
    setDashboardMessage(data.message || "Dashboard reset.", "success");
    await loadDashboard();
  } catch (error) {
    setDashboardMessage(error.message, "error");
  }
});

loadSavedAuthState();
loadAudioPreference();
setupImageUpload();
setupComplaintInputMode();
setupMobileMenu();
setupRevealAnimations();
setupGooeyInteractions();
setupHorizontalTicker();
applyPermissionState();
updateAudioToggleState();
setPdfButtonState(false);
resetComposer();
openAuthOverlay("login");
loadDashboard().catch((error) => {
  setDashboardMessage(error.message, "error");
});
