const form = document.getElementById("complaintForm");
const reportLocationInput = document.getElementById("reportLocation");
const complaintInputMode = document.getElementById("complaintInputMode");
const typedComplaintField = document.getElementById("typedComplaintField");
const typedComplaintInput = document.getElementById("typedComplaintInput");
const voiceComplaintField = document.getElementById("voiceComplaintField");
const voiceTranscriptInput = document.getElementById("voiceTranscriptInput");
const startRecordingBtn = document.getElementById("startRecordingBtn");
const stopRecordingBtn = document.getElementById("stopRecordingBtn");
const clearRecordingBtn = document.getElementById("clearRecordingBtn");
const recordingIndicator = document.getElementById("recordingIndicator");
const voiceAudioPreview = document.getElementById("voiceAudioPreview");
const voiceAudioMeta = document.getElementById("voiceAudioMeta");
const voiceTranscriptStatus = document.getElementById("voiceTranscriptStatus");
const imageFileInput = document.getElementById("imageFile");
const aiImageDescription = document.getElementById("aiImageDescription");
const uploadPreview = document.getElementById("uploadPreview");
const imagePreview = document.getElementById("imagePreview");
const imageName = document.getElementById("imageName");
const imageHintText = document.getElementById("imageHintText");
const showAiAccuracyBtn = document.getElementById("showAiAccuracyBtn");
const retryImageAnalysisBtn = document.getElementById("retryImageAnalysisBtn");
const aiAccuracyStatus = document.getElementById("aiAccuracyStatus");
const imageAnalysisProgress = document.getElementById("imageAnalysisProgress");
const imageAnalysisProgressLabel = document.getElementById("imageAnalysisProgressLabel");
const imageAnalysisProgressValue = document.getElementById("imageAnalysisProgressValue");
const imageAnalysisProgressTrack = document.getElementById("imageAnalysisProgressTrack");
const imageAnalysisProgressFill = document.getElementById("imageAnalysisProgressFill");
const imageAnalysisProgressDetail = document.getElementById("imageAnalysisProgressDetail");
const previewLocationBtn = document.getElementById("previewLocationBtn");
const useLiveLocationBtn = document.getElementById("useLiveLocationBtn");
const checkWeatherBtn = document.getElementById("checkWeatherBtn");
const weatherPreviewPanel = document.getElementById("weatherPreviewPanel");
const weatherPreviewTitle = document.getElementById("weatherPreviewTitle");
const weatherPreviewBadge = document.getElementById("weatherPreviewBadge");
const weatherPreviewMetrics = document.getElementById("weatherPreviewMetrics");
const weatherPreviewNote = document.getElementById("weatherPreviewNote");
const checkCivicContextBtn = document.getElementById("checkCivicContextBtn");
const civicContextPanel = document.getElementById("civicContextPanel");
const civicContextTitle = document.getElementById("civicContextTitle");
const civicContextBadge = document.getElementById("civicContextBadge");
const civicContextNote = document.getElementById("civicContextNote");
const civicContextResults = document.getElementById("civicContextResults");
const resetDashboardBtn = document.getElementById("resetDashboardBtn");
const generatePdfBtn = document.getElementById("generatePdfBtn");
const emailBbmpBtn = document.getElementById("emailBbmpBtn");
const emailProgress = document.getElementById("emailProgress");
const emailProgressLabel = document.getElementById("emailProgressLabel");
const emailProgressValue = document.getElementById("emailProgressValue");
const emailProgressFill = document.getElementById("emailProgressFill");
const dashboardMessage = document.getElementById("dashboardMessage");
const issueTokenBtn = document.getElementById("issueTokenBtn");
const logoutBtn = document.getElementById("logoutBtn");
const authRole = document.getElementById("authRole");
const authPermissions = document.getElementById("authPermissions");
const authTokenState = document.getElementById("authTokenState");
const activeUsername = document.getElementById("activeUsername");
const draftStatus = document.getElementById("draftStatus");
const clearDraftBtn = document.getElementById("clearDraftBtn");
const complaintSubmitBtn = document.getElementById("complaintSubmitBtn");
const authOverlay = document.getElementById("authOverlay");
const faqOverlay = document.getElementById("faqOverlay");
const closeFaqBtn = document.getElementById("closeFaqBtn");
const authForm = document.getElementById("authForm");
const authSubmitBtn = document.getElementById("authSubmitBtn");
const authMessage = document.getElementById("authMessage");
const authRoleSelect = document.getElementById("authRoleSelect");
const authIdentityLabel = document.getElementById("authIdentityLabel");
const authIdentityInput = document.getElementById("authIdentity");
const authPasswordInput = document.getElementById("authPassword");
const loginAttemptCounter = document.getElementById("loginAttemptCounter");
const authOtpField = document.getElementById("authOtpField");
const authOtpInput = document.getElementById("authOtp");
const sendOtpBtn = document.getElementById("sendOtpBtn");
const otpTimerMessage = document.getElementById("otpTimerMessage");
const mobileMenuToggle = document.getElementById("mobileMenuToggle");
const siteNav = document.getElementById("siteNav");
const navTubelight = document.getElementById("navTubelight");
const showLoginBtn = document.getElementById("showLoginBtn");
const showRegisterBtn = document.getElementById("showRegisterBtn");
const forgotPasswordBtn = document.getElementById("forgotPasswordBtn");
const openFaqLink = document.getElementById("openFaqLink");
const userManagementList = document.getElementById("userManagementList");
const mainDashboard = document.getElementById("mainDashboard");
const aboutView = document.getElementById("aboutView");
const reportView = document.getElementById("reportView");
const reportWorkspace = document.getElementById("reportWorkspace");
const reportFormWorkspace = document.getElementById("reportFormWorkspace");
const complaintsWorkspace = document.getElementById("complaintsWorkspace");
const adminView = document.getElementById("adminView");
const adminWorkspace = document.getElementById("adminWorkspace");
const adminActionCenter = document.getElementById("adminActionCenter");
const authorityGovernancePanel = document.getElementById("authorityGovernancePanel");
const externalContextUsagePanel = document.getElementById("externalContextUsagePanel");
const alertsWorkspace = document.getElementById("alertsWorkspace");
const alertsList = document.getElementById("alertsList");
const alertSearchInput = document.getElementById("alertSearchInput");
const alertPriorityFilter = document.getElementById("alertPriorityFilter");
const clearAlertFiltersBtn = document.getElementById("clearAlertFiltersBtn");
const mapView = document.getElementById("mapView");
const mapWorkspace = document.getElementById("mapWorkspace");
const complaintsMapCanvas = document.getElementById("complaintsMapCanvas");
const mapComplaintList = document.getElementById("mapComplaintList");
const mapVisibleCount = document.getElementById("mapVisibleCount");
const mapHotspotLabel = document.getElementById("mapHotspotLabel");
const mapPriorityWatch = document.getElementById("mapPriorityWatch");
const civicIntelligencePanel = document.getElementById("civicIntelligencePanel");
const communityCasesPanel = document.getElementById("communityCasesPanel");
const localAlertsForm = document.getElementById("localAlertsForm");
const localAlertsEnabled = document.getElementById("localAlertsEnabled");
const localAlertAreasInput = document.getElementById("localAlertAreasInput");
const localAlertSeverityThreshold = document.getElementById("localAlertSeverityThreshold");
const localAlertAreasList = document.getElementById("localAlertAreasList");
const localAlertsMessage = document.getElementById("localAlertsMessage");
const saveLocalAlertsBtn = document.getElementById("saveLocalAlertsBtn");
const userManagementWorkspace = document.getElementById("userManagementWorkspace");
const userSearchInput = document.getElementById("userSearchInput");
const userStateFilter = document.getElementById("userStateFilter");
const clearUserFiltersBtn = document.getElementById("clearUserFiltersBtn");
const complaintSearchInput = document.getElementById("complaintSearchInput");
const complaintStatusFilter = document.getElementById("complaintStatusFilter");
const complaintSortSelect = document.getElementById("complaintSortSelect");
const clearComplaintFiltersBtn = document.getElementById("clearComplaintFiltersBtn");
const adminInsights = document.getElementById("adminInsights");
const aiObservabilityPanel = document.getElementById("aiObservabilityPanel");
const incidentClusterPanel = document.getElementById("incidentClusterPanel");
const locationMapFrame = document.getElementById("locationMapFrame");
const liveLocationStatus = document.getElementById("liveLocationStatus");
const pageFooter = document.querySelector(".page-footer");
const postSubmitSummary = document.getElementById("postSubmitSummary");
const postSubmitContext = document.getElementById("postSubmitContext");
const reportResultPanel = document.getElementById("reportResultPanel");
const informClosedOnesBtn = document.getElementById("informClosedOnesBtn");
const closeContactsForm = document.getElementById("closeContactsForm");
const sendCloseContactsBtn = document.getElementById("sendCloseContactsBtn");
const cancelCloseContactsBtn = document.getElementById("cancelCloseContactsBtn");
const closeContactsMessage = document.getElementById("closeContactsMessage");
const complaintDetailOverlay = document.getElementById("complaintDetailOverlay");
const closeComplaintDetailBtn = document.getElementById("closeComplaintDetailBtn");
const complaintDetailTitle = document.getElementById("complaintDetailTitle");
const complaintDetailBody = document.getElementById("complaintDetailBody");
const locationPreviewOverlay = document.getElementById("locationPreviewOverlay");
const locationPreviewFrame = document.getElementById("locationPreviewFrame");
const locationPreviewTitle = document.getElementById("locationPreviewTitle");
const locationPreviewCaption = document.getElementById("locationPreviewCaption");
const closeLocationPreviewBtn = document.getElementById("closeLocationPreviewBtn");

const storageKey = "smart-community-auth";
const draftStorageKey = "smart-community-report-draft-v1";
let authState = null;
let authMode = "login";
let currentImageFeatures = null;
let currentImageDataUrl = null;
let currentImageAiPayload = null;
let imageAnalysisRequestId = 0;
let weatherPreviewRequestId = 0;
let currentReportMapLocation = null;
let lastWeatherPreviewLocation = "";
let activeWeatherPreviewLocation = "";
let currentImageAnalysisToken = "";
let currentWeatherContextToken = "";
let currentCivicContextToken = "";
let civicContextRequestId = 0;
const dialogReturnFocus = new WeakMap();

function focusDialog(dialog) {
  if (!dialog) return;
  if (document.activeElement instanceof HTMLElement) dialogReturnFocus.set(dialog, document.activeElement);
  window.requestAnimationFrame(() => {
    dialog.querySelector('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href]')?.focus();
  });
}

function restoreDialogFocus(dialog) {
  const target = dialogReturnFocus.get(dialog);
  if (target?.isConnected) target.focus();
  dialogReturnFocus.delete(dialog);
}

document.addEventListener("keydown", (event) => {
  const dialog = [...document.querySelectorAll('[role="dialog"]')].find((item) => !item.hidden);
  if (!dialog) return;
  if (event.key === "Escape" && dialog !== authOverlay) {
    event.preventDefault();
    if (dialog === faqOverlay) closeFaqOverlay();
    if (dialog === complaintDetailOverlay) closeComplaintDetailOverlay();
    if (dialog === locationPreviewOverlay) closeLocationPreview();
    return;
  }
  if (event.key !== "Tab") return;
  const focusable = [...dialog.querySelectorAll('button:not([disabled]):not([hidden]), input:not([disabled]):not([hidden]), select:not([disabled]):not([hidden]), textarea:not([disabled]):not([hidden]), a[href]')]
    .filter((item) => item.getClientRects().length);
  if (!focusable.length) return;
  const first = focusable[0];
  const last = focusable.at(-1);
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
  else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
});
let lastSubmittedReport = null;
let localAlertPreferences = null;
let emailProgressTimer = null;
let currentVoiceAudioData = null;
let currentVoiceAudioObjectUrl = null;
let voiceRecorderStream = null;
let voiceMediaRecorder = null;
let voiceRecordingChunks = [];
let voiceRecordingStartedAt = 0;
let isVoiceRecording = false;
let registrationOtpIssued = false;
let passwordResetOtpIssued = false;
let registrationOtpContext = null;
let passwordResetOtpContext = null;
let loginAttemptsRemaining = 4;
let loginLockTimer = null;
let otpTimer = null;
let otpSecondsRemaining = 0;
let dashboardDataCache = { complaints: [], users: [], digitalTwin: null, riskPredictions: null, incidentCommands: [], civicIntelligence: null, communityCases: [] };
let draftSaveTimer = null;
let dashboardReloadTimer = null;

function emitAuthStateChange() {
  window.dispatchEvent(
    new CustomEvent("smart-community:auth-changed", {
      detail: { authState }
    })
  );
}

const permissionMeta = {
  submit_complaint: { label: "Submit Complaint", target: () => reportFormWorkspace, view: "report" },
  view_personal_updates: { label: "View Personal Updates", target: () => complaintsWorkspace, view: "complaints" },
  view_dashboard: { label: "View Dashboard", target: () => adminWorkspace, view: "admin" },
  reset_dashboard: { label: "Reset Dashboard", action: () => resetDashboardBtn.click() },
  manage_alerts: { label: "Manage Alerts", target: () => alertsWorkspace, view: "alerts" },
  update_complaint_status: { label: "Update Complaint Status", target: () => complaintsWorkspace, view: "complaints" },
  delete_users: { label: "Delete Users", target: () => userManagementWorkspace, view: "users" }
};

function setDashboardMessage(message, type = "info") {
  dashboardMessage.textContent = message;
  dashboardMessage.dataset.state = type;
}

function normalizeSearchValue(value) {
  return String(value || "").trim().toLowerCase();
}

function priorityRank(priority) {
  const order = { Critical: 4, High: 3, Medium: 2, Low: 1 };
  return order[priority] || 0;
}

function buildDashboardQueryParams() {
  const params = new URLSearchParams();
  const complaintSearch = complaintSearchInput?.value?.trim();
  const complaintStatus = complaintStatusFilter?.value || "";
  const complaintSort = complaintSortSelect?.value || "newest";
  const alertSearch = alertSearchInput?.value?.trim();
  const alertPriority = alertPriorityFilter?.value || "";
  const userSearch = userSearchInput?.value?.trim();
  const userState = userStateFilter?.value || "";

  if (complaintSearch) params.set("complaintSearch", complaintSearch);
  if (complaintStatus) params.set("complaintStatus", complaintStatus);
  if (complaintSort && complaintSort !== "newest") params.set("complaintSort", complaintSort);
  if (alertSearch) params.set("alertSearch", alertSearch);
  if (alertPriority) params.set("alertPriority", alertPriority);
  if (userSearch) params.set("userSearch", userSearch);
  if (userState) params.set("userState", userState);

  return params.toString();
}

function scheduleDashboardReload() {
  if (!authState?.token) {
    return;
  }

  if (dashboardReloadTimer) {
    window.clearTimeout(dashboardReloadTimer);
  }

  dashboardReloadTimer = window.setTimeout(() => {
    dashboardReloadTimer = null;
    loadDashboard().catch((error) => {
      setDashboardMessage(error.message, "error");
    });
  }, 180);
}

function updateDraftStatus(message, state = "") {
  if (!draftStatus) {
    return;
  }

  draftStatus.textContent = message;
  draftStatus.dataset.state = state;
}

function buildReportDraftPayload() {
  return {
    location: reportLocationInput?.value || "",
    complaintInputMode: complaintInputMode?.value || "text",
    typedComplaint: typedComplaintInput?.value || "",
    voiceTranscript: voiceTranscriptInput?.value || "",
    imageHint: aiImageDescription?.value || ""
  };
}

function saveReportDraft() {
  try {
    localStorage.setItem(draftStorageKey, JSON.stringify(buildReportDraftPayload()));
    updateDraftStatus("Draft saved locally.", "saved");
  } catch (_error) {
    updateDraftStatus("Unable to save draft in this browser.", "error");
  }
}

function scheduleDraftSave() {
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer);
  }

  updateDraftStatus("Saving draft...", "saving");
  draftSaveTimer = window.setTimeout(() => {
    draftSaveTimer = null;
    saveReportDraft();
  }, 250);
}

function clearReportDraft(updateMessage = true) {
  if (draftSaveTimer) {
    window.clearTimeout(draftSaveTimer);
    draftSaveTimer = null;
  }

  try {
    localStorage.removeItem(draftStorageKey);
    if (updateMessage) {
      updateDraftStatus("Draft cleared.", "cleared");
    }
  } catch (_error) {
    if (updateMessage) {
      updateDraftStatus("Unable to clear draft in this browser.", "error");
    }
  }
}

function restoreReportDraft() {
  try {
    const saved = localStorage.getItem(draftStorageKey);
    if (!saved) {
      updateDraftStatus("Draft saving is ready.", "");
      return;
    }

    const draft = JSON.parse(saved);
    if (!draft || typeof draft !== "object") {
      updateDraftStatus("Draft saving is ready.", "");
      return;
    }

    reportLocationInput.value = String(draft.location || "");
    complaintInputMode.value = draft.complaintInputMode === "voice" ? "voice" : "text";
    typedComplaintInput.value = String(draft.typedComplaint || "");
    voiceTranscriptInput.value = String(draft.voiceTranscript || "");
    aiImageDescription.value = String(draft.imageHint || "");
    setComplaintInputMode(complaintInputMode.value);
    updateDraftStatus("Saved draft restored.", "restored");
  } catch (_error) {
    updateDraftStatus("Draft saving is ready.", "");
  }
}

function updateComplaintSubmitAvailability() {
  const canSubmit = Boolean(authState?.permissions?.includes("submit_complaint"));
  complaintSubmitBtn.disabled = !canSubmit;
}

function resetLoginAttemptState() {
  loginAttemptsRemaining = 4;
  authSubmitBtn.disabled = false;
  if (loginLockTimer) {
    window.clearInterval(loginLockTimer);
    loginLockTimer = null;
  }
  if (loginAttemptCounter) {
    loginAttemptCounter.hidden = true;
    loginAttemptCounter.textContent = "";
  }
}

function startLoginRetryCounter() {
  let secondsRemaining = 30;
  authSubmitBtn.disabled = true;
  loginAttemptCounter.hidden = false;

  const updateCounter = () => {
    loginAttemptCounter.textContent = `Too many failed login attempts. Extra attempt available in ${secondsRemaining}s.`;
  };

  updateCounter();
  if (loginLockTimer) {
    window.clearInterval(loginLockTimer);
  }

  loginLockTimer = window.setInterval(() => {
    secondsRemaining -= 1;
    if (secondsRemaining <= 0) {
      window.clearInterval(loginLockTimer);
      loginLockTimer = null;
      loginAttemptsRemaining = 1;
      authSubmitBtn.disabled = false;
      loginAttemptCounter.textContent = "Extra login attempt available now.";
      return;
    }

    updateCounter();
  }, 1000);
}

function recordClientLoginFailure() {
  loginAttemptsRemaining -= 1;

  if (loginAttemptsRemaining > 0) {
    loginAttemptCounter.hidden = false;
    loginAttemptCounter.textContent = `${loginAttemptsRemaining} login attempt${loginAttemptsRemaining === 1 ? "" : "s"} remaining.`;
    return;
  }

  startLoginRetryCounter();
}

function clearOtpTimer() {
  if (otpTimer) {
    window.clearInterval(otpTimer);
    otpTimer = null;
  }
  otpSecondsRemaining = 0;
}

function normalizeAuthEmail(value) {
  return String(value || "").trim().toLowerCase();
}

function invalidateOtpState(purpose, message = "") {
  if (purpose === "register") {
    registrationOtpIssued = false;
    registrationOtpContext = null;
  } else {
    passwordResetOtpIssued = false;
    passwordResetOtpContext = null;
  }
  clearOtpTimer();
  sendOtpBtn.disabled = false;
  sendOtpBtn.textContent = "Send OTP";
  if (message) {
    setOtpTimerMessage(message, "expired");
  }
}

function registrationOtpMatchesCurrentForm() {
  return Boolean(
    registrationOtpIssued &&
      registrationOtpContext &&
      registrationOtpContext.email === normalizeAuthEmail(authIdentityInput.value) &&
      registrationOtpContext.password === authPasswordInput.value &&
      registrationOtpContext.role === authRoleSelect.value
  );
}

function passwordResetOtpMatchesCurrentForm() {
  return Boolean(
    passwordResetOtpIssued &&
      passwordResetOtpContext &&
      passwordResetOtpContext.email === normalizeAuthEmail(authIdentityInput.value)
  );
}

function setOtpTimerMessage(message, state = "") {
  if (!otpTimerMessage) {
    return;
  }

  otpTimerMessage.hidden = !message;
  otpTimerMessage.textContent = message;
  otpTimerMessage.dataset.state = state;
}

function assertOtpRequestInputs(mode) {
  if (!authIdentityInput.value.trim()) {
    authIdentityInput.focus();
    authIdentityInput.reportValidity();
    throw new Error("Enter your email address before requesting an OTP.");
  }

  if (!authIdentityInput.checkValidity()) {
    authIdentityInput.focus();
    authIdentityInput.reportValidity();
    throw new Error("Enter a valid email address before requesting an OTP.");
  }

  if (mode === "register" && !authPasswordInput.value) {
    authPasswordInput.focus();
    authPasswordInput.reportValidity();
    throw new Error("Enter your password before requesting a registration OTP.");
  }
}

function startOtpCountdown(email, purpose = "register", expiresInSeconds = 300, deliveryDetail = "") {
  clearOtpTimer();
  otpSecondsRemaining = Number(expiresInSeconds || 300);
  sendOtpBtn.disabled = true;
  sendOtpBtn.textContent = "OTP sent";

  const updateOtpCountdown = () => {
    const recipientLabel = deliveryDetail || (purpose === "reset" ? "OTP request accepted" : `OTP sent to ${email}`);
    setOtpTimerMessage(`${recipientLabel}. Verify within ${otpSecondsRemaining}s.`, "active");
  };

  updateOtpCountdown();
  otpTimer = window.setInterval(() => {
    otpSecondsRemaining -= 1;
    if (otpSecondsRemaining <= 0) {
      clearOtpTimer();
      if (purpose === "reset") {
        passwordResetOtpIssued = false;
        passwordResetOtpContext = null;
      } else {
        registrationOtpIssued = false;
        registrationOtpContext = null;
      }
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = "Resend OTP";
      setOtpTimerMessage("OTP expired. Press Resend OTP to request a new code.", "expired");
      return;
    }

    updateOtpCountdown();
  }, 1000);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function safeExternalHref(value) {
  try {
    const url = new URL(String(value || ""));
    return url.protocol === "https:" ? url.href : "";
  } catch (_error) {
    return "";
  }
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
  emitAuthStateChange();
}

function clearAuthState(message) {
  authState = null;
  lastSubmittedReport = null;
  localAlertPreferences = null;
  dashboardDataCache = {
    complaints: [],
    users: [],
    digitalTwin: null,
    riskPredictions: null,
    incidentCommands: [],
    incidentClusters: [],
    civicIntelligence: null,
    communityCases: []
  };
  saveAuthState();
  applyPermissionState();
  setPdfButtonState(false);
  renderLoggedOutState();
  if (message) {
    setDashboardMessage(message, "info");
  }
}

function logoutCurrentUser(message = "Logged out successfully.") {
  const previousRole = authState?.role;
  clearAuthState(message);
  resetLoginAttemptState();
  if (previousRole && authRoleSelect) {
    authRoleSelect.value = previousRole;
  }
  openAuthOverlay("login");
}

function loadSavedAuthState() {
  authState = null;
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) {
      return;
    }

    const parsed = JSON.parse(saved);
    if (parsed && typeof parsed === "object" && parsed.token) {
      authState = parsed;
    } else {
      localStorage.removeItem(storageKey);
    }
  } catch (_error) {
    authState = null;
  }
}

function openAuthOverlay(mode = "login") {
  authMode = mode;
  window.UrbanPulseAuthCharacters?.reset();
  authOverlay.hidden = false;
  document.body.classList.add("auth-open");
  document.body.classList.add("auth-screen-active");
  if (siteNav?.classList.contains("is-open")) {
    siteNav.classList.remove("is-open");
    mobileMenuToggle?.setAttribute("aria-expanded", "false");
  }
  showLoginBtn.classList.toggle("is-active", mode === "login");
  showRegisterBtn.classList.toggle("is-active", mode === "register");
  const isRegisterMode = mode === "register";
  const isResetMode = mode === "reset-password";
  const usesOtp = isRegisterMode || isResetMode;
  const adminRoleOption = authRoleSelect?.querySelector('option[value="Admin"]');
  if (adminRoleOption) {
    adminRoleOption.disabled = isRegisterMode;
    adminRoleOption.hidden = isRegisterMode;
  }
  if (isRegisterMode && authRoleSelect) authRoleSelect.value = "Citizen";
  const roleField = authRoleSelect?.closest("label");
  if (roleField) {
    roleField.hidden = isResetMode;
    roleField.style.display = isResetMode ? "none" : "";
  }
  authOtpField.hidden = !usesOtp;
  sendOtpBtn.hidden = !usesOtp;
  authOtpField.style.display = usesOtp ? "" : "none";
  sendOtpBtn.style.display = usesOtp ? "" : "none";
  authOtpInput.disabled = !usesOtp;
  authOtpInput.required = usesOtp;
  authIdentityLabel.textContent = "Email ID";
  authIdentityInput.placeholder = "Enter email address";
  authIdentityInput.autocomplete = "email";
  authPasswordInput.placeholder = isResetMode ? "Enter new password" : "Enter password";
  authPasswordInput.autocomplete = isRegisterMode || isResetMode ? "new-password" : "current-password";
  forgotPasswordBtn.hidden = mode !== "login";
  forgotPasswordBtn.style.display = mode === "login" ? "" : "none";
  registrationOtpIssued = false;
  passwordResetOtpIssued = false;
  registrationOtpContext = null;
  passwordResetOtpContext = null;
  clearOtpTimer();
  sendOtpBtn.disabled = false;
  sendOtpBtn.textContent = "Send OTP";
  setOtpTimerMessage("");
  if (mode === "login" && !loginLockTimer) {
    authSubmitBtn.disabled = false;
  }
  authSubmitBtn.textContent = mode === "login" ? "Login" : isResetMode ? "Reset Password" : "Verify OTP & Register";
  authMessage.dataset.state = "info";
  authMessage.textContent =
    mode === "login"
      ? "Choose Admin or Citizen, then login with your email and password."
      : isResetMode
        ? "Enter your registered email and new password, then request an OTP to reset securely."
        : "Create a Citizen account with your email and password, then request an OTP to complete registration.";

  window.requestAnimationFrame(() => window.UrbanPulseLiquidGlass?.refresh());
  focusDialog(authOverlay);
}

function closeAuthOverlay() {
  if (!authState?.token) {
    authMessage.textContent = "Login is required to access the dashboard.";
    return;
  }
  authOverlay.hidden = true;
  restoreDialogFocus(authOverlay);
  document.body.classList.remove("auth-screen-active");
  if (faqOverlay?.hidden !== false && complaintDetailOverlay?.hidden !== false) {
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
  focusDialog(faqOverlay);
}

function closeFaqOverlay() {
  faqOverlay.hidden = true;
  restoreDialogFocus(faqOverlay);
  if (authOverlay?.hidden !== false && complaintDetailOverlay?.hidden !== false) {
    document.body.classList.remove("auth-open");
  }
}

function renderPostSubmitSummary(report) {
  if (!postSubmitSummary || !report) {
    return;
  }

  postSubmitSummary.innerHTML = [
    ["Complaint ID", report.complaintId || "Pending"],
    ["City", report.city?.name || "Bengaluru"],
    ["Severity", report.priority || "Low"],
    ["Issue", report.issueType || "Complaint"],
    ...(report.aiDescription && report.aiDescription !== report.issueType ? [["Visual finding", report.aiDescription]] : []),
    ["Location", report.location || "Unknown"],
    ...(report.weather?.status === "available"
      ? [["Local conditions", `${report.weather.condition || "Observed"} · ${formatWeatherValue(report.weather.temperatureC, "°C")}`]]
      : [])
  ]
    .map(
      ([label, value]) => `
        <div class="post-submit-summary-row">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(value)}</strong>
        </div>
      `
    )
    .join("");
}

function renderPostSubmitLinks(items = []) {
  return items
    .slice(0, 3)
    .map((item) => {
      const href = safeExternalHref(item.url);
      if (!href) return "";
      const sourceLabel = item.official ? "Verified official source" : item.domain || "Search result";
      return `
        <a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">
          <strong>${escapeHtml(item.title || "Reference")}</strong>
          <span>${escapeHtml(sourceLabel)}</span>
        </a>
      `;
    })
    .filter(Boolean)
    .join("");
}

function renderPostSubmitContext(report) {
  if (!postSubmitContext) return;
  const evidence = report?.civicEvidence || {};
  const officialLinks = renderPostSubmitLinks(evidence.officialSources || []);
  const publicLinks = renderPostSubmitLinks(evidence.publicContext || []);
  const weatherNote = report?.weather?.note || "";

  postSubmitContext.innerHTML = `
    ${weatherNote ? `
      <section class="post-submit-context-section">
        <h4>Conditions at submission</h4>
        <p>${escapeHtml(weatherNote)}</p>
      </section>
    ` : ""}
    <section class="post-submit-context-section">
      <h4>Official and civic references</h4>
      ${officialLinks ? `<div class="post-submit-link-list">${officialLinks}</div>` : `<p>${escapeHtml(evidence.reason || "No relevant official references were available.")}</p>`}
    </section>
    ${publicLinks ? `
      <section class="post-submit-context-section">
        <h4>Related public context</h4>
        <p>Supporting context only. These results do not determine severity or routing.</p>
        <div class="post-submit-link-list">${publicLinks}</div>
      </section>
    ` : ""}
  `;
}

function showInlineReportResult(report) {
  renderPostSubmitSummary(report);
  renderPostSubmitContext(report);
  if (reportResultPanel) reportResultPanel.hidden = false;
}

const viewTargets = {
  home: { hash: "aboutView", section: () => aboutView },
  report: { hash: "reportFormWorkspace", section: () => reportView },
  complaints: { hash: "complaintsWorkspace", section: () => reportView },
  admin: { hash: "adminWorkspace", section: () => adminView },
  alerts: { hash: "alertsWorkspace", section: () => adminView },
  map: { hash: "mapWorkspace", section: () => mapView },
  users: { hash: "userManagementWorkspace", section: () => mapView }
};

function getViewNameFromElement(element) {
  if (!element) {
    return "home";
  }

  if (element === reportWorkspace || element === reportFormWorkspace) {
    return "report";
  }

  if (element === complaintsWorkspace) {
    return "complaints";
  }

  if (element === adminWorkspace) {
    return "admin";
  }

  if (element === alertsWorkspace) {
    return "alerts";
  }

  if (element === mapWorkspace) {
    return "map";
  }

  if (element === userManagementWorkspace) {
    return "users";
  }

  return "home";
}

function getViewNameFromHash(hashValue) {
  const normalizedHash = String(hashValue || "").replace(/^#/, "");
  if (normalizedHash === "heroStage") {
    return "home";
  }
  const matched = Object.entries(viewTargets).find(([, config]) => config.hash === normalizedHash);
  return matched ? matched[0] : "home";
}

function updateTubelightNav() {
  if (!siteNav || !navTubelight) {
    return;
  }

  if (window.innerWidth <= 920) {
    navTubelight.style.opacity = "0";
    return;
  }

  const activeLink = siteNav.querySelector(".nav-link.is-active:not([hidden])");
  if (!activeLink) {
    navTubelight.style.opacity = "0";
    return;
  }

  const navRect = siteNav.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  const width = Math.max(34, Math.round(linkRect.width + 18));
  const x = Math.round(linkRect.left - navRect.left + linkRect.width / 2 - width / 2);

  navTubelight.style.width = `${width}px`;
  navTubelight.style.transform = `translateX(${x}px)`;
  navTubelight.style.opacity = "1";
}

function activateAppView(viewName = "home", options = {}) {
  const { updateHash = true, message = "", scroll = true } = options;
  const nextView = viewTargets[viewName] ? viewName : "home";
  const aboutVisible = nextView === "home";
  const reportGroupVisible = nextView === "report" || nextView === "complaints";
  const adminGroupVisible = nextView === "admin" || nextView === "alerts";
  const mapGroupVisible = nextView === "map" || nextView === "users";

  document.body.dataset.appView = nextView;

  if (aboutView) {
    aboutView.hidden = !aboutVisible;
  }

  if (reportView) {
    reportView.hidden = !reportGroupVisible;
  }

  if (adminView) {
    adminView.hidden = !adminGroupVisible;
  }

  if (mapView) {
    mapView.hidden = !mapGroupVisible;
  }

  if (pageFooter) {
    pageFooter.hidden = nextView !== "home";
  }

  document.querySelectorAll(".nav-link").forEach((link) => {
    const href = link.getAttribute("href");
    const isActive = href === `#${viewTargets[nextView].hash}`;
    link.classList.toggle("is-active", isActive);
    if (isActive) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  updateTubelightNav();

  if (updateHash) {
    const nextHash = `#${viewTargets[nextView].hash}`;
    if (window.location.hash !== nextHash) {
      window.history.replaceState(null, "", nextHash);
    }
  }

  if (scroll) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (message) {
    setDashboardMessage(message, "success");
  }
}

function goToMainDashboard() {
  activateAppView("home");
}

function scrollToWorkspace(element, message) {
  if (!element) return;
  activateAppView(getViewNameFromElement(element), { message });
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
    updateTubelightNav();
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

function setupAboutVideoExperience() {
  const experience = document.getElementById("aboutVideoExperience");
  const sticky = experience?.querySelector(".about-video-sticky");
  const frame = document.getElementById("aboutVideoFrame");
  const video = document.getElementById("aboutCivicVideo");
  const titleLeft = document.getElementById("aboutVideoTitleLeft");
  const titleRight = document.getElementById("aboutVideoTitleRight");
  const scrollCue = document.getElementById("aboutVideoScrollCue");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!experience || !sticky || !frame || !video || !titleLeft || !titleRight || !scrollCue) {
    return;
  }

  let animationFrame = 0;
  let videoLoaded = false;
  let isInViewport = false;

  function loadVideo() {
    if (videoLoaded || reducedMotion) {
      return;
    }

    video.querySelectorAll("source[data-src]").forEach((source) => {
      source.src = source.dataset.src;
    });
    video.load();
    videoLoaded = true;
  }

  function syncPlayback() {
    if (reducedMotion || aboutView?.hidden || !isInViewport || document.hidden) {
      video.pause();
      return;
    }

    loadVideo();
    video.play().catch(() => {});
  }

  function render() {
    animationFrame = 0;

    if (aboutView?.hidden) {
      return;
    }

    if (reducedMotion) {
      experience.dataset.reducedMotion = "true";
      return;
    }

    const rect = experience.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const stickyTop = Math.min(104, viewportHeight * 0.12);
    const travel = Math.max(1, rect.height - viewportHeight);
    const progress = Math.min(1, Math.max(0, (stickyTop - rect.top) / travel));
    const easedProgress = 1 - Math.pow(1 - progress, 3);
    const mobile = window.innerWidth < 768;
    const startWidth = mobile ? 240 : 320;
    const startHeight = mobile ? 340 : 400;
    const maxWidth = Math.max(startWidth, sticky.clientWidth - (mobile ? 16 : 48));
    const maxHeight = Math.max(startHeight, sticky.clientHeight - (mobile ? 32 : 48));
    const expandedWidth = Math.min(maxWidth, 1380);
    const expandedHeight = Math.min(maxHeight, expandedWidth * 0.58);
    const width = startWidth + (expandedWidth - startWidth) * easedProgress;
    const height = startHeight + (expandedHeight - startHeight) * easedProgress;
    const titleTravel = (mobile ? window.innerWidth * 0.28 : window.innerWidth * 0.38) * progress;
    const titleOpacity = Math.max(0, 1 - progress * 1.3);
    const cueOpacity = Math.max(0, 1 - progress * 4);

    experience.style.setProperty("--about-video-progress", progress.toFixed(4));
    frame.style.width = `${Math.round(width)}px`;
    frame.style.height = `${Math.round(height)}px`;
    titleLeft.style.transform = `translate3d(${-titleTravel}px, 0, 0)`;
    titleRight.style.transform = `translate3d(${titleTravel}px, 0, 0)`;
    titleLeft.style.opacity = String(titleOpacity);
    titleRight.style.opacity = String(titleOpacity);
    scrollCue.style.opacity = String(cueOpacity);
    experience.dataset.expanded = progress >= 0.92 ? "true" : "false";
  }

  function queueRender() {
    if (!animationFrame) {
      animationFrame = window.requestAnimationFrame(render);
    }
  }

  const visibilityObserver = new IntersectionObserver(
    ([entry]) => {
      isInViewport = entry.isIntersecting;
      if (isInViewport) {
        loadVideo();
        queueRender();
      }
      syncPlayback();
    },
    { rootMargin: "160px 0px", threshold: 0.01 }
  );

  visibilityObserver.observe(experience);

  const viewObserver = new MutationObserver(() => {
    queueRender();
    syncPlayback();
  });
  if (aboutView) {
    viewObserver.observe(aboutView, { attributes: true, attributeFilter: ["hidden"] });
  }

  window.addEventListener("scroll", queueRender, { passive: true });
  window.addEventListener("resize", queueRender);
  document.addEventListener("visibilitychange", syncPlayback);
  queueRender();
}

function setupAppNavigation() {
  const navigationLinks = Array.from(
    document.querySelectorAll('.brand-lockup[href^="#"], .site-nav a[href^="#"], .hero-actions a[href^="#"]')
  );

  navigationLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href) {
        return;
      }

      event.preventDefault();
      activateAppView(getViewNameFromHash(href));
      toggleMobileMenu(false);
    });
  });

  window.addEventListener("hashchange", () => {
      activateAppView(getViewNameFromHash(window.location.hash), { updateHash: false });
  });

  activateAppView(getViewNameFromHash(window.location.hash), { updateHash: false, scroll: false });
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
  activeUsername.textContent = hasToken ? authState.username : "No account logged in";
  issueTokenBtn.hidden = hasToken;
  logoutBtn.hidden = !hasToken;
  renderPermissions(permissions);
  updateComplaintSubmitAvailability();
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

  if (!hasToken) {
    renderLocalAlertPreferences(null);
  }

  document.querySelectorAll('.nav-link[href="#adminWorkspace"], .nav-link[href="#alertsWorkspace"]').forEach((link) => {
    link.hidden = !permissions.includes("view_dashboard");
  });
  document.querySelectorAll('.nav-link[href="#mapWorkspace"]').forEach((link) => {
    link.hidden = !hasToken;
  });
  updateTubelightNav();
}

function getAuthSuccessMessage(mode, data) {
  if (mode === "register") {
    return `Registration successful. ${data.username} is now logged in as ${data.role}.`;
  }

  return `Login successful. ${data.username} is now logged in as ${data.role}.`;
}

function formatOtpDeliveryDetail(data, fallbackEmail) {
  const recipient = data?.recipient || fallbackEmail;
  const acceptedCount = Number(data?.acceptedCount || 0);
  return recipient
    ? `Sent to ${recipient}${acceptedCount ? ` - mail server accepted ${acceptedCount}` : ""}`
    : "OTP delivery accepted by the mail server.";
}

function formatOtpErrorDetail(error) {
  const code = error?.code || "SMTP_ERROR";
  const retryNote = error?.retryable === false ? "Admin SMTP settings need attention." : "Try again in a minute.";
  return `${code} · ${retryNote}`;
}

async function requestRegistrationOtp() {
  try {
    assertOtpRequestInputs("register");
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    authSubmitBtn.disabled = true;
    const formData = new FormData(authForm);
    const payload = Object.fromEntries(formData.entries());
    delete payload.otp;
    const data = await apiRequest("/api/auth/register/request-otp", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (data.deliveryStatus !== "sent") {
      registrationOtpIssued = false;
      clearOtpTimer();
      setOtpTimerMessage("OTP was not sent. Please try again.", "expired");
      authMessage.textContent = data.message || "OTP was not sent. Please try again.";
      setDashboardMessage(authMessage.textContent, "error");
      return;
    }

    registrationOtpIssued = true;
    registrationOtpContext = {
      email: normalizeAuthEmail(payload.email),
      password: String(payload.password || ""),
      role: String(payload.role || "")
    };
    startOtpCountdown(payload.email, "register", data.expiresInSeconds, formatOtpDeliveryDetail(data, payload.email));
    authMessage.textContent = `OTP sent. Check your inbox and enter it within ${Math.floor((data.expiresInSeconds || 300) / 60)} minutes.`;
    setDashboardMessage(authMessage.textContent, "success");
    authOtpInput.focus();
  } catch (error) {
    if (error.deliveryStatus === "not_sent") {
      registrationOtpIssued = false;
    }
    const message =
      error.deliveryStatus === "not_sent"
        ? "OTP could not be sent. Please try again."
        : error.message;
    clearOtpTimer();
    setOtpTimerMessage(formatOtpErrorDetail(error), "expired");
    authMessage.textContent = message;
    setDashboardMessage(message, "error");
    sendOtpBtn.textContent = registrationOtpIssued ? "Resend OTP" : "Send OTP";
  } finally {
    if (!otpTimer) {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = registrationOtpIssued ? "Resend OTP" : "Send OTP";
    }
    authSubmitBtn.disabled = false;
  }
}

async function requestPasswordResetOtp() {
  try {
    assertOtpRequestInputs("reset-password");
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    authSubmitBtn.disabled = true;
    const formData = new FormData(authForm);
    const payload = {
      email: String(formData.get("email") || "").trim()
    };
    const data = await apiRequest("/api/auth/password-reset/request-otp", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    if (data.deliveryStatus !== "sent") {
      passwordResetOtpIssued = false;
      clearOtpTimer();
      const message = data.message || "OTP was not sent. Please try again.";
      setOtpTimerMessage(message, "expired");
      authMessage.textContent = message;
      setDashboardMessage(message, "error");
      return;
    }

    passwordResetOtpIssued = true;
    passwordResetOtpContext = {
      email: normalizeAuthEmail(payload.email)
    };
    startOtpCountdown(payload.email, "reset", data.expiresInSeconds, formatOtpDeliveryDetail(data, payload.email));
    authMessage.textContent = "Password reset OTP sent. Check your inbox and spam folder.";
    setDashboardMessage(authMessage.textContent, "success");
    authOtpInput.focus();
  } catch (error) {
    if (error.deliveryStatus === "not_sent") {
      passwordResetOtpIssued = false;
    }
    const message =
      error.deliveryStatus === "not_sent"
        ? "OTP could not be sent. Please try again."
        : error.message;
    clearOtpTimer();
    setOtpTimerMessage(formatOtpErrorDetail(error), "expired");
    authMessage.textContent = message;
    setDashboardMessage(message, "error");
    sendOtpBtn.textContent = passwordResetOtpIssued ? "Resend OTP" : "Send OTP";
  } finally {
    if (!otpTimer) {
      sendOtpBtn.disabled = false;
      sendOtpBtn.textContent = passwordResetOtpIssued ? "Resend OTP" : "Send OTP";
    }
    authSubmitBtn.disabled = false;
  }
}

function requestActiveOtp() {
  if (authMode === "reset-password") {
    return requestPasswordResetOtp();
  }

  return requestRegistrationOtp();
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  return Number.isNaN(date.getTime()) ? new Date().toLocaleString() : date.toLocaleString();
}

function buildGoogleMapsUrl(location, mapLocation) {
  if (mapLocation?.lat && mapLocation?.lng) {
    return `https://www.google.com/maps/search/?api=1&query=${mapLocation.lat},${mapLocation.lng}`;
  }

  if (location && String(location).trim()) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location.trim())}`;
  }

  return "https://www.google.com/maps";
}

function buildGoogleMapsEmbedUrl(location, mapLocation) {
  if (mapLocation?.lat && mapLocation?.lng) {
    return `https://www.google.com/maps?q=${mapLocation.lat},${mapLocation.lng}&output=embed`;
  }

  if (location && String(location).trim()) {
    return `https://www.google.com/maps?q=${encodeURIComponent(location.trim())}&output=embed`;
  }

  return "";
}

function setPdfButtonState(enabled) {
  generatePdfBtn.disabled = !enabled;
  emailBbmpBtn.disabled = !enabled;
  informClosedOnesBtn.disabled = !enabled;
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

function beginSubmissionProgress(hasImage) {
  clearEmailProgressTimer();
  emailProgress.dataset.state = "working";
  const stages = hasImage
    ? [
        [8, "Uploading image evidence..."],
        [24, "Analyzing the visible scene..."],
        [46, "Checking hazards and confidence..."],
        [66, "Selecting the ward and department..."],
        [82, "Applying checked report context..."],
        [93, "Saving the complaint..."]
      ]
    : [
        [10, "Analyzing complaint details..."],
        [42, "Checking hazards and confidence..."],
        [68, "Selecting the ward and department..."],
        [82, "Applying checked report context..."],
        [90, "Saving the complaint..."]
      ];
  let index = 0;
  setEmailProgress(stages[0][0], stages[0][1]);
  emailProgressTimer = window.setInterval(() => {
    index = Math.min(index + 1, stages.length - 1);
    setEmailProgress(stages[index][0], stages[index][1]);
    if (index === stages.length - 1) clearEmailProgressTimer();
  }, 1800);
}

function finishReportProgress(success, label) {
  clearEmailProgressTimer();
  emailProgress.dataset.state = success ? "success" : "error";
  setEmailProgress(100, label || (success ? "Completed successfully." : "The operation could not be completed."));
}

function clearEmailProgressTimer() {
  if (emailProgressTimer) {
    window.clearInterval(emailProgressTimer);
    emailProgressTimer = null;
  }
}

function beginEmailProgress() {
  clearEmailProgressTimer();
  emailProgress.dataset.state = "working";
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
      nextLabel = "Encoding report for authority delivery...";
    } else if (nextValue >= 82) {
      nextLabel = "Contacting authority mail server...";
    }

    setEmailProgress(nextValue, nextLabel);
  }, 280);
}

function finishEmailProgress(success = true) {
  finishReportProgress(success, success ? "Complaint email sent successfully." : "Complaint email could not be sent.");
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

function showTypedLocationOnMap() {
  const location = reportLocationInput.value.trim();
  if (!location && !currentReportMapLocation) {
    setDashboardMessage("Add a location before opening the map preview.", "error");
    return;
  }

  const mapQuery = currentReportMapLocation
    ? `${currentReportMapLocation.lat},${currentReportMapLocation.lng}`
    : location;
  updateLiveLocationMap(location || "Current location", mapQuery);
  locationPreviewTitle.textContent = location || "Current location";
  locationPreviewCaption.textContent = `Map preview for ${location || "the selected coordinates"}. Close this window to continue the report.`;
  locationPreviewFrame.src = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  locationPreviewOverlay.hidden = false;
  document.body.classList.add("auth-open");
  focusDialog(locationPreviewOverlay);
}

function closeLocationPreview() {
  if (!locationPreviewOverlay || locationPreviewOverlay.hidden) return;
  locationPreviewOverlay.hidden = true;
  locationPreviewFrame.removeAttribute("src");
  restoreDialogFocus(locationPreviewOverlay);
  if (authOverlay?.hidden !== false && faqOverlay?.hidden !== false && complaintDetailOverlay?.hidden !== false) {
    document.body.classList.remove("auth-open");
  }
}

function resetWeatherPreview(message = "Add a location, then press Check Weather to retrieve current conditions.") {
  weatherPreviewRequestId += 1;
  lastWeatherPreviewLocation = "";
  activeWeatherPreviewLocation = "";
  currentWeatherContextToken = "";
  weatherPreviewPanel.dataset.state = "idle";
  weatherPreviewTitle.textContent = "Add a location to check current conditions";
  weatherPreviewBadge.textContent = "Not checked";
  weatherPreviewMetrics.hidden = true;
  weatherPreviewMetrics.innerHTML = "";
  weatherPreviewNote.textContent = message;
}

function renderWeatherPreview(weather = {}) {
  if (weather.status !== "available") {
    weatherPreviewPanel.dataset.state = "unavailable";
    weatherPreviewTitle.textContent = "Local conditions are unavailable";
    weatherPreviewBadge.textContent = "Unavailable";
    weatherPreviewMetrics.hidden = true;
    weatherPreviewMetrics.innerHTML = "";
    weatherPreviewNote.textContent = weather.reason || "The complaint can still be submitted without current conditions.";
    return;
  }

  weatherPreviewPanel.dataset.state = "available";
  weatherPreviewTitle.textContent = weather.locationName || reportLocationInput.value.trim() || "Bengaluru";
  weatherPreviewBadge.textContent = weather.cached ? "Recently checked" : "Updated";
  weatherPreviewMetrics.hidden = false;
  weatherPreviewMetrics.innerHTML = [
    ["Condition", weather.condition || "Not recorded"],
    ["Temperature", formatWeatherValue(weather.temperatureC, "°C")],
    ["Rain", formatWeatherValue(weather.precipitationMm, " mm")],
    ["Wind", formatWeatherValue(weather.windKph, " km/h")]
  ]
    .map(([label, value]) => `<div><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong></div>`)
    .join("");
  const humidity = formatWeatherValue(weather.humidity, "%");
  const observation = weather.observedAt ? ` Observed ${weather.observedAt}.` : "";
  weatherPreviewNote.textContent = weather.note || `Humidity ${humidity}.${observation}`;
}

function getWeatherIssueContext() {
  return [
    typedComplaintInput?.value,
    voiceTranscriptInput?.value,
    aiImageDescription?.value
  ]
    .map((value) => String(value || "").trim())
    .filter(Boolean)
    .join(" ");
}

async function requestWeatherPreview() {
  const location = reportLocationInput.value.trim();
  if (!location && !currentReportMapLocation) {
    resetWeatherPreview("Add a Bengaluru location before checking current conditions.");
    return;
  }
  if (!authState?.token) {
    resetWeatherPreview("Login before checking current conditions.");
    return;
  }

  const locationKey = `${location}|${currentReportMapLocation?.lat || ""}|${currentReportMapLocation?.lng || ""}`;
  if (weatherPreviewPanel.dataset.state === "loading" && activeWeatherPreviewLocation === locationKey) {
    return;
  }
  const requestId = ++weatherPreviewRequestId;
  activeWeatherPreviewLocation = locationKey;
  checkWeatherBtn.disabled = true;
  weatherPreviewPanel.dataset.state = "loading";
  weatherPreviewTitle.textContent = "Checking current conditions";
  weatherPreviewBadge.textContent = "Checking";
  weatherPreviewMetrics.hidden = true;
  weatherPreviewNote.textContent = "Using the report location to retrieve a recent observation.";

  try {
    const data = await apiRequest("/api/context/weather-preview", {
      method: "POST",
      body: JSON.stringify({
        location,
        mapLocation: currentReportMapLocation,
        issueContext: getWeatherIssueContext()
      })
    });
    if (requestId !== weatherPreviewRequestId) return;
    lastWeatherPreviewLocation = locationKey;
    activeWeatherPreviewLocation = "";
    renderWeatherPreview(data.weather || {});
    currentWeatherContextToken = String(data.contextToken || "");
  } catch (error) {
    if (requestId !== weatherPreviewRequestId) return;
    activeWeatherPreviewLocation = "";
    weatherPreviewPanel.dataset.state = "unavailable";
    weatherPreviewTitle.textContent = "Local conditions are unavailable";
    weatherPreviewBadge.textContent = "Unavailable";
    weatherPreviewMetrics.hidden = true;
    weatherPreviewNote.textContent = error.message || "The complaint can still be submitted without current conditions.";
  } finally {
    if (requestId === weatherPreviewRequestId) {
      checkWeatherBtn.disabled = false;
    }
  }
}

function resetCivicContext({ imageReady = false, message = "" } = {}) {
  civicContextRequestId += 1;
  currentCivicContextToken = "";
  civicContextPanel.dataset.state = imageReady ? "idle" : "locked";
  civicContextTitle.textContent = imageReady ? "Ready to check civic context" : "Complete image analysis first";
  civicContextBadge.textContent = imageReady ? "Ready" : "Locked";
  civicContextNote.textContent = message || (
    imageReady
      ? "Use the completed image analysis and location to find relevant civic information."
      : "After image analysis, check relevant official resources and recent public updates for this location."
  );
  civicContextResults.hidden = true;
  civicContextResults.innerHTML = "";
  checkCivicContextBtn.disabled = !imageReady;
}

function renderCivicContext(evidence = {}) {
  const officialLinks = renderPostSubmitLinks(evidence.officialSources || []);
  const publicLinks = renderPostSubmitLinks(evidence.publicContext || []);
  if (evidence.status !== "available") {
    civicContextPanel.dataset.state = "unavailable";
    civicContextTitle.textContent = "Civic context is unavailable";
    civicContextBadge.textContent = "Unavailable";
    civicContextNote.textContent = evidence.reason || "The complaint can still be submitted without civic context.";
    civicContextResults.hidden = true;
    return;
  }

  civicContextPanel.dataset.state = "available";
  const incident = String(evidence.incidentSummary || "the detected civic issue").trim();
  const area = String(evidence.searchArea || reportLocationInput.value.trim() || "this area").trim();
  civicContextTitle.textContent = `Area context for ${incident}`;
  civicContextBadge.textContent = "Available";
  civicContextNote.textContent = `Results relate the image-detected problem to ${area}. Supporting information does not determine severity or routing.`;
  civicContextResults.hidden = false;
  civicContextResults.innerHTML = `
    <section>
      <h4>Official resources</h4>
      ${officialLinks ? `<div class="post-submit-link-list">${officialLinks}</div>` : "<p class=\"helper-text\">No verified official result was found.</p>"}
    </section>
    <section>
      <h4>Area updates</h4>
      ${publicLinks ? `<div class="post-submit-link-list">${publicLinks}</div>` : "<p class=\"helper-text\">No relevant public update was found.</p>"}
    </section>
  `;
}

async function requestCivicContextPreview() {
  const location = reportLocationInput.value.trim();
  if (!currentImageAnalysisToken) {
    resetCivicContext({ message: "Complete image analysis before checking civic context." });
    return;
  }
  if (!location && !currentReportMapLocation) {
    resetCivicContext({ imageReady: true, message: "Add a Bengaluru location before checking civic context." });
    return;
  }
  if (!authState?.token) {
    resetCivicContext({ imageReady: true, message: "Login before checking civic context." });
    return;
  }

  const requestId = ++civicContextRequestId;
  checkCivicContextBtn.disabled = true;
  civicContextPanel.dataset.state = "loading";
  civicContextTitle.textContent = "Checking civic context";
  civicContextBadge.textContent = "Checking";
  civicContextNote.textContent = "Finding official resources and recent public information for the analyzed incident.";
  civicContextResults.hidden = true;

  try {
    const data = await apiRequest("/api/context/civic-preview", {
      method: "POST",
      body: JSON.stringify({
        location,
        mapLocation: currentReportMapLocation,
        imageAnalysisToken: currentImageAnalysisToken
      })
    });
    if (requestId !== civicContextRequestId) return;
    currentCivicContextToken = String(data.contextToken || "");
    renderCivicContext(data.civicEvidence || {});
  } catch (error) {
    if (requestId !== civicContextRequestId) return;
    civicContextPanel.dataset.state = "unavailable";
    civicContextTitle.textContent = "Civic context is unavailable";
    civicContextBadge.textContent = "Unavailable";
    civicContextNote.textContent = error.message || "The complaint can still be submitted without civic context.";
  } finally {
    if (requestId === civicContextRequestId) {
      checkCivicContextBtn.disabled = !currentImageAnalysisToken;
    }
  }
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
      currentReportMapLocation = {
        lat: Number(latitude.toFixed(6)),
        lng: Number(longitude.toFixed(6))
      };
      resetWeatherPreview("Location changed. Press Check Weather to retrieve current conditions.");
      resetCivicContext({
        imageReady: Boolean(currentImageAnalysisToken),
        message: "Location changed. Check civic context again for this location."
      });
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

function createClientRequestId() {
  if (window.crypto?.randomUUID) return window.crypto.randomUUID();
  return `web-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`;
}

async function apiRequest(path, options = {}) {
  let response;
  const requestId = String(options.requestId || createClientRequestId());

  try {
    response = await fetch(path, {
      ...options,
      headers: {
        ...getAuthHeaders(),
        "X-Request-ID": requestId,
        ...(options.headers || {})
      }
    });
  } catch (_error) {
    const error = new Error("Unable to reach the server. Make sure the app is running and refresh the page.");
    error.requestId = requestId;
    error.failureStage = "browser_to_web";
    throw error;
  }

  const responseText = await response.text();
  let data = {};
  try {
    data = responseText ? JSON.parse(responseText) : {};
  } catch (_error) {
    data = {};
  }

  if (!response.ok) {
    const errorMessage = data.error || `Request failed with status ${response.status}.`;
    const isAuthFailure = response.status === 401 || /jwt|token|bearer/i.test(errorMessage);

    if (isAuthFailure && authState?.token) {
      clearAuthState("Your previous session is no longer valid. Please login again.");
      openAuthOverlay("login");
    }

    const error = new Error(errorMessage);
    error.status = response.status;
    error.code = data.code || "";
    error.deliveryStatus = data.deliveryStatus || "";
    error.retryable = data.retryable;
    error.requestId = data.requestId || response.headers.get("X-Request-ID") || requestId;
    error.failureStage = data.failureStage || "web_api";
    throw error;
  }

  if (data && typeof data === "object" && !data.requestId) {
    data.requestId = response.headers.get("X-Request-ID") || requestId;
  }
  return data;
}

function renderRecentComplaints(complaints) {
  const recentMarkup = complaints
    .slice(0, 3)
    .map(
      (complaint) => `
        <button type="button" class="mini-item" data-complaint-id="${escapeHtml(complaint._id || "")}">
          <div class="mini-item-copy">
            <strong>${escapeHtml(complaint.type)}</strong>
            <span class="mini-item-location">${escapeHtml(complaint.location)}</span>
            <span class="mini-item-meta">${escapeHtml(complaint.status || "Queued")} · ${escapeHtml(formatDateTime(complaint.createdAt))}</span>
          </div>
          <span class="mini-chevron">›</span>
        </button>
      `
    )
    .join("");

  document.getElementById("recentComplaints").innerHTML =
    recentMarkup || `<div class="table-row empty-state"><span>No recent complaints. Report an issue to get started.</span></div>`;
}

function renderMetrics(metrics) {
  const totalComplaints = Number(metrics?.totalComplaints || 0);
  const openComplaints = Number(metrics?.openComplaints || 0);
  document.getElementById("totalComplaints").textContent = totalComplaints;
  document.getElementById("openComplaints").textContent = openComplaints;
  document.getElementById("resolvedCount").textContent = Math.max(0, totalComplaints - openComplaints);
  const broadcastCount = document.getElementById("broadcastCount");
  if (broadcastCount) {
    broadcastCount.textContent = metrics?.emergencyBroadcasts || 0;
  }
  const incidentCount = document.getElementById("incidentCount");
  if (incidentCount) {
    incidentCount.textContent = metrics?.activeIncidents || 0;
  }
  const clusterCount = document.getElementById("clusterCount");
  if (clusterCount) {
    clusterCount.textContent = metrics?.activeClusters || 0;
  }
}

function getFilteredComplaints(complaints = []) {
  const search = normalizeSearchValue(complaintSearchInput?.value);
  const statusFilter = complaintStatusFilter?.value || "";
  const sortMode = complaintSortSelect?.value || "newest";

  const filtered = complaints.filter((complaint) => {
    const matchesSearch =
      !search ||
      [complaint.type, complaint.location, complaint.status, complaint.assignedAuthority, complaint.description]
        .some((value) => normalizeSearchValue(value).includes(search));
    const matchesStatus = !statusFilter || complaint.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  filtered.sort((left, right) => {
    if (sortMode === "priority") {
      return priorityRank(right.priority) - priorityRank(left.priority);
    }
    if (sortMode === "oldest") {
      return new Date(left.createdAt || 0) - new Date(right.createdAt || 0);
    }
    return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
  });

  return filtered;
}

function getFilteredAlerts(complaints = []) {
  const search = normalizeSearchValue(alertSearchInput?.value);
  const priority = alertPriorityFilter?.value || "";

  return complaints
    .filter((complaint) => (!priority || complaint.priority === priority) && Array.isArray(complaint.alerts) && complaint.alerts.length)
    .flatMap((complaint) =>
      complaint.alerts.slice(-2).map((alertText) => ({
        id: complaint._id,
        type: complaint.type,
        location: complaint.location,
        priority: complaint.priority,
        text: alertText
      }))
    )
    .filter((alert) => {
      if (!search) {
        return true;
      }

      return [alert.type, alert.location, alert.text, alert.priority].some((value) => normalizeSearchValue(value).includes(search));
    });
}

function getFilteredUsers(users = []) {
  const search = normalizeSearchValue(userSearchInput?.value);
  const state = userStateFilter?.value || "";

  return users.filter((user) => {
    const isDisabled = Boolean(user.disabledAt);
    const matchesSearch =
      !search || [user.username, user.email, user.role].some((value) => normalizeSearchValue(value).includes(search));
    const matchesState = !state || (state === "disabled" ? isDisabled : !isDisabled);
    return matchesSearch && matchesState;
  });
}

function renderAdminInsights(complaints = [], analytics = null) {
  if (!adminInsights) {
    return;
  }

  if (!complaints.length) {
    adminInsights.innerHTML = "";
    return;
  }

  const reviewCount = complaints.filter((complaint) => complaint.status === "Needs Review").length;
  const criticalCount = complaints.filter((complaint) => complaint.priority === "Critical" || complaint.priority === "High").length;
  const averageConfidence = complaints.length
    ? Math.round(
        complaints.reduce((sum, complaint) => sum + Number(complaint.confidence || 0), 0) / complaints.length
      )
    : 0;
  const topIssue = analytics?.topIssue?.label || complaints[0]?.type || "No category";
  const topAuthority = analytics?.topAuthority?.label || complaints[0]?.assignedAuthority || "No routing";
  const hotspot = summarizeHotspot(complaints);
  const oldestOpenCase = complaints
    .filter((complaint) => complaint.status !== "Resolved")
    .sort((left, right) => new Date(left.createdAt || 0) - new Date(right.createdAt || 0))[0];
  const resolutionRate = complaints.length
    ? Math.round((complaints.filter((complaint) => complaint.status === "Resolved").length / complaints.length) * 100)
    : 0;

  adminInsights.innerHTML = `
    <article class="insight-card">
      <span>Needs review</span>
      <strong>${reviewCount}</strong>
      <p>Complaints that should be checked by an admin before routing.</p>
    </article>
    <article class="insight-card">
      <span>High priority</span>
      <strong>${criticalCount}</strong>
      <p>Complaints marked as high or critical.</p>
    </article>
    <article class="insight-card">
      <span>Average confidence</span>
      <strong>${averageConfidence}%</strong>
      <p>Current average AI confidence across loaded complaints.</p>
    </article>
    <article class="insight-card">
      <span>Top issue</span>
      <strong>${escapeHtml(topIssue)}</strong>
      <p>Most common issue in the current dashboard result set.</p>
    </article>
    <article class="insight-card">
      <span>Main authority</span>
      <strong>${escapeHtml(topAuthority)}</strong>
      <p>Most common routing target in the current dashboard result set.</p>
    </article>
    <article class="insight-card">
      <span>Main hotspot</span>
      <strong>${escapeHtml(hotspot)}</strong>
      <p>Location with the highest visible complaint concentration.</p>
    </article>
    <article class="insight-card">
      <span>Oldest open case</span>
      <strong>${oldestOpenCase ? pluralize(countDaysOpen(oldestOpenCase.createdAt), "day") : "No open case"}</strong>
      <p>${oldestOpenCase ? escapeHtml(oldestOpenCase.location || oldestOpenCase.type || "Open case") : "All visible complaints are resolved."}</p>
    </article>
    <article class="insight-card">
      <span>Resolution rate</span>
      <strong>${resolutionRate}%</strong>
      <p>Share of visible complaints already marked as resolved.</p>
    </article>
  `;
}

function renderAiObservability(observability = null) {
  if (!aiObservabilityPanel) return;
  if (!observability) {
    aiObservabilityPanel.innerHTML = "";
    return;
  }
  const current = observability.windows?.current || {};
  const shifts = observability.shifts || {};
  const statusLabel = String(observability.status || "insufficient_data").replace(/_/g, " ");
  const metric = (label, value, detail) => `<article class="observability-metric"><span>${escapeHtml(label)}</span><strong>${escapeHtml(value)}</strong><p>${escapeHtml(detail)}</p></article>`;
  aiObservabilityPanel.innerHTML = `
    <div class="observability-head">
      <div><span class="observability-status status-${formatTokenLabel(observability.status)}">${escapeHtml(statusLabel)}</span><p>${escapeHtml(observability.note || "")}</p></div>
      <small>${escapeHtml(String(observability.windowDays || 30))}-day window · ${escapeHtml(String(current.samples || 0))} samples</small>
    </div>
    <div class="observability-grid">
      ${metric("Confidence", `${Math.round(current.averageConfidence || 0)}%`, `${shifts.confidencePoints >= 0 ? "+" : ""}${shifts.confidencePoints || 0} points vs prior window`)}
      ${metric("Needs review", `${Math.round((current.reviewRequiredRate || 0) * 100)}%`, `${Math.round((shifts.reviewRequiredRate || 0) * 100)} point rate shift`)}
      ${metric("Corrections", `${Math.round((current.correctionRate || 0) * 100)}%`, `${current.reviewedEvents || 0} reviewed events`)}
      ${metric("Fallback", `${Math.round((current.fallbackRate || 0) * 100)}%`, `${Math.round((shifts.fallbackRate || 0) * 100)} point rate shift`)}
      ${metric("Category drift", Number(shifts.categoryDivergence || 0).toFixed(3), "Jensen-Shannon divergence")}
      ${metric("Severity drift", Number(shifts.severityDivergence || 0).toFixed(3), "Jensen-Shannon divergence")}
    </div>
    <div class="observability-alerts">${(observability.alerts || []).map((alert) => `<p class="observability-alert ${escapeHtml(alert.level)}"><strong>${escapeHtml(alert.code.replace(/_/g, " "))}</strong>${escapeHtml(alert.message)}</p>`).join("") || "<p>No drift alert is active.</p>"}</div>`;
}

function renderDigitalTwin(digitalTwin = null) {
  const panel = document.getElementById("digitalTwinPanel");
  if (!panel) return;

  if (!digitalTwin) {
    panel.innerHTML = "";
    return;
  }

  const weakestZones = (digitalTwin.zones || []).slice(0, 3);
  panel.innerHTML = `
    <article class="insight-card">
      <span>Civic health</span>
      <strong>${digitalTwin.cityHealthScore ?? 100}</strong>
      <p>${escapeHtml(digitalTwin.cityHealthBand || "Stable")} citywide digital twin score.</p>
    </article>
    <article class="insight-card">
      <span>Stressed zones</span>
      <strong>${digitalTwin.summary?.stressedZones || 0}</strong>
      <p>${digitalTwin.summary?.totalZones || 0} zone${digitalTwin.summary?.totalZones === 1 ? "" : "s"} currently modeled.</p>
    </article>
    <article class="insight-card">
      <span>Active incidents</span>
      <strong>${digitalTwin.summary?.activeIncidents || 0}</strong>
      <p>Command-center cases influencing civic risk.</p>
    </article>
    <article class="insight-card">
      <span>Weakest zone</span>
      <strong>${escapeHtml(weakestZones[0]?.zone || "No zone")}</strong>
      <p>${weakestZones[0] ? `${weakestZones[0].healthBand}: ${escapeHtml(weakestZones[0].recommendation)}` : "No complaint pressure detected."}</p>
    </article>
  `;
}

function riskBandClass(band) {
  return `risk-band-${formatTokenLabel(band || "low")}`;
}

function renderRiskPredictions(riskPredictions = null) {
  const panel = document.getElementById("riskPredictionPanel");
  if (!panel) return;

  if (!riskPredictions) {
    panel.innerHTML = "";
    return;
  }

  const predictions = riskPredictions.predictions || [];
  if (!predictions.length) {
    panel.innerHTML = `<div class="table-row empty-state"><span>No predictive risk signals yet. Forecasts appear after complaint patterns form.</span></div>`;
    return;
  }

  const summary = riskPredictions.summary || {};
  const topPredictions = predictions.slice(0, 4);
  panel.innerHTML = `
    <div class="risk-forecast-summary">
      <article class="insight-card">
        <span>Highest risk</span>
        <strong>${summary.highestRiskScore || 0}</strong>
        <p>${escapeHtml(summary.highestRiskZone || "No zone")} · ${escapeHtml(summary.primaryRisk || "No dominant issue")}</p>
      </article>
      <article class="insight-card">
        <span>Severe zones</span>
        <strong>${summary.severeZones || 0}</strong>
        <p>${summary.highZones || 0} high-risk zone${summary.highZones === 1 ? "" : "s"} in the 72h forecast.</p>
      </article>
      <article class="insight-card">
        <span>Forecast horizon</span>
        <strong>${riskPredictions.horizonHours || 72}h</strong>
        <p>Predictions use recent complaints, weather context, incidents, and repeat patterns.</p>
      </article>
    </div>
    <div class="risk-forecast-list">
      ${topPredictions
        .map(
          (prediction) => `
            <article class="risk-forecast-card ${riskBandClass(prediction.band)}">
              <div>
                <span>${escapeHtml(prediction.band || "Low")} risk · ${prediction.score || 0}/100</span>
                <strong>${escapeHtml(prediction.zone || "Unknown zone")}</strong>
                <p>${escapeHtml(prediction.likelyIssue || "Civic issue")} likely within ${prediction.horizonHours || 72}h · ${escapeHtml(prediction.confidenceLabel || "Early signal")}</p>
              </div>
              <p>${escapeHtml((prediction.drivers || []).slice(0, 3).join(" · ") || prediction.recommendation || "No strong drivers recorded.")}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderCivicIntelligence(intelligence = null) {
  if (!civicIntelligencePanel) return;
  if (!intelligence) {
    civicIntelligencePanel.innerHTML = "";
    return;
  }
  const waves = intelligence.radar || [];
  const scenarios = intelligence.scenarios || [];
  civicIntelligencePanel.innerHTML = `
    <article class="intelligence-card radar-card">
      <p class="detail-section-label">Urban Pulse Radar</p>
      <strong>${escapeHtml(intelligence.summary?.strongestZone || "No active zone")}</strong>
      <p>${waves.length} active risk wave${waves.length === 1 ? "" : "s"} · strongest intensity ${intelligence.summary?.strongestIntensity || 0}/100.</p>
      <div class="radar-wave-list">${waves.slice(0, 4).map((wave) => `<span><i style="--wave-intensity:${wave.intensity}"></i>${escapeHtml(wave.zone)} · ${wave.intensity}</span>`).join("") || "<span>No open incidents to visualize.</span>"}</div>
    </article>
    <article class="intelligence-card scenario-card">
      <p class="detail-section-label">If no action is taken</p>
      <strong>${escapeHtml(scenarios[0]?.band || "No active scenario")}</strong>
      <p>${escapeHtml(scenarios[0]?.type || "Open complaints will produce constrained response scenarios here.")}</p>
      <small>${escapeHtml(scenarios[0]?.disclaimer || "Scenarios are planning aids, not future facts.")}</small>
    </article>
  `;
}

function renderCommunityCases(cases = []) {
  if (!communityCasesPanel) return;
  if (!authState?.token) {
    communityCasesPanel.innerHTML = "";
    return;
  }
  if (authState?.permissions?.includes("view_dashboard")) {
    communityCasesPanel.innerHTML = "";
    return;
  }

  if (!localAlertPreferences?.enabled) {
    communityCasesPanel.innerHTML = `
      <article class="community-cases-empty">
        <p class="detail-section-label">Community verification</p>
        <strong>Enable local alerts to help verify nearby incidents.</strong>
        <p>Your saved areas are used for matching. Reporter details and complaint evidence stay private.</p>
      </article>`;
    return;
  }

  if (!cases.length) {
    communityCasesPanel.innerHTML = `
      <article class="community-cases-empty">
        <p class="detail-section-label">Community verification</p>
        <strong>No matching open incidents.</strong>
        <p>New incidents at or above your selected severity will appear here.</p>
      </article>`;
    return;
  }

  communityCasesPanel.innerHTML = `
    <div class="community-cases-head">
      <div><p class="detail-section-label">Community verification</p><strong>Nearby incidents</strong></div>
      <span>${cases.length} matched</span>
    </div>
    <div class="community-cases-grid">
      ${cases.map((item) => `
        <article class="community-case-card" data-community-case-id="${escapeHtml(item.id)}">
          <div class="community-case-meta"><span>${escapeHtml(item.priority)}</span><span>${escapeHtml(item.status)}</span></div>
          <strong>${escapeHtml(item.type)}</strong>
          <p>${escapeHtml(item.area)} · ${escapeHtml(formatDateTime(item.createdAt))}</p>
          <small>${item.communityProof?.summary?.trustedTotal ?? item.communityProof?.summary?.total ?? 0} verified response${(item.communityProof?.summary?.trustedTotal ?? item.communityProof?.summary?.total) === 1 ? "" : "s"} · ${escapeHtml(String(item.communityProof?.summary?.latestStatus || "unverified").replace(/_/g, " "))}${item.communityProof?.userSignal ? ` · You marked ${escapeHtml(item.communityProof.userSignal.replace(/_/g, " "))}` : ""}</small>
          <div class="verification-actions">
            <button type="button" class="chip-button nearby-proof-btn" data-signal="still_present">Still present</button>
            <button type="button" class="chip-button nearby-proof-btn" data-signal="worsening">Getting worse</button>
            <button type="button" class="chip-button nearby-proof-btn" data-signal="resolved">Resolved</button>
            <button type="button" class="chip-button nearby-proof-btn" data-signal="duplicate">Duplicate</button>
          </div>
        </article>`).join("")}
    </div>`;

  communityCasesPanel.querySelectorAll(".nearby-proof-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const complaintId = button.closest("[data-community-case-id]")?.dataset.communityCaseId;
      if (!complaintId) return;
      try {
        button.disabled = true;
        const note = window.prompt("Optional note about what you can currently observe:") || "";
        const duplicateComplaintId = button.dataset.signal === "duplicate"
          ? (window.prompt("Enter the complaint ID this may duplicate:") || "").trim()
          : "";
        if (button.dataset.signal === "duplicate" && !duplicateComplaintId) {
          button.disabled = false;
          return;
        }
        const data = await apiRequest(`/api/complaints/${complaintId}/community-verification`, {
          method: "POST",
          body: JSON.stringify({ signal: button.dataset.signal, note, duplicateComplaintId })
        });
        setDashboardMessage(data.message || "Community verification recorded.", "success");
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });
}

function renderIncidentCommands(commands = []) {
  const panel = document.getElementById("incidentCommandPanel");
  if (!panel) return;

  if (!commands.length) {
    panel.innerHTML = `<div class="table-row empty-state"><span>No active incident command rooms. High-risk cases will appear here automatically.</span></div>`;
    return;
  }

  panel.innerHTML = commands
    .map((command) => {
      const total = command.checklist?.length || 0;
      const done = (command.checklist || []).filter((item) => item.status === "done").length;
      return `
        <div class="table-row">
          <div>
            <strong>${escapeHtml(command.incidentCode || "Incident")}: ${escapeHtml(command.title || "Civic incident")}</strong>
            <span>${escapeHtml(command.assignedUnit || command.assignedDepartment || "Response unit")} · ${escapeHtml(command.ward || "Citywide")}</span>
          </div>
          <div>
            <strong>${escapeHtml(command.commandStatus || "Active")}</strong>
            <span>SLA ${escapeHtml(formatDateTime(command.slaDueAt))} · checklist ${done}/${total}</span>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderIncidentClusters(clusters = []) {
  if (!incidentClusterPanel) return;

  if (!clusters.length) {
    incidentClusterPanel.innerHTML = `<div class="table-row empty-state"><span>No merged incident clusters yet. Similar reports will group here automatically.</span></div>`;
    return;
  }

  incidentClusterPanel.innerHTML = clusters
    .map(
      (cluster) => `
        <div class="table-row">
          <div>
            <strong>${escapeHtml(cluster.clusterCode || "Cluster")}: ${escapeHtml(cluster.title || cluster.issueType || "Civic incident")}</strong>
            <span>${escapeHtml(cluster.area || cluster.location || "Unknown area")} · ${escapeHtml(cluster.issueType || "Issue")}</span>
          </div>
          <div>
            <strong>${cluster.mergedCount || cluster.complaintIds?.length || 1} reports</strong>
            <span>${escapeHtml(cluster.matchReason || "Similarity-based incident grouping")} · ${Math.round(Number(cluster.confidence || 0) * 100)}%</span>
          </div>
        </div>
      `
    )
    .join("");
}

function formatTokenLabel(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function countDaysOpen(value) {
  const createdAt = new Date(value || Date.now()).getTime();
  if (Number.isNaN(createdAt)) {
    return 0;
  }
  return Math.max(0, Math.floor((Date.now() - createdAt) / 86400000));
}

function confidenceTone(complaint) {
  const confidenceValue = Number(complaint?.confidence || 0);
  if (confidenceValue >= 80) {
    return "High confidence";
  }
  if (confidenceValue >= 60) {
    return "Moderate confidence";
  }
  return "Needs review";
}

function summarizeHotspot(complaints = []) {
  const counts = complaints.reduce((accumulator, complaint) => {
    const key = String(complaint.location || "Unknown").trim() || "Unknown";
    accumulator[key] = (accumulator[key] || 0) + 1;
    return accumulator;
  }, {});

  const [label, count] = Object.entries(counts).sort((left, right) => right[1] - left[1])[0] || [];
  return label ? `${label} (${pluralize(count, "case")})` : "No area selected";
}

function severityBadge(priority) {
  const label = priority || "Low";
  return `<span class="info-chip severity-chip severity-${formatTokenLabel(label)}">${escapeHtml(label)}</span>`;
}

function authorityBadge(authority) {
  const label = authority || "Gram Panchayat";
  return `<span class="info-chip authority-chip authority-${formatTokenLabel(label)}">${escapeHtml(label)}</span>`;
}

function confidenceBadge(complaint) {
  const label = complaint?.ai?.confidenceLabel || (complaint?.confidence < 52 ? "Needs review" : "AI reviewed");
  return `<span class="info-chip confidence-chip">${escapeHtml(label)}</span>`;
}

function renderAnalysis(result) {
  const reviewText = result.explainability?.reviewRequired ? " It needs admin review because confidence is low." : "";
  const routeText = result.routing?.unit ? ` ${result.routing.unit} is assigned.` : "";
  const broadcastText = result.broadcast?.triggered ? ` Emergency broadcast ${result.broadcast.status}.` : "";
  const weatherText = result.weather?.note ? ` Weather context: ${result.weather.note}` : "";
  const threatText = result.threatAssessment?.threatLevel ? ` Threat level: ${result.threatAssessment.threatLevel}.` : "";
  const imageAnalysis = result.imageAnalysis || {};
  const detectedIssue = imageAnalysis.incident || result.nlp?.issueType || "Civic issue requiring review";
  setDashboardMessage(
    `Complaint logged with ${result.priority.level} severity and routed to ${result.assignedAuthority}.${routeText} Detected issue: ${detectedIssue}.${threatText}${reviewText}${broadcastText}${weatherText}`,
    result.explainability?.reviewRequired ? "info" : "success"
  );
  if (result.cv?.detected !== "No image uploaded") renderImageAnalysisResult(imageAnalysis);
}

function buildSubmittedReport(payload, result) {
  const finalAiDescription = result.imageAnalysis?.incident || result.nlp?.issueType || "No confirmed visual incident.";

  return {
    complaintId: result.complaintId || "Pending",
    submittedAt: new Date().toISOString(),
    reporter: authState?.username || "Citizen",
    role: authState?.role || "Citizen",
    city: { id: "bengaluru", name: "Bengaluru" },
    location: payload.location || "Unknown",
    textComplaint: payload.textComplaint || "No complaint text provided.",
    aiDescription: finalAiDescription,
    uploadedPhoto: currentImageDataUrl,
    googleMapsUrl: buildGoogleMapsUrl(payload.location, result.mapLocation),
    googleMapsEmbedUrl: buildGoogleMapsEmbedUrl(payload.location, result.mapLocation),
    issueType: result.nlp?.issueType || "Complaint",
    category: result.nlp?.category || "General",
    priority: result.priority?.level || "Low",
    assignedAuthority: result.assignedAuthority || "Gram Panchayat",
    routing: result.routing || result.explainability?.routing || null,
    broadcast: result.broadcast || result.explainability?.broadcast || null,
    incidentCommand: result.incidentCommand || result.explainability?.incidentCommand || null,
    incidentCluster: result.incidentCluster || null,
    followUp: result.followUp || null,
    verification: result.verification || null,
    communityProof: result.communityVerification || result.communityProof || null,
    decisionAudit: result.decisionAudit || null,
    weather: result.weather || result.explainability?.weather || null,
    civicEvidence: result.civicEvidence || result.explainability?.civicEvidence || null,
    areaIntelligence: result.areaIntelligence || result.explainability?.areaIntelligence || null,
    threatAssessment: result.threatAssessment || result.explainability?.threatAssessment || result.cv?.threatAssessment || null,
    visualObservations: result.cv?.observations || result.explainability?.visualObservations || null,
    imageAnalysis: result.imageAnalysis || null,
    status: result.status || "Queued",
    detection: result.cv?.detected || "No image analysis available",
    cvReason: result.cv?.reason || "Local AI matched the uploaded issue against known civic patterns.",
    notifications: Array.isArray(result.notifications) ? result.notifications : [],
    alerts: Array.isArray(result.alerts) ? result.alerts : [],
    mapLocation: result.mapLocation || null,
    explainability: result.explainability || null
    ,
    aiMeta: result.aiMeta || null
  };
}

function closeComplaintDetailOverlay() {
  if (!complaintDetailOverlay) return;
  complaintDetailOverlay.hidden = true;
  restoreDialogFocus(complaintDetailOverlay);
  if (authOverlay?.hidden !== false && faqOverlay?.hidden !== false) {
    document.body.classList.remove("auth-open");
  }
}

function renderStatusHistory(history = []) {
  if (!history.length) {
    return `<div class="table-row empty-state"><span>No status history recorded yet.</span></div>`;
  }

  return history
    .map(
      (entry) => `
        <div class="timeline-item status-history-row">
          <strong>${escapeHtml(entry.status)}</strong>
          <span>${escapeHtml(entry.changedBy || "system")} · ${escapeHtml(formatDateTime(entry.changedAt))}</span>
          <p>${escapeHtml(entry.note || "Status updated.")}</p>
        </div>
      `
    )
    .join("");
}

function renderVisionCandidates(candidates = []) {
  if (!candidates.length) {
    return `<div class="table-row empty-state"><span>No vision candidates recorded.</span></div>`;
  }

  return candidates
    .map(
      (candidate) => `
        <div class="table-row">
          <div>
            <strong>${escapeHtml(candidate.label || candidate.categoryLabel || "Candidate")}</strong>
            <span>${escapeHtml(candidate.categoryId || candidate.category_id || "")}</span>
          </div>
          <div>
            <strong>${Math.round(Number(candidate.confidence || 0) * 100)}%</strong>
            <span>${escapeHtml(candidate.source || "vision")}</span>
          </div>
        </div>
      `
    )
    .join("");
}

function renderVisualObservations(observations) {
  if (!observations?.description) {
    return `<div class="table-row empty-state"><span>No structured scene observation was recorded.</span></div>`;
  }
  const issues = (observations.detectedIssues || []).map((item) => item.issue || item.categoryLabel).filter(Boolean);
  const hazards = (observations.hazards || []).filter(Boolean);
  const infrastructure = (observations.affectedInfrastructure || []).filter(Boolean);
  const consistency = String(observations.textImageConsistency?.status || "not available").replaceAll("_", " ");
  const quality = String(observations.imageQuality?.status || "not available").replaceAll("_", " ");
  return `
    <div class="scene-observation-summary">
      <p>${escapeHtml(observations.description)}</p>
      <div class="detail-diagnostic-grid">
        <article class="detail-summary-card"><span>Visible issues</span><strong>${escapeHtml(issues.join(" · ") || "Not determined")}</strong></article>
        <article class="detail-summary-card"><span>Affected infrastructure</span><strong>${escapeHtml(infrastructure.join(" · ") || "Not determined")}</strong></article>
        <article class="detail-summary-card"><span>Hazards</span><strong>${escapeHtml(hazards.join(" · ") || "None confirmed")}</strong></article>
        <article class="detail-summary-card"><span>Image and text</span><strong>${escapeHtml(consistency)}</strong></article>
        <article class="detail-summary-card"><span>Image quality</span><strong>${escapeHtml(quality)}</strong></article>
        <article class="detail-summary-card"><span>Review</span><strong>${observations.humanReviewRecommended ? "Recommended" : "Not required by vision"}</strong></article>
      </div>
      ${observations.uncertainty?.reason ? `<p class="helper-text">${escapeHtml(observations.uncertainty.reason)}</p>` : ""}
    </div>`;
}

function renderAlertsHistory(alerts = []) {
  if (!alerts.length) {
    return `<div class="table-row empty-state"><span>No alert notes recorded for this complaint.</span></div>`;
  }

  return alerts
    .map(
      (alertText, index) => `
        <div class="timeline-item">
          <strong>Alert ${alerts.length - index}</strong>
          <p>${escapeHtml(alertText)}</p>
        </div>
      `
    )
    .join("");
}

function renderConfidenceBreakdown(confidenceBreakdown = {}) {
  const entries = Object.entries(confidenceBreakdown || {}).filter(([, value]) => typeof value === "number");
  if (!entries.length) {
    return `
      <article class="detail-diagnostic-card">
        <strong>No numeric breakdown available</strong>
        <p>The current AI run did not store separate decision weights for this complaint.</p>
      </article>
    `;
  }

  return entries
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3)
    .map(
      ([label, value]) => `
        <article class="detail-diagnostic-card">
          <span>${escapeHtml(label.replace(/([A-Z])/g, " $1").trim())}</span>
          <strong>${Math.round(Number(value) * 100)}%</strong>
          <p>Relative weight used in the stored AI decision breakdown.</p>
        </article>
      `
    )
    .join("");
}

function renderRoutingSummary(complaint, authorityTicket = null) {
  const routing = complaint.routing || {};
  if (!routing.unit && !routing.department) {
    return "Current authority assignment for this complaint.";
  }

  const workload = Number.isFinite(Number(routing.workloadScore))
    ? `${Math.round(Number(routing.workloadScore) * 100)}% workload`
    : "workload not recorded";
  return [
    `${routing.department || "Response department"} · ${routing.unit || "Response unit"}`,
    `${routing.ward || "Ward not identified"}${routing.wardCode ? ` (${routing.wardCode})` : ""} · ${routing.wardZone || "zone pending"}`,
    `Ward match: ${String(routing.wardMatchQuality || "legacy").replace(/_/g, " ")}${routing.wardRequiresConfirmation ? " · confirmation recommended" : ""}`,
    `${routing.escalationLevel || "Routine"} · ${workload}`,
    `Handoff: ${routing.handoff?.mode === "manual_portal" ? "official portal, manual submission" : routing.handoff?.mode || "not configured"}`,
    `Delivery: ${String(authorityTicket?.status || routing.deliveryStatus || "pending_handoff").replace(/_/g, " ")}`,
    `Escalation: ${routing.escalationDestination || "BBMP zonal administration"}`,
    routing.routingReason || ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderBroadcastSummary(complaint) {
  const broadcast = complaint.broadcast || {};
  if (!broadcast.triggered) {
    return "No emergency broadcast was required for this case.";
  }

  return [
    `Status: ${broadcast.status || "created"}`,
    `Recipients: ${broadcast.recipientCount || 0}`,
    broadcast.message || ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderAreaIntelligenceSummary(complaint) {
  const area = complaint.areaIntelligence || {};
  if (!area.provider) {
    return "Area intelligence was not recorded for this complaint.";
  }

  return [
    area.likelyArea ? `Likely area: ${area.likelyArea}` : "",
    (area.landmarkHints || []).length ? `Landmarks: ${(area.landmarkHints || []).slice(0, 3).join(", ")}` : "",
    (area.wardHints || []).length ? `Ward hints: ${(area.wardHints || []).slice(0, 3).join(", ")}` : "",
    `Match confidence: ${formatPercent(area.confidence)}`
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderIncidentSummary(complaint) {
  const incident = complaint.incidentCommand || {};
  if (!incident.triggered) {
    return "No incident command room was needed for this complaint.";
  }

  return [
    incident.incidentCode || "Incident command",
    `Status: ${incident.status || "Active"}`,
    incident.slaDueAt ? `SLA: ${formatDateTime(incident.slaDueAt)}` : "",
    incident.summary || ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderIncidentClusterSummary(complaint) {
  const cluster = complaint.incidentCluster || {};
  if (!cluster.clusterId && !cluster.clusterCode) {
    return "No related incident cluster was linked yet.";
  }

  return [
    cluster.clusterCode ? `Cluster: ${cluster.clusterCode}` : "",
    cluster.clustered ? `Merged reports: ${cluster.mergedCount || 1}` : "Initial report in this cluster",
    cluster.matchReason || "",
    `Match confidence: ${formatPercent(cluster.confidence)}`
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderFollowUpSummary(complaint) {
  const followUp = complaint.followUp || {};
  if (!followUp.nextDueAt && followUp.status !== "closed") {
    return "No automatic follow-up schedule was recorded.";
  }

  return [
    `Status: ${followUp.status || "scheduled"}`,
    followUp.nextDueAt ? `Next check: ${formatDateTime(followUp.nextDueAt)}` : "",
    `Follow-ups generated: ${followUp.count || 0}`,
    followUp.escalationNote || followUp.reason || ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderVerificationSummary(complaint) {
  const summary = complaint.verification?.summary || {};
  return [
    `Citizen status: ${String(summary.citizenStatus || "unverified").replace(/_/g, " ")}`,
    `Still there: ${summary.stillThere || 0}`,
    `Resolved: ${summary.resolved || 0}`,
    `Got worse: ${summary.gotWorse || 0}`,
    summary.lastVoteAt ? `Last vote: ${formatDateTime(summary.lastVoteAt)}` : ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderResolutionSummary(complaint) {
  const resolution = complaint.resolution || {};
  const assessment = resolution.aiAssessment || {};
  const evidenceCount = Array.isArray(resolution.citizenEvidence) ? resolution.citizenEvidence.length : 0;
  return [
    `Phase: ${String(resolution.phase || "not_requested").replace(/_/g, " ")}`,
    resolution.authorityUpdate?.markedAt ? `Authority update: ${formatDateTime(resolution.authorityUpdate.markedAt)}` : "",
    assessment.confidence ? `AI review confidence: ${formatPercent(assessment.confidence)}` : "",
    `Follow-ups: ${evidenceCount}`,
    assessment.reason || "An authority resolution update will open this verification loop."
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function formatWeatherValue(value, suffix = "") {
  return Number.isFinite(Number(value)) ? `${Number(value)}${suffix}` : "Not recorded";
}

function renderWeatherSummary(complaint) {
  const weather = complaint.weather || {};
  if (weather.status !== "available") {
    return /weatherstack|api key/i.test(String(weather.reason || ""))
      ? "Local conditions were not available for this complaint."
      : weather.reason || "Local conditions were not available for this complaint.";
  }

  return [
    weather.locationName || "Weather location not recorded",
    `${weather.condition || "Condition not recorded"} · ${formatWeatherValue(weather.temperatureC, "°C")}`,
    `Rain: ${formatWeatherValue(weather.precipitationMm, " mm")} · Humidity: ${formatWeatherValue(weather.humidity, "%")} · Wind: ${formatWeatherValue(weather.windKph, " kph")}`,
    weather.note || ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderEvidenceLinks(items = [], emptyMessage = "No references found.") {
  if (!items.length) {
    return escapeHtml(emptyMessage);
  }

  return items
    .map((item) => {
      const href = safeExternalHref(item.url);
      if (!href) return "";
      return `
        <a href="${escapeHtml(href)}" target="_blank" rel="noreferrer noopener">${escapeHtml(item.title || item.domain || "Reference")}</a>
        <span>${escapeHtml(item.domain || "")}${item.official ? " · verified official source" : ""}</span>
      `;
    })
    .filter(Boolean)
    .join("<br>");
}

function renderCivicEvidenceReason(complaint) {
  const evidence = complaint.civicEvidence || {};
  if (evidence.status === "available") {
    return "Civic reference context is available.";
  }

  if (/zenserp|api key/i.test(String(evidence.reason || ""))) {
    return "Civic reference context was not available for this complaint.";
  }
  return evidence.reason || "Civic reference context was not available for this complaint.";
}

function getThreatAssessment(complaint) {
  return complaint?.ai?.threatAssessment || complaint?.threatAssessment || complaint?.explainability?.threatAssessment || null;
}

function formatPercent(value) {
  return Number.isFinite(Number(value)) ? `${Math.round(Number(value) * 100)}%` : "Not recorded";
}

function renderThreatSummary(threat) {
  if (!threat) {
    return "Threat assessment was not recorded for this complaint.";
  }

  return [
    `Incident: ${threat.incident || "Civic incident"}`,
    `Status: ${threat.status || "not available"}`,
    `Confidence: ${formatPercent(threat.confidence)}`,
    threat.safetyGate?.action ? `Safety action: ${threat.safetyGate.action.replaceAll("_", " ")}` : ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderThreatEvidence(threat) {
  const relationships = (threat?.relationships || []).map((item) => `${item.severity || "Risk"}: ${item.label || item.rule}`);
  const evidence = [...(threat?.visualEvidence || []), ...relationships].slice(0, 5);
  if (!evidence.length) {
    return "No structured threat evidence was stored.";
  }

  return evidence.map(escapeHtml).join("<br>");
}

function renderThreatIntegrity(threat) {
  const integrity = threat?.integrity || {};
  if (!integrity.status) {
    return "No image integrity snapshot was stored.";
  }

  const shortHash = integrity.sha256 ? `${integrity.sha256.slice(0, 10)}...` : "not recorded";
  return [
    `Image check: ${integrity.status}`,
    `Fingerprint: ${shortHash}`,
    integrity.bytes ? `Size: ${Math.round(Number(integrity.bytes) / 1024)} KB` : "",
    ...(integrity.notes || []).slice(0, 2)
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderThreatDuplicates(threat) {
  const duplicate = threat?.duplicateCorrelation || {};
  if (!duplicate.status) {
    return "No duplicate or cluster signal was stored.";
  }

  return [
    `Cluster risk: ${duplicate.clusterRisk || "normal"}`,
    `Exact matches: ${duplicate.exactMatches || 0}`,
    `Near matches: ${duplicate.nearMatches || 0}`,
    `Related recent cases: ${duplicate.relatedRecentCount || 0}`,
    duplicate.reason || ""
  ]
    .filter(Boolean)
    .map(escapeHtml)
    .join("<br>");
}

function renderHumanReviewPanel(complaint, reviewOptions = null) {
  const review = complaint.humanReview || {};
  const status = String(review.status || "unreviewed").replace(/_/g, " ");
  const canReview = Boolean(reviewOptions && authState?.permissions?.includes("update_complaint_status"));
  const reviewedSummary = review.reviewedAt
    ? `${escapeHtml(review.reviewerRole || "Admin")} review · ${escapeHtml(formatDateTime(review.reviewedAt))}`
    : "No human decision has been recorded.";

  if (!canReview) {
    return `
      <section class="detail-support-card human-review-card">
        <p class="detail-section-label">Human review</p>
        <strong>${escapeHtml(status)}</strong>
        <p>${reviewedSummary}${review.reason ? `<br>${escapeHtml(review.reason)}` : ""}</p>
      </section>`;
  }

  const currentCategoryId = complaint.ai?.categoryId || "general";
  const categoryOptions = [...(reviewOptions.categories || [])];
  if (!categoryOptions.some((category) => category.id === currentCategoryId)) {
    categoryOptions.unshift({ id: currentCategoryId, label: complaint.type || "Needs Manual Review", group: "Review" });
  }
  const outcomeValue = ["confirmed", "corrected", "insufficient_evidence"].includes(review.status)
    ? review.status
    : "confirmed";
  const reviewRoutingUnits = Array.isArray(reviewOptions.routingUnits) ? reviewOptions.routingUnits : [];

  return `
    <section class="detail-support-card human-review-card">
      <div class="human-review-heading">
        <div>
          <p class="detail-section-label">Human review</p>
          <strong>${escapeHtml(status)}</strong>
        </div>
        <span>${reviewedSummary}</span>
      </div>
      ${review.reason ? `<p class="human-review-previous"><strong>Previous reasoning:</strong> ${escapeHtml(review.reason)}</p>` : ""}
      <form class="human-review-form" data-complaint-id="${escapeHtml(complaint._id)}" data-expected-version="${Number(complaint.__v || 0)}">
        <label>Review outcome
          <select class="human-review-outcome">
            ${(reviewOptions.outcomes || []).map((outcome) => `<option value="${escapeHtml(outcome.id)}" ${outcome.id === outcomeValue ? "selected" : ""}>${escapeHtml(outcome.label)}</option>`).join("")}
          </select>
        </label>
        <label>Incident category
          <select class="human-review-category">
            ${categoryOptions.map((category) => `<option value="${escapeHtml(category.id)}" data-team="${escapeHtml(category.team || complaint.routing?.department || "Help Desk")}" ${category.id === currentCategoryId ? "selected" : ""}>${escapeHtml(category.label)} · ${escapeHtml(category.group)}</option>`).join("")}
          </select>
        </label>
        <label>Severity
          <select class="human-review-priority">
            ${(reviewOptions.priorities || []).map((priority) => `<option value="${escapeHtml(priority)}" ${priority === complaint.priority ? "selected" : ""}>${escapeHtml(priority)}</option>`).join("")}
          </select>
        </label>
        <label>Department
          <select class="human-review-department">
            ${reviewRoutingUnits.map((unit) => `<option value="${escapeHtml(unit.department)}" data-unit-id="${escapeHtml(unit.unitId)}" data-categories="${escapeHtml((unit.handlesCategoryIds || []).join(","))}" ${unit.department === complaint.routing?.department ? "selected" : ""}>${escapeHtml(unit.department)} · ${escapeHtml(unit.unitName)}</option>`).join("")}
          </select>
        </label>
        <label class="human-review-reason-field">Reviewer reasoning
          <textarea class="human-review-reason" minlength="15" maxlength="500" required placeholder="State the visible evidence and explain why this decision is justified."></textarea>
        </label>
        <div class="human-review-submit-row">
          <p class="helper-text">Corrections update operational fields. Concurrent changes are rejected until this case is refreshed.</p>
          <button type="submit" class="primary-button human-review-submit">Submit human review</button>
        </div>
      </form>
    </section>`;
}

function renderDecisionAuditPanel(complaint, decisionAudit = null) {
  if (!decisionAudit || !authState?.permissions?.includes("update_complaint_status")) return "";
  const events = Array.isArray(decisionAudit.events) ? [...decisionAudit.events].reverse() : [];
  const status = String(decisionAudit.status || "not_recorded").replace(/_/g, " ");
  return `
    <section class="detail-support-card decision-audit-card">
      <div class="human-review-heading">
        <div>
          <p class="detail-section-label">Decision audit</p>
          <strong>${escapeHtml(status)}</strong>
        </div>
        <span>${pluralize(decisionAudit.checkedEvents || 0, "event")}</span>
      </div>
      <p class="helper-text">Append-only AI and reviewer decisions with a verified hash chain.</p>
      <div class="decision-audit-events">
        ${events.map((event) => `
          <article class="decision-audit-event">
            <div><strong>${escapeHtml(String(event.eventType || "event").replace(/_/g, " "))}</strong><span>${escapeHtml(formatDateTime(event.occurredAt))}</span></div>
            <p>${escapeHtml(String(event.outcome || "recorded").replace(/_/g, " "))}${event.changedFields?.length ? ` · changed ${escapeHtml(event.changedFields.join(", "))}` : ""}</p>
            ${event.reason ? `<small>${escapeHtml(event.reason)}</small>` : ""}
            <code>${escapeHtml(String(event.eventHash || "").slice(0, 16))}${event.eventHash ? "..." : ""}</code>
          </article>`).join("") || `<p>No audit events are recorded for this legacy complaint yet.</p>`}
      </div>
      ${decisionAudit.issues?.length ? `<p class="decision-audit-warning">${escapeHtml(decisionAudit.issues.join(" "))}</p>` : ""}
      <button type="button" class="secondary-button decision-audit-export" data-complaint-id="${escapeHtml(complaint._id)}">Export correction record</button>
    </section>`;
}

function renderAuthorityTicketPanel(complaint, ticket = null, canReview = false) {
  if (!canReview) return "";
  const status = String(ticket?.status || "not created").replace(/_/g, " ");
  const canRetry = ticket && ["failed", "not_configured"].includes(ticket.status) && (!ticket.nextRetryAt || new Date(ticket.nextRetryAt) <= new Date());
  const portalUrl = safeExternalHref(ticket?.portalUrl || complaint.routing?.handoff?.portalUrl || complaint.routing?.portalUrl);
  const awaitingManualSubmission = ticket?.adapter === "manual_portal" && ticket.status === "awaiting_manual_submission";
  const slaStage = ticket?.sla?.currentStage || "";
  const slaDueAt = slaStage === "handoff"
    ? ticket?.sla?.handoffDueAt
    : slaStage === "acknowledgement"
      ? ticket?.sla?.acknowledgementDueAt
      : slaStage === "resolution"
        ? ticket?.sla?.resolutionDueAt
        : null;
  return `
    <section class="detail-support-card authority-ticket-card" data-authority-ticket-id="${escapeHtml(ticket?._id || "")}" data-complaint-id="${escapeHtml(complaint._id)}">
      <div class="human-review-heading">
        <div><p class="detail-section-label">Authority ticket</p><strong>${escapeHtml(status)}</strong></div>
        <span>${escapeHtml(ticket?.ticketCode || "Not submitted")}</span>
      </div>
      <p>${ticket ? `${escapeHtml(String(ticket.adapter).replace(/_/g, " "))} · ${ticket.attemptCount || 0} confirmed attempt(s)${ticket.externalReference ? `<br>External reference: ${escapeHtml(ticket.externalReference)}` : ""}${ticket.lastError ? `<br>${escapeHtml(ticket.lastError)}` : ""}` : "Prepare a tracked authority handoff after reviewing the AI decision."}</p>
      ${ticket?.sla ? `<p class="authority-sla-summary" data-status="${escapeHtml(ticket.sla.status || "on_track")}">${escapeHtml(authorityStageLabel(slaStage))}: ${ticket.sla.status === "completed" ? "completed" : `${escapeHtml(ticket.sla.status || "on track")}${slaDueAt ? ` · due ${escapeHtml(formatDateTime(slaDueAt))}` : ""}`}${ticket.sla.escalationLevel ? ` · escalation level ${escapeHtml(ticket.sla.escalationLevel)}` : ""}</p>` : ""}
      ${awaitingManualSubmission ? `
        <form class="authority-manual-form">
          <div class="authority-manual-heading">
            <div><strong>Manual portal handoff</strong><p>Opening the portal does not submit this complaint automatically.</p></div>
            ${portalUrl ? `<a class="secondary-button authority-portal-link" href="${escapeHtml(portalUrl)}" target="_blank" rel="noopener noreferrer">Open official portal</a>` : ""}
          </div>
          <label>Portal confirmation or complaint reference
            <input class="authority-manual-reference" type="text" minlength="3" maxlength="180" required autocomplete="off" placeholder="Reference issued after submission">
          </label>
          <label>Submission note <span>(optional)</span>
            <textarea class="authority-manual-note" maxlength="500" placeholder="Record any relevant acknowledgement or portal detail."></textarea>
          </label>
          <button type="submit" class="primary-button authority-manual-confirm">Record confirmed submission</button>
        </form>` : ""}
      ${ticket?.manualSubmission?.confirmedAt ? `<p class="authority-confirmation-note">Confirmed ${escapeHtml(formatDateTime(ticket.manualSubmission.confirmedAt))}${ticket.manualSubmission.note ? ` · ${escapeHtml(ticket.manualSubmission.note)}` : ""}</p>` : ""}
      <div class="authority-ticket-actions">
        ${!ticket ? `<button type="button" class="primary-button authority-ticket-submit">Prepare authority handoff</button>` : ""}
        ${canRetry ? `<button type="button" class="secondary-button authority-ticket-retry">Retry delivery</button>` : ""}
        ${ticket && ["submitted", "acknowledged", "in_progress"].includes(ticket.status) ? `
          <select class="authority-ticket-status" aria-label="Authority ticket status">
            <option value="acknowledged">Acknowledged</option><option value="in_progress">In progress</option><option value="resolved">Resolved</option><option value="rejected">Rejected</option>
          </select>
          <button type="button" class="secondary-button authority-ticket-reconcile">Reconcile status</button>` : ""}
      </div>
      ${ticket?.nextRetryAt ? `<small>Next retry: ${escapeHtml(formatDateTime(ticket.nextRetryAt))}</small>` : ""}
    </section>`;
}

function renderComplaintDetail(complaint, intelligence = {}, reviewOptions = null, decisionAudit = null, authorityTicket = null) {
  complaintDetailTitle.textContent = complaint.type || "Complaint";
  const mapsUrl = buildGoogleMapsUrl(complaint.location, complaint.mapLocation);
  const ageInDays = countDaysOpen(complaint.createdAt);
  const alternatives = Array.isArray(complaint.ai?.visionCandidates) ? complaint.ai.visionCandidates.slice(1, 4) : [];
  const timelineHistory = Array.isArray(complaint.statusHistory) ? [...complaint.statusHistory].reverse() : [];
  const threat = getThreatAssessment(complaint);
  const resolutionOpen = ["awaiting_citizen_verification", "needs_admin_review"].includes(complaint.resolution?.phase);
  const canSubmitResolutionEvidence = !authState?.permissions?.includes("view_dashboard");
  const canSubmitCitizenVerification = !authState?.permissions?.includes("view_dashboard");
  const dna = intelligence.dna || { strands: [] };
  const timeMachine = intelligence.timeMachine || [];
  const scenario = intelligence.consequenceScenario || null;
  const routingPortal = safeExternalHref(complaint.routing?.handoff?.portalUrl || complaint.routing?.portalUrl);
  complaintDetailBody.innerHTML = `
    <div class="detail-case-layout">
      <section class="detail-hero">
        <div class="detail-hero-head">
          <div class="detail-hero-copy">
            <p class="eyebrow">Case summary</p>
            <h3>${escapeHtml(complaint.type || "Complaint")}</h3>
            <p>${escapeHtml(complaint.description || "No complaint description recorded.")}</p>
          </div>
          <div class="issue-meta">
            ${confidenceBadge(complaint)}
            ${severityBadge(complaint.priority)}
            ${authorityBadge(complaint.assignedAuthority)}
          </div>
        </div>

        <div class="detail-facts-grid">
          <article class="detail-summary-card">
            <span>Status</span>
            <strong>${escapeHtml(complaint.status || "Queued")}</strong>
          </article>
          <article class="detail-summary-card">
            <span>Location</span>
            <strong>${escapeHtml(complaint.location || "Unknown")}</strong>
          </article>
          <article class="detail-summary-card">
            <span>Case age</span>
            <strong>${pluralize(ageInDays, "day")}</strong>
          </article>
          <article class="detail-summary-card">
            <span>Decision tone</span>
            <strong>${escapeHtml(confidenceTone(complaint))}</strong>
          </article>
        </div>

        <section class="detail-section">
          <p class="detail-section-label">AI decision</p>
          <p>${escapeHtml(complaint.ai?.explanation || complaint.ai?.cvReason || "No AI explanation recorded.")}</p>
          ${complaint.ai?.cvDetection && complaint.ai.cvDetection !== "No image uploaded" ? `<p><strong>Visual finding:</strong> ${escapeHtml(complaint.ai.cvDetection)}</p>` : ""}
          <p class="helper-text">Recommended team: ${escapeHtml(complaint.ai?.recommendedTeam || "Help Desk")} · AI engine: ${escapeHtml(complaint.ai?.engine || "unknown")} · Fallback: ${complaint.ai?.fallbackUsed ? "yes" : "no"} · Geocoding: ${escapeHtml(complaint.ai?.geocodingSource || "unknown")}</p>
        </section>

        <section class="detail-section">
          <p class="detail-section-label">Decision breakdown</p>
          <div class="detail-diagnostic-grid">
            ${renderConfidenceBreakdown(complaint.ai?.confidenceBreakdown)}
          </div>
        </section>

        <section class="detail-section">
          <p class="detail-section-label">Vision candidates</p>
          <div class="table-list">${renderVisionCandidates(complaint.ai?.visionCandidates || [])}</div>
        </section>

        <section class="detail-section">
          <p class="detail-section-label">Scene understanding</p>
          ${renderVisualObservations(complaint.ai?.visualObservations)}
        </section>
      </section>

      <div class="detail-support-grid">
        ${renderHumanReviewPanel(complaint, reviewOptions)}
        ${renderDecisionAuditPanel(complaint, decisionAudit)}
        ${renderAuthorityTicketPanel(complaint, authorityTicket, Boolean(reviewOptions))}
        <section class="detail-support-card">
          <p class="detail-section-label">Routing</p>
          <strong>${escapeHtml(complaint.routing?.unit || complaint.assignedAuthority || "Gram Panchayat")}</strong>
          <p>${renderRoutingSummary(complaint, authorityTicket)}</p>
          ${routingPortal ? `<a class="detail-inline-link" href="${escapeHtml(routingPortal)}" target="_blank" rel="noopener noreferrer">Open official complaint portal</a>` : ""}
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Created</p>
          <strong>${escapeHtml(formatDateTime(complaint.createdAt))}</strong>
          <p>Stored case creation time in the complaint log.</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Alternative reads</p>
          <strong>${alternatives.length ? pluralize(alternatives.length, "candidate") : "No alternates"}</strong>
          <p>${alternatives.length ? escapeHtml(alternatives.map((candidate) => candidate.label || "Candidate").join(" • ")) : "No secondary image candidates were recorded for this complaint."}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Emergency broadcast</p>
          <strong>${complaint.broadcast?.triggered ? "Triggered" : "Not triggered"}</strong>
          <p>${renderBroadcastSummary(complaint)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Area intelligence</p>
          <strong>${escapeHtml(complaint.areaIntelligence?.likelyArea || "Area inferred")}</strong>
          <p>${renderAreaIntelligenceSummary(complaint)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Incident command</p>
          <strong>${complaint.incidentCommand?.triggered ? escapeHtml(complaint.incidentCommand.incidentCode || "Command active") : "Not opened"}</strong>
          <p>${renderIncidentSummary(complaint)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Incident cluster</p>
          <strong>${escapeHtml(complaint.incidentCluster?.clusterCode || "Not clustered")}</strong>
          <p>${renderIncidentClusterSummary(complaint)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Auto follow-up</p>
          <strong>${escapeHtml(complaint.followUp?.status || "scheduled")}</strong>
          <p>${renderFollowUpSummary(complaint)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Citizen verification</p>
          <strong>${escapeHtml((complaint.verification?.summary?.citizenStatus || "unverified").replace(/_/g, " "))}</strong>
          <p>${renderVerificationSummary(complaint)}</p>
          ${canSubmitCitizenVerification ? `<div class="verification-actions" data-complaint-id="${escapeHtml(complaint._id)}">
            <button type="button" class="chip-button verification-vote-btn" data-vote="still_there">Still there</button>
            <button type="button" class="chip-button verification-vote-btn" data-vote="resolved">Looks resolved</button>
            <button type="button" class="chip-button verification-vote-btn" data-vote="got_worse">Got worse</button>
          </div>` : `<p class="helper-text">Citizen verification is submitted by the original reporter.</p>`}
        </section>
        <section class="detail-support-card resolution-card">
          <p class="detail-section-label">Resolution loop</p>
          <strong>${escapeHtml(String(complaint.resolution?.phase || "not_requested").replace(/_/g, " "))}</strong>
          <p>${renderResolutionSummary(complaint)}</p>
          ${
            resolutionOpen && canSubmitResolutionEvidence
              ? `
                <div class="resolution-evidence-form" data-complaint-id="${escapeHtml(complaint._id)}">
                  <label>Follow-up note
                    <textarea class="resolution-note" maxlength="280" placeholder="What did you observe after the reported repair?"></textarea>
                  </label>
                  <label>Follow-up photo (optional)
                    <input class="resolution-photo" type="file" accept="image/jpeg,image/png,image/webp" />
                  </label>
                  <div class="verification-actions">
                    <button type="button" class="chip-button resolution-evidence-btn" data-vote="resolved">Confirm resolved</button>
                    <button type="button" class="chip-button resolution-evidence-btn" data-vote="still_there">Still unresolved</button>
                    <button type="button" class="chip-button resolution-evidence-btn" data-vote="got_worse">Got worse</button>
                  </div>
                </div>
              `
              : "<p class=\"helper-text\">This step becomes available to the original reporter after an authority marks the complaint resolved.</p>"
          }
        </section>
        <section class="detail-support-card dna-card">
          <p class="detail-section-label">Incident DNA</p>
          <strong>${dna.confidence || 0}% evidence signal</strong>
          <div class="dna-strands">${(dna.strands || []).map((strand) => `<span title="${escapeHtml(strand.detail || "")}"><i style="--strand:${Math.round(Number(strand.strength || 0) * 100)}%"></i>${escapeHtml(strand.label)}</span>`).join("") || "No evidence strands recorded."}</div>
        </section>
        <section class="detail-support-card scenario-card">
          <p class="detail-section-label">Consequence scenario</p>
          <strong>${escapeHtml(scenario?.band || "Not available")} · ${scenario?.impactScore || 0}/100</strong>
          <p>${(scenario?.effects || []).map(escapeHtml).join("<br>") || "No open-case scenario is available."}</p>
          <small>${escapeHtml(scenario?.disclaimer || "Scenario information is a planning aid, not a prediction.")}</small>
        </section>
        <section class="detail-support-card community-proof-card">
          <p class="detail-section-label">Community verification</p>
          <strong>${escapeHtml(String(complaint.communityProof?.summary?.latestStatus || "unverified").replace(/_/g, " "))}</strong>
          <p>${complaint.communityProof?.summary?.trustedTotal ?? complaint.communityProof?.summary?.total ?? 0} nearby responses · ${complaint.communityProof?.summary?.stillPresent || complaint.communityProof?.summary?.corroborates || 0} still present · ${complaint.communityProof?.summary?.worsening || 0} worsening · ${complaint.communityProof?.summary?.resolved || complaint.communityProof?.summary?.cleared || 0} resolved · ${complaint.communityProof?.summary?.duplicate || 0} duplicate</p>
          <p>Effective confidence: ${Math.round(Number((complaint.communityProof?.summary?.trustedTotal || 0) > 0 ? complaint.communityProof.summary.effectiveConfidence : complaint.confidence || 0))}% · Effective urgency: ${escapeHtml((complaint.communityProof?.summary?.trustedTotal || 0) > 0 ? complaint.communityProof.summary.effectivePriority : complaint.priority || "Medium")}${complaint.communityProof?.summary?.communityWide ? " · Community-wide incident" : ""}</p>
          <p class="helper-text">Verifier identities and reporter details remain private. Conflicting reports are flagged instead of automatically changing case status.</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Threat assessment</p>
          <strong>${threat ? `${escapeHtml(threat.threatLevel || "Not assessed")} · ${formatPercent(threat.riskScore)}` : "Not recorded"}</strong>
          <p>${renderThreatSummary(threat)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Threat evidence</p>
          <strong>${threat?.hazards?.length ? pluralize(threat.hazards.length, "hazard") : "No hazards"}</strong>
          <p>${renderThreatEvidence(threat)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Evidence quality</p>
          <strong>${escapeHtml(threat?.integrity?.status || "Not checked")}</strong>
          <p>${renderThreatIntegrity(threat)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Duplicate signal</p>
          <strong>${escapeHtml(threat?.duplicateCorrelation?.clusterRisk || "Not checked")}</strong>
          <p>${renderThreatDuplicates(threat)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Weather context</p>
          <strong>${complaint.weather?.status === "available" ? escapeHtml(complaint.weather.condition || "Available") : "Unavailable"}</strong>
          <p>${renderWeatherSummary(complaint)}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Official and civic references</p>
          <strong>${complaint.civicEvidence?.officialSources?.length ? pluralize(complaint.civicEvidence.officialSources.length, "reference") : "No references"}</strong>
          <p>${renderEvidenceLinks(complaint.civicEvidence?.officialSources || [], renderCivicEvidenceReason(complaint))}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Public context</p>
          <strong>${complaint.civicEvidence?.publicContext?.length ? pluralize(complaint.civicEvidence.publicContext.length, "result") : "No public context"}</strong>
          <p>${renderEvidenceLinks(complaint.civicEvidence?.publicContext || [], renderCivicEvidenceReason(complaint))}</p>
        </section>
        <section class="detail-support-card">
          <p class="detail-section-label">Map</p>
          <strong><a href="${escapeHtml(mapsUrl)}" target="_blank" rel="noreferrer noopener">Open in Google Maps</a></strong>
          <p>Open the stored location in a full map window.</p>
        </section>
        <section class="detail-timeline">
          <p class="detail-section-label">Status timeline</p>
          <div class="detail-timeline-list">${renderStatusHistory(timelineHistory)}</div>
        </section>
        <section class="detail-timeline time-machine-card">
          <p class="detail-section-label">Civic time machine</p>
          <div class="detail-timeline-list">${timeMachine.map((event) => `<div class="timeline-entry"><strong>${escapeHtml(event.title || "Event")}</strong><span>${escapeHtml(formatDateTime(event.at))} · ${escapeHtml(event.detail || "")}</span></div>`).join("") || "No historic events recorded."}</div>
        </section>
        <section class="detail-timeline">
          <p class="detail-section-label">Alert notes</p>
          <div class="detail-timeline-list">${renderAlertsHistory(complaint.alerts || [])}</div>
        </section>
      </div>
    </div>
  `;
  complaintDetailOverlay.hidden = false;
  document.body.classList.add("auth-open");
  focusDialog(complaintDetailOverlay);
  const humanReviewForm = complaintDetailBody.querySelector(".human-review-form");
  if (humanReviewForm) {
    const outcome = humanReviewForm.querySelector(".human-review-outcome");
    const category = humanReviewForm.querySelector(".human-review-category");
    const department = humanReviewForm.querySelector(".human-review-department");
    const decisionFields = [
      humanReviewForm.querySelector(".human-review-category"),
      humanReviewForm.querySelector(".human-review-priority"),
      humanReviewForm.querySelector(".human-review-department")
    ];
    const syncReviewFields = () => {
      const correctionOpen = outcome.value === "corrected";
      decisionFields.forEach((field) => {
        field.disabled = !correctionOpen;
      });
    };
    const syncDepartmentOptions = () => {
      const categoryId = category.value;
      let firstValid = null;
      [...department.options].forEach((option) => {
        const valid = String(option.dataset.categories || "").split(",").includes(categoryId);
        option.disabled = !valid;
        option.hidden = !valid;
        if (valid && !firstValid) firstValid = option;
      });
      if (!department.selectedOptions[0] || department.selectedOptions[0].disabled) department.value = firstValid?.value || "";
    };
    outcome.addEventListener("change", syncReviewFields);
    category.addEventListener("change", () => {
      syncDepartmentOptions();
      const defaultTeam = category.selectedOptions[0]?.dataset.team;
      if (outcome.value === "corrected" && defaultTeam) {
        department.value = defaultTeam;
      }
    });
    syncDepartmentOptions();
    syncReviewFields();
    humanReviewForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const submitButton = humanReviewForm.querySelector(".human-review-submit");
      try {
        submitButton.disabled = true;
        const data = await apiRequest(`/api/complaints/${humanReviewForm.dataset.complaintId}/human-review`, {
          method: "POST",
          body: JSON.stringify({
            outcome: outcome.value,
            categoryId: humanReviewForm.querySelector(".human-review-category").value,
            priority: humanReviewForm.querySelector(".human-review-priority").value,
            department: humanReviewForm.querySelector(".human-review-department").value.trim(),
            unitId: humanReviewForm.querySelector(".human-review-department").selectedOptions[0]?.dataset.unitId || "",
            reason: humanReviewForm.querySelector(".human-review-reason").value.trim(),
            expectedVersion: Number(humanReviewForm.dataset.expectedVersion)
          })
        });
        setDashboardMessage(data.message || "Human review recorded.", "success");
        await openComplaintDetail(humanReviewForm.dataset.complaintId);
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        submitButton.disabled = false;
      }
    });
  }
  const auditExportButton = complaintDetailBody.querySelector(".decision-audit-export");
  auditExportButton?.addEventListener("click", async () => {
    try {
      auditExportButton.disabled = true;
      const response = await fetch(`/api/complaints/${auditExportButton.dataset.complaintId}/decision-audit?format=csv`, {
        headers: { Authorization: `Bearer ${authState.token}` }
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || "Decision audit export failed.");
      }
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `decision-audit-${auditExportButton.dataset.complaintId}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setDashboardMessage("Decision audit exported.", "success");
    } catch (error) {
      setDashboardMessage(error.message, "error");
    } finally {
      auditExportButton.disabled = false;
    }
  });
  const authorityPanel = complaintDetailBody.querySelector(".authority-ticket-card");
  authorityPanel?.querySelector(".authority-ticket-submit")?.addEventListener("click", async (event) => {
    try {
      event.currentTarget.disabled = true;
      const data = await apiRequest(`/api/complaints/${authorityPanel.dataset.complaintId}/authority-ticket`, { method: "POST", body: "{}" });
      setDashboardMessage(data.message, data.authorityTicket?.status === "submitted" ? "success" : "info");
      await openComplaintDetail(authorityPanel.dataset.complaintId);
      await loadDashboard();
    } catch (error) { setDashboardMessage(error.message, "error"); event.currentTarget.disabled = false; }
  });
  authorityPanel?.querySelector(".authority-ticket-retry")?.addEventListener("click", async (event) => {
    try {
      event.currentTarget.disabled = true;
      const data = await apiRequest(`/api/complaints/${authorityPanel.dataset.complaintId}/authority-ticket/retry`, { method: "POST", body: "{}" });
      setDashboardMessage(data.message, data.authorityTicket?.status === "submitted" ? "success" : "info");
      await openComplaintDetail(authorityPanel.dataset.complaintId);
      await loadDashboard();
    } catch (error) { setDashboardMessage(error.message, "error"); event.currentTarget.disabled = false; }
  });
  authorityPanel?.querySelector(".authority-manual-form")?.addEventListener("submit", async (event) => {
    event.preventDefault();
    const submitButton = event.currentTarget.querySelector(".authority-manual-confirm");
    try {
      submitButton.disabled = true;
      const data = await apiRequest(`/api/authority-tickets/${authorityPanel.dataset.authorityTicketId}/manual-confirmation`, {
        method: "POST",
        body: JSON.stringify({
          externalReference: event.currentTarget.querySelector(".authority-manual-reference").value.trim(),
          note: event.currentTarget.querySelector(".authority-manual-note").value.trim()
        })
      });
      setDashboardMessage(data.message, "success");
      await openComplaintDetail(authorityPanel.dataset.complaintId);
      await loadDashboard();
    } catch (error) {
      setDashboardMessage(error.message, "error");
      submitButton.disabled = false;
    }
  });
  authorityPanel?.querySelector(".authority-ticket-reconcile")?.addEventListener("click", async (event) => {
    try {
      event.currentTarget.disabled = true;
      const status = authorityPanel.querySelector(".authority-ticket-status")?.value;
      const note = window.prompt("Authority response evidence note (at least 10 characters):") || "";
      const data = await apiRequest(`/api/authority-tickets/${authorityPanel.dataset.authorityTicketId}/reconcile`, { method: "PATCH", body: JSON.stringify({ status, note }) });
      setDashboardMessage(data.message, "success");
      await openComplaintDetail(authorityPanel.dataset.complaintId);
      await loadDashboard();
    } catch (error) { setDashboardMessage(error.message, "error"); event.currentTarget.disabled = false; }
  });
  complaintDetailBody.querySelectorAll(".verification-vote-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const complaintId = button.closest(".verification-actions")?.dataset.complaintId;
      if (!complaintId) return;

      try {
        button.disabled = true;
        const data = await apiRequest(`/api/complaints/${complaintId}/verification`, {
          method: "POST",
          body: JSON.stringify({ vote: button.dataset.vote })
        });
        setDashboardMessage(data.message || "Citizen verification recorded.", "success");
        await openComplaintDetail(complaintId);
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });
  complaintDetailBody.querySelectorAll(".resolution-evidence-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const container = button.closest(".resolution-evidence-form");
      const complaintId = container?.dataset.complaintId;
      if (!complaintId || !container) return;

      try {
        button.disabled = true;
        const imageFile = container.querySelector(".resolution-photo")?.files?.[0];
        const payload = {
          vote: button.dataset.vote,
          note: container.querySelector(".resolution-note")?.value.trim() || ""
        };
        if (imageFile) {
          const imageAiPayload = await prepareImageForAi(imageFile);
          payload.imageFeatures = await extractImageFeatures(imageFile);
          payload.imageBase64 = imageAiPayload?.base64 || "";
          payload.imageMimeType = imageAiPayload?.mimeType || "";
        }
        const data = await apiRequest(`/api/complaints/${complaintId}/resolution-evidence`, {
          method: "POST",
          body: JSON.stringify(payload)
        });
        setDashboardMessage(data.message || "Resolution evidence recorded.", "success");
        await openComplaintDetail(complaintId);
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });
}

async function openComplaintDetail(complaintId) {
  try {
    const data = await apiRequest(`/api/complaints/${complaintId}`, { method: "GET" });
    renderComplaintDetail(data.complaint, data.intelligence || {}, data.reviewOptions || null, data.decisionAudit || null, data.authorityTicket || null);
  } catch (error) {
    setDashboardMessage(error.message, "error");
  }
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

  const evidenceLines = (items = []) =>
    items.length
      ? items.map((item) => `${item.title || item.domain || "Reference"} - ${item.url}`)
      : ["No entries recorded."];
  const threat = report.threatAssessment || {};
  const threatEvidenceLines = [
    ...(threat.visualEvidence || []),
    ...(threat.relationships || []).map((item) => `${item.severity || "Risk"} - ${item.label || item.rule}`)
  ].slice(0, 6);
  const threatDuplicate = threat.duplicateCorrelation || {};
  const threatIntegrity = threat.integrity || {};

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
  drawRow("City", report.city?.name || "Bengaluru");
  drawRow("Routed Authority", report.assignedAuthority);
  drawRow("Assigned Unit", report.routing?.unit || report.routing?.department || "Not recorded");
  drawRow("Department", report.routing?.department || "Not recorded");
  drawRow("Handoff Mode", report.routing?.handoff?.mode === "manual_portal" ? "Official portal (manual submission)" : report.routing?.handoff?.mode || "Not configured");
  drawRow("Official Portal", report.routing?.handoff?.portalUrl || report.routing?.portalUrl || "Not recorded");
  drawRow("Ward / Coverage", `${report.routing?.ward || "Not recorded"}${report.routing?.wardCode ? ` (${report.routing.wardCode})` : ""}`);
  drawRow("Ward Match", `${String(report.routing?.wardMatchQuality || "not recorded").replaceAll("_", " ")}${report.routing?.wardRequiresConfirmation ? " (confirmation recommended)" : ""}`);
  drawRow("Routing Reason", report.routing?.routingReason || "Not recorded");
  drawRow("Delivery Status", String(report.routing?.deliveryStatus || "pending handoff").replaceAll("_", " "));
  drawRow("Escalation Destination", report.routing?.escalationDestination || "BBMP zonal administration");
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
  drawRow("Explainability", report.explainability?.explanation || "No explainability summary recorded.");
  drawRow("Confidence", report.explainability?.confidenceLabel || report.priority);
  drawRow("AI Engine", report.aiMeta?.engine || "Not recorded");
  drawRow("AI Provider", report.aiMeta?.provider || "Not recorded");
  drawRow("Vision Engine", report.aiMeta?.visionEngine || "Not recorded");
  if (report.visualObservations?.description) {
    drawRow("Scene Description", report.visualObservations.description);
    drawRow("Visible Issues", (report.visualObservations.detectedIssues || []).map((item) => item.issue || item.categoryLabel).filter(Boolean).join("; ") || "Not determined");
    drawRow("Visible Hazards", (report.visualObservations.hazards || []).join("; ") || "None confirmed");
    drawRow("Image / Text", String(report.visualObservations.textImageConsistency?.status || "not available").replaceAll("_", " "));
    drawRow("Visual Review", report.visualObservations.humanReviewRecommended ? "Human review recommended" : "No visual review requested");
  }
  drawRow(
    "Decision Audit",
    report.decisionAudit?.headHash
      ? `${report.decisionAudit.integrityStatus || "verified"} · ${report.decisionAudit.eventCount || 1} event(s) · ${report.decisionAudit.headHash.slice(0, 16)}...`
      : "Not recorded"
  );
  drawRow(
    "Threat Level",
    threat.threatLevel
      ? `${threat.threatLevel} risk, ${formatPercent(threat.riskScore)} score, ${formatPercent(threat.confidence)} confidence`
      : "Threat assessment not recorded."
  );
  drawRow(
    "Threat Gate",
    threat.safetyGate?.action
      ? `${String(threat.safetyGate.action).replaceAll("_", " ")}. ${threat.safetyGate.reason || ""}`
      : "No threat safety gate recorded."
  );
  drawRow(
    "Evidence Quality",
    threatIntegrity.status
      ? `${threatIntegrity.status}. Fingerprint ${threatIntegrity.sha256 ? `${threatIntegrity.sha256.slice(0, 12)}...` : "not recorded"}. ${(threatIntegrity.notes || []).slice(0, 2).join(" ")}`
      : "No image integrity snapshot recorded."
  );
  drawRow(
    "Duplicate Signal",
    threatDuplicate.status
      ? `${threatDuplicate.clusterRisk || "normal"} cluster risk. Exact ${threatDuplicate.exactMatches || 0}, near ${threatDuplicate.nearMatches || 0}, related ${threatDuplicate.relatedRecentCount || 0}. ${threatDuplicate.reason || ""}`
      : "No duplicate signal recorded."
  );
  drawRow(
    "Weather Context",
    report.weather?.status === "available"
      ? `${report.weather.condition || "Condition not recorded"}, ${formatWeatherValue(report.weather.temperatureC, "°C")}, rain ${formatWeatherValue(report.weather.precipitationMm, " mm")}, wind ${formatWeatherValue(report.weather.windKph, " kph")}${report.weather.note ? `. ${report.weather.note}` : ""}`
      : report.weather?.reason || "Weather context unavailable."
  );

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
  drawRow("Emergency Broadcast", report.broadcast?.triggered ? `${report.broadcast.status || "created"} · ${report.broadcast.recipientCount || 0} recipient(s)` : "Not triggered");
  drawRow(
    "Auto Follow-up",
    report.followUp
      ? `${report.followUp.status || "scheduled"} · next ${report.followUp.nextDueAt ? formatDateTime(report.followUp.nextDueAt) : "not scheduled"} · ${report.followUp.count || 0} generated`
      : "Not recorded"
  );
  drawRow(
    "Citizen Verification",
    report.verification?.summary
      ? `${String(report.verification.summary.citizenStatus || "unverified").replace(/_/g, " ")} · ${report.verification.summary.total || 0} vote(s)`
      : "No citizen votes recorded"
  );
  drawRow(
    "Area Intelligence",
    report.areaIntelligence?.provider
      ? `${report.areaIntelligence.likelyArea || "Area inferred"} · ${(report.areaIntelligence.landmarkHints || []).slice(0, 2).join(", ") || "No landmark"} · ${formatPercent(report.areaIntelligence.confidence)}`
      : "Not recorded"
  );
  drawRow(
    "Incident Cluster",
    report.incidentCluster?.clusterCode
      ? `${report.incidentCluster.clusterCode} · ${report.incidentCluster.clustered ? `${report.incidentCluster.mergedCount || 1} merged report(s)` : "initial cluster report"} · ${report.incidentCluster.matchReason || "clustered"}`
      : "Not clustered"
  );
  drawRow("Incident Command", report.incidentCommand?.triggered ? `${report.incidentCommand.incidentCode || "Opened"} · SLA ${formatDateTime(report.incidentCommand.slaDueAt)}` : "Not opened");
  drawRow("Threat Evidence", "");
  cursorY -= 8;
  drawBulletsBox(threatEvidenceLines.length ? threatEvidenceLines : ["No structured threat evidence recorded."]);
  drawRow("Official Sources", "");
  cursorY -= 8;
  drawBulletsBox(evidenceLines(report.civicEvidence?.officialSources || []));
  drawRow("Public Context", "");
  cursorY -= 8;
  drawBulletsBox(evidenceLines(report.civicEvidence?.publicContext || []));

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
  const visibleComplaints = getFilteredComplaints(complaints);

  if (!visibleComplaints.length) {
    container.innerHTML = `<div class="table-row empty-state"><span>No complaints found. The dashboard is currently clear.</span></div>`;
    return;
  }

  container.innerHTML = visibleComplaints
    .map(
      (complaint) => `
        <article class="issue-card">
          <div class="issue-card-head">
            <strong>${escapeHtml(complaint.type)}</strong>
            <span class="status-pill" data-status="${escapeHtml(complaint.status)}">${escapeHtml(complaint.status)}</span>
          </div>
          <p>${escapeHtml(complaint.location)}</p>
          <p class="helper-text">Unit: ${escapeHtml(complaint.routing?.unit || complaint.routing?.department || complaint.ai?.recommendedTeam || "Response team")} · ${complaint.broadcast?.triggered ? `Broadcast ${escapeHtml(complaint.broadcast.status || "created")}` : "No broadcast"}</p>
          <p class="helper-text">Ward: ${escapeHtml(complaint.routing?.ward || "Pending identification")} · Delivery: ${escapeHtml(String(complaint.routing?.deliveryStatus || "pending_handoff").replace(/_/g, " "))} · Community: ${escapeHtml(String(complaint.communityProof?.summary?.latestStatus || "unverified").replace(/_/g, " "))}</p>
          <div class="issue-meta">
            ${severityBadge(complaint.priority)}
            ${authorityBadge(complaint.assignedAuthority)}
            ${confidenceBadge(complaint)}
          </div>
          <button type="button" class="secondary-button view-complaint-btn" data-complaint-id="${complaint._id}">View Details</button>
          ${
            canUpdateStatus
              ? `
            <div class="status-actions">
              <select class="status-select" data-complaint-id="${complaint._id}">
                <option value="Queued" ${complaint.status === "Queued" ? "selected" : ""}>Pending</option>
                <option value="Needs Review" ${complaint.status === "Needs Review" ? "selected" : ""}>Needs Review</option>
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

  container.querySelectorAll(".view-complaint-btn").forEach((button) => {
    button.addEventListener("click", () => openComplaintDetail(button.dataset.complaintId));
  });

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
            <strong>${escapeHtml(complaint.routing?.department || complaint.assignedAuthority || "BBMP")}</strong>
            <span>${escapeHtml(complaint.routing?.ward || "Ward pending")} · ${escapeHtml(complaint.status)} · ${escapeHtml(String(complaint.routing?.deliveryStatus || "pending_handoff").replace(/_/g, " "))}</span>
            <span>Community: ${escapeHtml(String(complaint.communityProof?.summary?.latestStatus || "unverified").replace(/_/g, " "))}</span>
          </div>
          <button type="button" class="chip-button view-complaint-btn" data-complaint-id="${complaint._id}">Details</button>
        </div>
      `
    )
    .join("");

  document.getElementById("adminTable").innerHTML =
    adminMarkup || `<div class="table-row empty-state"><span>No complaints are currently in the admin queue.</span></div>`;

  document.querySelectorAll("#adminTable .view-complaint-btn").forEach((button) => {
    button.addEventListener("click", () => openComplaintDetail(button.dataset.complaintId));
  });
}

function renderAlerts(complaints = []) {
  const canManageAlerts = authState?.permissions?.includes("manage_alerts");

  if (!canManageAlerts) {
    alertsList.innerHTML = `<div class="table-row"><span>Login as Admin to manage alerts.</span></div>`;
    return;
  }

  const alertEntries = getFilteredAlerts(complaints);

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
  const visibleUsers = getFilteredUsers(users);

  if (!canDeleteUsers) {
    userManagementList.innerHTML = `<div class="table-row"><span>Login as Admin to manage accounts.</span></div>`;
    return;
  }

  if (!visibleUsers.length) {
    userManagementList.innerHTML = `<div class="table-row"><span>No accounts found.</span></div>`;
    return;
  }

  userManagementList.innerHTML = visibleUsers
    .map(
      (user) => `
        <article class="table-row user-row">
          <div>
            <strong>${escapeHtml(user.username)}</strong>
            <span>${escapeHtml(user.email || "No email recorded")}</span>
            <span>${user.disabledAt ? `Disabled by ${escapeHtml(user.disabledBy || "admin")}` : "Active account"}</span>
            <span>${user.role === "Admin" ? "Bengaluru operations access" : "No operational dashboard access"}</span>
          </div>
          <div class="user-admin-actions">
            <select class="user-role-select" data-user-id="${user._id}">
              <option value="Citizen" ${user.role === "Citizen" ? "selected" : ""}>Citizen</option>
              <option value="Admin" ${user.role === "Admin" ? "selected" : ""}>Admin</option>
            </select>
            <button
              type="button"
              class="secondary-button save-user-btn"
              data-user-id="${user._id}"
            >
              Save access
            </button>
            <button
              type="button"
              class="secondary-button toggle-user-btn"
              data-user-id="${user._id}"
              data-disabled="${user.disabledAt ? "true" : "false"}"
              data-username="${escapeHtml(user.username)}"
            >
              ${user.disabledAt ? "Enable" : "Disable"}
            </button>
            <button
              type="button"
              class="danger-button delete-user-btn"
              data-user-id="${user._id}"
              data-username="${escapeHtml(user.username)}"
              data-role="${escapeHtml(user.role)}"
            >
              Delete
            </button>
          </div>
        </article>
      `
    )
    .join("");

  userManagementList.querySelectorAll(".save-user-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const userId = button.dataset.userId;
      const select = userManagementList.querySelector(`.user-role-select[data-user-id="${userId}"]`);

      try {
        button.disabled = true;
        const result = await apiRequest(`/api/users/${userId}`, {
          method: "PATCH",
          body: JSON.stringify({ role: select.value })
        });
        setDashboardMessage(result.message, "success");
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });

  userManagementList.querySelectorAll(".toggle-user-btn").forEach((button) => {
    button.addEventListener("click", async () => {
      const disabled = button.dataset.disabled === "true";
      const action = disabled ? "enable" : "disable";
      const confirmed = window.confirm(`${action[0].toUpperCase()}${action.slice(1)} account "${button.dataset.username}"?`);

      if (!confirmed) {
        return;
      }

      try {
        button.disabled = true;
        const result = await apiRequest(`/api/users/${button.dataset.userId}`, {
          method: "PATCH",
          body: JSON.stringify({ disabled: !disabled })
        });
        setDashboardMessage(result.message, "success");
        await loadDashboard();
      } catch (error) {
        setDashboardMessage(error.message, "error");
        button.disabled = false;
      }
    });
  });

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

function renderLocalAlertPreferences(preferences = null) {
  const enabled = Boolean(preferences?.enabled);
  const areas = Array.isArray(preferences?.areas) ? preferences.areas : [];
  const threshold = preferences?.severityThreshold || "High";

  localAlertsEnabled.checked = enabled;
  localAlertSeverityThreshold.value = threshold;
  localAlertAreasInput.value = areas.map((area) => area.label || area.normalized || "").filter(Boolean).join(", ");

  if (!authState?.token) {
    localAlertAreasList.innerHTML = `<div class="table-row empty-state"><span>Login to manage local alert areas.</span></div>`;
    localAlertsMessage.textContent = "";
    saveLocalAlertsBtn.disabled = true;
    localAlertsEnabled.disabled = true;
    localAlertAreasInput.disabled = true;
    localAlertSeverityThreshold.disabled = true;
    return;
  }

  saveLocalAlertsBtn.disabled = false;
  localAlertsEnabled.disabled = false;
  localAlertAreasInput.disabled = false;
  localAlertSeverityThreshold.disabled = false;

  if (!areas.length) {
    localAlertAreasList.innerHTML = `<div class="table-row empty-state"><span>No alert areas saved yet. Add area names separated by commas.</span></div>`;
    return;
  }

  localAlertAreasList.innerHTML = areas
    .map(
      (area) => `
        <article class="table-row">
          <div>
            <strong>${escapeHtml(area.label || "Saved area")}</strong>
            <span>${enabled ? `Email alerts enabled in ${escapeHtml(preferences?.cityName || "Bengaluru")} for ${escapeHtml(threshold)} severity and above.` : "Saved, but email alerts are disabled."}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function authorityStageLabel(stage) {
  return ({ handoff: "Authority handoff", acknowledgement: "Authority acknowledgement", resolution: "Authority resolution" })[stage] || "Authority response";
}

function renderAuthorityGovernance(governance) {
  if (!authorityGovernancePanel || !governance) return;
  const counts = governance.counts || {};
  const tickets = Array.isArray(governance.tickets) ? governance.tickets : [];
  authorityGovernancePanel.innerHTML = `
    <div class="authority-governance-head">
      <div><p class="eyebrow">Authority response governance</p><h3>${escapeHtml(governance.city?.name || "City")} response deadlines</h3></div>
      <button type="button" class="secondary-button authority-sla-evaluate">Evaluate now</button>
    </div>
    <p class="helper-text">Deadlines begin from recorded platform events. A portal handoff is not treated as submitted until its official reference is recorded.</p>
    <div class="authority-governance-metrics">
      <article><span>Total tracked</span><strong>${escapeHtml(counts.total || 0)}</strong></article>
      <article><span>On track</span><strong>${escapeHtml(counts.onTrack || 0)}</strong></article>
      <article data-status="overdue"><span>Overdue</span><strong>${escapeHtml(counts.overdue || 0)}</strong></article>
      <article data-status="critical"><span>Level 3</span><strong>${escapeHtml(counts.level3 || 0)}</strong></article>
    </div>
    <div class="authority-governance-list">
      ${tickets.map((ticket) => `
        <article class="authority-governance-ticket" data-level="${escapeHtml(ticket.escalationLevel)}">
          <div><strong>${escapeHtml(ticket.ticketCode)}</strong><span>Level ${escapeHtml(ticket.escalationLevel)}</span></div>
          <h4>${escapeHtml(authorityStageLabel(ticket.stage))} overdue</h4>
          <p>${escapeHtml(ticket.department)} · ${escapeHtml(ticket.severity)} priority</p>
          <small>Due ${escapeHtml(formatDateTime(ticket.dueAt))}${ticket.externalReference ? ` · Ref ${escapeHtml(ticket.externalReference)}` : ""}</small>
          <button type="button" class="secondary-button authority-governance-open" data-complaint-id="${escapeHtml(ticket.complaintId)}">Open complaint</button>
        </article>`).join("") || `<p class="helper-text">No authority response deadlines are overdue.</p>`}
    </div>`;

  authorityGovernancePanel.querySelector(".authority-sla-evaluate")?.addEventListener("click", async (event) => {
    try {
      event.currentTarget.disabled = true;
      const data = await apiRequest("/api/authority-governance/evaluate", { method: "POST", body: "{}" });
      setDashboardMessage(data.message, "success");
      renderAuthorityGovernance(data.authorityGovernance);
    } catch (error) {
      setDashboardMessage(error.message, "error");
      event.currentTarget.disabled = false;
    }
  });
  authorityGovernancePanel.querySelectorAll(".authority-governance-open").forEach((button) => {
    button.addEventListener("click", () => openComplaintDetail(button.dataset.complaintId));
  });
}

async function loadAuthorityGovernance() {
  if (!authorityGovernancePanel) return;
  if (!authState?.permissions?.includes("update_complaint_status")) {
    authorityGovernancePanel.innerHTML = "";
    authorityGovernancePanel.hidden = true;
    return;
  }
  authorityGovernancePanel.hidden = false;
  authorityGovernancePanel.innerHTML = '<p class="helper-text">Loading Bengaluru authority deadlines...</p>';
  try {
    const data = await apiRequest("/api/authority-governance", { method: "GET" });
    renderAuthorityGovernance(data.authorityGovernance);
  } catch (error) {
    authorityGovernancePanel.innerHTML = `<p class="decision-audit-warning">${escapeHtml(error.message)}</p>`;
  }
}

function renderExternalContextUsage(integrations = null) {
  if (!externalContextUsagePanel) return;
  if (!integrations) {
    externalContextUsagePanel.innerHTML = "";
    externalContextUsagePanel.hidden = true;
    return;
  }

  const rows = [
    ["Weather context", integrations.weather],
    ["Civic search", integrations.civicSearch]
  ];
  externalContextUsagePanel.hidden = false;
  externalContextUsagePanel.innerHTML = rows
    .map(([label, usage]) => {
      const used = Number(usage?.used || 0);
      const limit = Math.max(1, Number(usage?.limit || 0));
      const percentage = Math.min(100, Math.round((used / limit) * 100));
      return `
        <article class="external-context-meter">
          <span>${escapeHtml(label)}</span>
          <strong>${used} / ${limit}</strong>
          <div class="external-context-meter-track" aria-label="${escapeHtml(label)} monthly usage">
            <i style="--usage:${percentage}%"></i>
          </div>
          <p>${usage?.enabled ? `${Math.max(0, limit - used)} external calls remain for ${escapeHtml(usage.month || "this month")}. Cached results do not use this allowance.` : "Integration is not configured."}</p>
        </article>
      `;
    })
    .join("");
}

async function loadExternalContextUsage() {
  if (!authState?.permissions?.includes("view_dashboard")) {
    renderExternalContextUsage(null);
    return;
  }

  externalContextUsagePanel.hidden = false;
  externalContextUsagePanel.innerHTML = '<p class="helper-text">Loading external context usage...</p>';
  try {
    const data = await apiRequest("/api/context/usage", { method: "GET" });
    renderExternalContextUsage(data.integrations || null);
  } catch (error) {
    externalContextUsagePanel.innerHTML = `<p class="helper-text">${escapeHtml(error.message)}</p>`;
  }
}

function parseLocalAlertAreasInput() {
  return localAlertAreasInput.value
    .split(",")
    .map((label) => label.replace(/\s+/g, " ").trim())
    .filter(Boolean)
    .map((label) => ({ label }));
}

async function loadLocalAlertPreferences() {
  if (!authState?.token) {
    localAlertPreferences = null;
    renderLocalAlertPreferences(null);
    return;
  }

  try {
    const data = await apiRequest("/api/local-alert-preferences", { method: "GET" });
    localAlertPreferences = data.preferences || null;
    renderLocalAlertPreferences(localAlertPreferences);
    renderCommunityCases(dashboardDataCache.communityCases || []);
  } catch (error) {
    localAlertsMessage.textContent = error.message;
  }
}

async function saveLocalAlertPreferences(event) {
  event.preventDefault();

  try {
    if (!authState?.token) {
      throw new Error("Login before saving local alert areas.");
    }

    saveLocalAlertsBtn.disabled = true;
    localAlertsMessage.textContent = "Saving local alert areas...";
    const data = await apiRequest("/api/local-alert-preferences", {
      method: "PATCH",
      body: JSON.stringify({
        enabled: localAlertsEnabled.checked,
        severityThreshold: localAlertSeverityThreshold.value,
        areas: parseLocalAlertAreasInput()
      })
    });

    localAlertPreferences = data.preferences || null;
    renderLocalAlertPreferences(localAlertPreferences);
    localAlertsMessage.textContent = data.message || "Local alert areas saved.";
    setDashboardMessage(localAlertsMessage.textContent, "success");
    await loadDashboard();
  } catch (error) {
    localAlertsMessage.textContent = error.message;
    setDashboardMessage(error.message, "error");
  } finally {
    saveLocalAlertsBtn.disabled = false;
  }
}

function markerColor(status) {
  if (status === "Resolved") return "#49d98f";
  if (status === "In Progress") return "#ffb84d";
  if (status === "Escalated" || status === "Needs Review") return "#ff6b7a";
  return "#ff6b7a";
}

function renderMap(complaints, intelligence = null) {
  if (!complaintsMapCanvas || !mapComplaintList) {
    return;
  }

  const mappedComplaints = (complaints || []).filter(
    (complaint) =>
      Number.isFinite(Number(complaint?.mapLocation?.lat)) &&
      Number.isFinite(Number(complaint?.mapLocation?.lng))
  );
  const sortedComplaints = [...mappedComplaints].sort((left, right) => {
    const priorityDelta = priorityRank(right.priority) - priorityRank(left.priority);
    if (priorityDelta !== 0) {
      return priorityDelta;
    }
    return new Date(right.createdAt || 0) - new Date(left.createdAt || 0);
  });

  mapVisibleCount.textContent = String(sortedComplaints.length);
  mapHotspotLabel.textContent = summarizeHotspot(sortedComplaints);

  const watchList = sortedComplaints.filter((complaint) => complaint.priority === "Critical" || complaint.status === "Escalated");
  mapPriorityWatch.textContent = watchList.length ? pluralize(watchList.length, "critical case") : "No critical cluster";

  if (!sortedComplaints.length) {
    complaintsMapCanvas.innerHTML = `
      <div class="map-empty-state">
        <div>
          <strong>No mapped complaints yet.</strong>
          <p>Complaints with resolved coordinates will appear here as soon as they are available.</p>
        </div>
      </div>
    `;
    mapComplaintList.innerHTML = `<div class="table-row empty-state"><span>No mapped complaints available in the current result set.</span></div>`;
    return;
  }

  const latitudes = sortedComplaints.map((complaint) => Number(complaint.mapLocation.lat));
  const longitudes = sortedComplaints.map((complaint) => Number(complaint.mapLocation.lng));
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);
  const minLng = Math.min(...longitudes);
  const maxLng = Math.max(...longitudes);
  const latSpan = Math.max(maxLat - minLat, 0.02);
  const lngSpan = Math.max(maxLng - minLng, 0.02);
  const hotspotGroups = {};

  complaintsMapCanvas.innerHTML = sortedComplaints
    .map((complaint, index) => {
      const lat = Number(complaint.mapLocation.lat);
      const lng = Number(complaint.mapLocation.lng);
      const x = 10 + ((lng - minLng) / lngSpan) * 80;
      const y = 12 + (1 - (lat - minLat) / latSpan) * 74;
      const hotspotKey = String(complaint.location || "Unknown").trim() || "Unknown";
      hotspotGroups[hotspotKey] = hotspotGroups[hotspotKey] || { x, y, count: 0 };
      hotspotGroups[hotspotKey].count += 1;

      return `
        <button
          type="button"
          class="map-marker"
          data-map-complaint-id="${complaint._id}"
          data-map-location="${escapeHtml(complaint.location || "Unknown")}"
          style="left:${x}%; top:${y}%; color:${markerColor(complaint.status)}; background:${markerColor(complaint.status)};"
          aria-label="${escapeHtml(complaint.type)} at ${escapeHtml(complaint.location)}"
          title="${escapeHtml(complaint.type)} · ${escapeHtml(complaint.location)}"
        ></button>
      `;
    })
    .join("");

  (intelligence?.radar || []).forEach((wave) => {
    if (!wave.mapLocation) return;
    const x = 10 + ((Number(wave.mapLocation.lng) - minLng) / lngSpan) * 80;
    const y = 12 + (1 - (Number(wave.mapLocation.lat) - minLat) / latSpan) * 74;
    const size = 44 + Math.round(Number(wave.intensity || 0) * 0.8);
    complaintsMapCanvas.insertAdjacentHTML("beforeend", `<div class="radar-map-wave" style="left:${x}%;top:${y}%;--wave-size:${size}px;--wave-alpha:${Math.max(0.16, Number(wave.intensity || 0) / 180)}" title="${escapeHtml(wave.zone)} risk wave"></div>`);
  });

  Object.entries(hotspotGroups)
    .filter(([, group]) => group.count > 1)
    .forEach(([label, group]) => {
      complaintsMapCanvas.insertAdjacentHTML(
        "beforeend",
        `<div class="map-cluster-label" style="left:${group.x}%; top:${Math.max(8, group.y - 8)}%;">${escapeHtml(label)} · ${group.count}</div>`
      );
    });

  mapComplaintList.innerHTML = sortedComplaints
    .slice(0, 6)
    .map(
      (complaint) => `
        <article class="map-complaint-item">
          <div class="issue-card-head">
            <strong>${escapeHtml(complaint.type)}</strong>
            <span class="status-pill" data-status="${escapeHtml(complaint.status)}">${escapeHtml(complaint.status)}</span>
          </div>
          <p>${escapeHtml(complaint.location)}</p>
          <div class="issue-meta">
            ${severityBadge(complaint.priority)}
            ${confidenceBadge(complaint)}
          </div>
          <button type="button" class="secondary-button map-open-btn" data-complaint-id="${complaint._id}">Open case</button>
        </article>
      `
    )
    .join("");

  const focusComplaint = (complaintId) => {
    const selectedComplaint = sortedComplaints.find((complaint) => complaint._id === complaintId);
    if (!selectedComplaint) {
      return;
    }

    complaintsMapCanvas.querySelectorAll(".map-marker").forEach((marker) => {
      marker.classList.toggle("is-active", marker.dataset.mapComplaintId === complaintId);
    });
    updateLiveLocationMap(
      selectedComplaint.location || "Selected complaint location",
      selectedComplaint.mapLocation ? `${selectedComplaint.mapLocation.lat}, ${selectedComplaint.mapLocation.lng}` : selectedComplaint.location
    );
    liveLocationStatus.textContent = `${selectedComplaint.type} · ${selectedComplaint.location} · ${selectedComplaint.status}`;
  };

  complaintsMapCanvas.querySelectorAll(".map-marker").forEach((marker) => {
    marker.addEventListener("mouseenter", () => {
      focusComplaint(marker.dataset.mapComplaintId);
    });
    marker.addEventListener("click", () => {
      focusComplaint(marker.dataset.mapComplaintId);
      openComplaintDetail(marker.dataset.mapComplaintId);
    });
  });

  mapComplaintList.querySelectorAll(".map-open-btn").forEach((button) => {
    button.addEventListener("click", () => {
      focusComplaint(button.dataset.complaintId);
      openComplaintDetail(button.dataset.complaintId);
    });
  });

  focusComplaint(sortedComplaints[0]._id);
}

function updateVoiceTranscriptValue(finalText, interimText = "") {
  const transcript = [finalText.trim(), interimText.trim()].filter(Boolean).join(" ").trim();
  voiceTranscriptInput.value = transcript;
  window.dispatchEvent(
    new CustomEvent("smart-community:voice-transcript", {
      detail: { transcript }
    })
  );
}

function extractBase64Payload(dataUrl) {
  const value = String(dataUrl || "");
  const commaIndex = value.indexOf(",");
  return commaIndex >= 0 ? value.slice(commaIndex + 1) : value;
}

function toReadableTranscriptionError(error) {
  const message = String(error?.message || "").trim();

  if (!message) {
    return "Audio transcription failed. Type the complaint summary manually.";
  }

  if (/failed to fetch/i.test(message)) {
    return "Transcription could not reach the service. Check internet access and your Deepgram configuration.";
  }

  return message;
}

function getSupportedRecordingMimeType() {
  if (!window.MediaRecorder) {
    return "";
  }

  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/ogg;codecs=opus",
    "audio/mp4"
  ];

  return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
}

function getRecordingExtension(mimeType) {
  if (mimeType.includes("ogg")) return "ogg";
  if (mimeType.includes("mp4")) return "m4a";
  return "webm";
}

function stopVoiceRecorderStream() {
  if (voiceRecorderStream) {
    voiceRecorderStream.getTracks().forEach((track) => track.stop());
    voiceRecorderStream = null;
  }
}

function updateVoiceRecordingUi() {
  const hasAudio = Boolean(currentVoiceAudioData?.dataUrl);
  const isVoiceMode = complaintInputMode.value === "voice";

  startRecordingBtn.disabled = !isVoiceMode || isVoiceRecording;
  stopRecordingBtn.disabled = !isVoiceMode || !isVoiceRecording;
  clearRecordingBtn.disabled = !isVoiceMode || isVoiceRecording || !hasAudio;
  recordingIndicator.hidden = !isVoiceRecording;
  recordingIndicator.dataset.state = isVoiceRecording ? "live" : "idle";
}

function clearVoiceAudioSelection() {
  if (voiceMediaRecorder && voiceMediaRecorder.state !== "inactive") {
    try {
      voiceMediaRecorder.stop();
    } catch (_error) {
      // ignore stop failures during cleanup
    }
  }

  voiceMediaRecorder = null;
  voiceRecordingChunks = [];
  voiceRecordingStartedAt = 0;
  isVoiceRecording = false;
  stopVoiceRecorderStream();

  if (currentVoiceAudioObjectUrl) {
    URL.revokeObjectURL(currentVoiceAudioObjectUrl);
    currentVoiceAudioObjectUrl = null;
  }

  currentVoiceAudioData = null;
  voiceAudioPreview.hidden = true;
  voiceAudioPreview.removeAttribute("src");
  voiceAudioMeta.textContent = "No recording captured yet.";
  updateVoiceRecordingUi();
}

async function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Unable to prepare the uploaded file."));
    reader.readAsDataURL(file);
  });
}

async function transcribeVoiceAudio() {
  try {
    if (!currentVoiceAudioData?.dataUrl) {
      throw new Error("No voice recording is available for transcription.");
    }

    voiceTranscriptStatus.textContent = "Sending audio to Deepgram for transcription...";
    const result = await apiRequest("/api/transcribe-audio", {
      method: "POST",
      body: JSON.stringify({
        audioBase64: extractBase64Payload(currentVoiceAudioData.dataUrl),
        filename: currentVoiceAudioData.filename,
        mimeType: currentVoiceAudioData.mimeType
      })
    });

    if (!result.transcript) {
      throw new Error("Deepgram did not return transcript text.");
    }

    updateVoiceTranscriptValue(result.transcript);
    voiceTranscriptStatus.textContent = "Recording transcribed by Deepgram. Review the text before submitting.";
  } catch (serviceError) {
    const message = toReadableTranscriptionError(serviceError);
    voiceTranscriptStatus.textContent = message;
    setDashboardMessage(message, "error");
  }
}

async function requestRecorderPermission() {
  if (!window.isSecureContext) {
    throw new Error("Microphone recording requires HTTPS or localhost.");
  }

  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error("This browser does not support microphone recording.");
  }

  return navigator.mediaDevices.getUserMedia({ audio: true });
}

async function startVoiceRecording() {
  if (isVoiceRecording) {
    return;
  }

  if (!window.MediaRecorder) {
    voiceTranscriptStatus.textContent =
      "Live recording is not supported in this browser. Use a supported browser or type the complaint summary manually.";
    return;
  }

  try {
    const mimeType = getSupportedRecordingMimeType();
    voiceTranscriptStatus.textContent = "Requesting microphone permission...";
    voiceRecorderStream = await requestRecorderPermission();
    voiceRecordingChunks = [];
    voiceMediaRecorder = mimeType
      ? new MediaRecorder(voiceRecorderStream, { mimeType })
      : new MediaRecorder(voiceRecorderStream);

    voiceMediaRecorder.addEventListener("dataavailable", (event) => {
      if (event.data && event.data.size > 0) {
        voiceRecordingChunks.push(event.data);
      }
    });

      voiceMediaRecorder.addEventListener("stop", async () => {
        const finalMimeType = voiceMediaRecorder?.mimeType || mimeType || "audio/webm";
        const blob = new Blob(voiceRecordingChunks, { type: finalMimeType });
        const durationSeconds = voiceRecordingStartedAt
          ? Math.max(1, Math.round((Date.now() - voiceRecordingStartedAt) / 1000))
        : null;

      isVoiceRecording = false;
      stopVoiceRecorderStream();
      updateVoiceRecordingUi();

      if (!blob.size) {
        voiceTranscriptStatus.textContent = "No audio was captured. Record again and speak clearly.";
        voiceAudioMeta.textContent = "No recording captured yet.";
        return;
      }

      clearVoiceAudioSelection();
      const filename = `voice-complaint-${Date.now()}.${getRecordingExtension(finalMimeType)}`;
      const recordingFile = new File([blob], filename, { type: finalMimeType });

      currentVoiceAudioObjectUrl = URL.createObjectURL(blob);
      voiceAudioPreview.src = currentVoiceAudioObjectUrl;
      voiceAudioPreview.hidden = false;
      currentVoiceAudioData = {
        filename,
        mimeType: finalMimeType,
        dataUrl: await readFileAsDataUrl(recordingFile)
        };
        voiceAudioMeta.textContent = `${filename} - ${durationSeconds || 1}s - ${Math.max(1, Math.round(blob.size / 1024))} KB`;
        voiceTranscriptStatus.textContent = "Recording captured. Transcribing now...";
        updateVoiceRecordingUi();
        window.dispatchEvent(
          new CustomEvent("smart-community:voice-state", {
            detail: { state: "processing" }
          })
        );
        await transcribeVoiceAudio();
      });

      voiceRecordingStartedAt = Date.now();
      isVoiceRecording = true;
      updateVoiceRecordingUi();
      window.dispatchEvent(
        new CustomEvent("smart-community:voice-state", {
          detail: { state: "listening" }
        })
      );
      voiceMediaRecorder.start();
      voiceTranscriptStatus.textContent = "Recording in progress. Speak your complaint, then press Stop Recording.";
    } catch (error) {
      isVoiceRecording = false;
      stopVoiceRecorderStream();
      updateVoiceRecordingUi();
      window.dispatchEvent(
        new CustomEvent("smart-community:voice-state", {
          detail: { state: "error", message: error?.message || "Unable to start live recording." }
        })
      );
      voiceTranscriptStatus.textContent =
        error?.name === "NotAllowedError"
          ? "Microphone access is blocked. Allow microphone access and try recording again."
          : error?.message || "Unable to start live recording. Check microphone access and try again.";
  }
}

  function stopVoiceRecording() {
    if (!voiceMediaRecorder || voiceMediaRecorder.state === "inactive") {
      return;
    }

    voiceTranscriptStatus.textContent = "Stopping recording and preparing transcription...";
    window.dispatchEvent(
      new CustomEvent("smart-community:voice-state", {
        detail: { state: "processing" }
      })
    );
    voiceMediaRecorder.stop();
  }

function setComplaintInputMode(mode) {
  const isVoiceMode = mode === "voice";

  typedComplaintField.hidden = isVoiceMode;
  typedComplaintField.style.display = isVoiceMode ? "none" : "";
  typedComplaintInput.disabled = isVoiceMode;
  voiceComplaintField.hidden = !isVoiceMode;
  voiceComplaintField.style.display = isVoiceMode ? "" : "none";
  voiceTranscriptInput.disabled = !isVoiceMode;
  updateVoiceRecordingUi();

  if (isVoiceMode) {
    if (!voiceTranscriptInput.value.trim()) {
      voiceTranscriptStatus.textContent = currentVoiceAudioData?.dataUrl
        ? "Recording captured. Review the transcript or record again."
        : "Record your complaint and the transcript will appear here automatically.";
    } else {
      voiceTranscriptStatus.textContent = currentVoiceAudioData?.dataUrl
        ? "Recording captured. Review the transcript and submit when ready."
        : "Voice complaint summary ready. You can submit now or record again.";
    }
    return;
  }

  voiceTranscriptStatus.textContent = "Select Voice transcript to record your complaint live.";
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

  startRecordingBtn?.addEventListener("click", startVoiceRecording);
  stopRecordingBtn?.addEventListener("click", stopVoiceRecording);
  clearRecordingBtn?.addEventListener("click", () => {
    clearVoiceAudioSelection();
    updateVoiceTranscriptValue("");
    voiceTranscriptStatus.textContent = "Recording cleared. Record your complaint again to generate a new transcript.";
  });
  voiceTranscriptInput.addEventListener("input", () => {
    if (complaintInputMode.value !== "voice") {
      return;
    }

    const hasTranscript = Boolean(voiceTranscriptInput.value.trim());
    voiceTranscriptStatus.textContent = hasTranscript
      ? currentVoiceAudioData?.dataUrl
        ? "Recording captured. Review the transcript and submit when ready."
        : "Voice complaint summary ready. You can submit now or record again."
      : currentVoiceAudioData?.dataUrl
        ? "Recording captured. Speak again or edit the summary manually before submitting."
        : "Record your complaint and the transcript will appear here automatically.";
  });
}

function renderLoggedOutState() {
  renderMetrics({ totalComplaints: 0, openComplaints: 0 });
  renderAdminInsights([]);
  renderAiObservability(null);
  renderDigitalTwin(null);
  renderRiskPredictions(null);
  renderCivicIntelligence(null);
  renderCommunityCases([]);
  renderIncidentCommands([]);
  renderIncidentClusters([]);
  document.getElementById("recentComplaints").innerHTML = `<div class="table-row empty-state"><span>Login to view recent complaints.</span></div>`;
  document.getElementById("complaintsList").innerHTML = `<div class="table-row empty-state"><span>Login to view your complaint history.</span></div>`;
  document.getElementById("adminTable").innerHTML = `<div class="table-row empty-state"><span>Login as Admin to access the command center.</span></div>`;
  alertsList.innerHTML = `<div class="table-row"><span>Login as Admin to manage alerts.</span></div>`;
  userManagementList.innerHTML = `<div class="table-row"><span>Login as Admin to manage accounts.</span></div>`;
  if (mapComplaintList) {
    mapComplaintList.innerHTML = `<div class="table-row empty-state"><span>Login to inspect the operations map.</span></div>`;
  }
  if (complaintsMapCanvas) {
    complaintsMapCanvas.innerHTML = `<div class="map-empty-state"><div><strong>Operations map locked.</strong><p>Login to render complaint markers and hotspot clusters.</p></div></div>`;
  }
  if (mapVisibleCount) {
    mapVisibleCount.textContent = "0";
  }
  if (mapHotspotLabel) {
    mapHotspotLabel.textContent = "No area selected";
  }
  if (mapPriorityWatch) {
    mapPriorityWatch.textContent = "No critical cluster";
  }
}

function renderDashboardLoadingState() {
  const skeleton = `<div class="skeleton-card"></div>`;
  document.getElementById("recentComplaints").innerHTML = `${skeleton}${skeleton}`;
  document.getElementById("complaintsList").innerHTML = `${skeleton}${skeleton}${skeleton}`;
  document.getElementById("adminTable").innerHTML = `${skeleton}${skeleton}`;
  const digitalTwinPanel = document.getElementById("digitalTwinPanel");
  const riskPredictionPanel = document.getElementById("riskPredictionPanel");
  const incidentCommandPanel = document.getElementById("incidentCommandPanel");
  const incidentClusterPanel = document.getElementById("incidentClusterPanel");
  if (digitalTwinPanel) {
    digitalTwinPanel.innerHTML = `${skeleton}${skeleton}`;
  }
  if (riskPredictionPanel) {
    riskPredictionPanel.innerHTML = `${skeleton}${skeleton}`;
  }
  if (incidentCommandPanel) {
    incidentCommandPanel.innerHTML = `${skeleton}${skeleton}`;
  }
  if (incidentClusterPanel) {
    incidentClusterPanel.innerHTML = `${skeleton}${skeleton}`;
  }
  alertsList.innerHTML = `${skeleton}${skeleton}`;
  userManagementList.innerHTML = `${skeleton}${skeleton}`;
  if (mapComplaintList) {
    mapComplaintList.innerHTML = `${skeleton}${skeleton}`;
  }
  if (complaintsMapCanvas) {
    complaintsMapCanvas.innerHTML = `<div class="map-empty-state"><div><strong>Loading markers...</strong><p>Preparing the visible complaint map for the current dashboard filters.</p></div></div>`;
  }
}

function rerenderDashboardViews() {
  renderComplaints(dashboardDataCache.complaints || []);
  renderAlerts(dashboardDataCache.complaints || []);
  renderUserManagement(dashboardDataCache.users || []);
  renderDigitalTwin(dashboardDataCache.digitalTwin || null);
  renderRiskPredictions(dashboardDataCache.riskPredictions || null);
  renderCivicIntelligence(dashboardDataCache.civicIntelligence || null);
  renderCommunityCases(dashboardDataCache.communityCases || []);
  renderIncidentCommands(dashboardDataCache.incidentCommands || []);
  renderIncidentClusters(dashboardDataCache.incidentClusters || []);
  renderMap(dashboardDataCache.complaints || [], dashboardDataCache.civicIntelligence || null);
}

function setupDashboardFilters() {
  const rerender = () => rerenderDashboardViews();
  const reload = () => scheduleDashboardReload();

  complaintSearchInput?.addEventListener("input", reload);
  complaintStatusFilter?.addEventListener("change", reload);
  complaintSortSelect?.addEventListener("change", reload);
  clearComplaintFiltersBtn?.addEventListener("click", () => {
    complaintSearchInput.value = "";
    complaintStatusFilter.value = "";
    complaintSortSelect.value = "newest";
    reload();
  });

  alertSearchInput?.addEventListener("input", reload);
  alertPriorityFilter?.addEventListener("change", reload);
  clearAlertFiltersBtn?.addEventListener("click", () => {
    alertSearchInput.value = "";
    alertPriorityFilter.value = "";
    reload();
  });

  userSearchInput?.addEventListener("input", reload);
  userStateFilter?.addEventListener("change", reload);
  clearUserFiltersBtn?.addEventListener("click", () => {
    userSearchInput.value = "";
    userStateFilter.value = "";
    reload();
  });

  window.addEventListener("smart-community:auth-changed", rerender);
}

function setupDraftAutosave() {
  [reportLocationInput, complaintInputMode, typedComplaintInput, voiceTranscriptInput].forEach((element) => {
    element?.addEventListener("input", scheduleDraftSave);
    element?.addEventListener("change", scheduleDraftSave);
  });

  clearDraftBtn?.addEventListener("click", () => {
    resetComposer();
  });

}

async function loadDashboard() {
  if (!authState?.token) {
    setDashboardMessage("Login or register to continue as Citizen or Admin.");
    renderPermissions([]);
    renderLoggedOutState();
    return;
  }

  renderDashboardLoadingState();
  const query = buildDashboardQueryParams();
  const path = query ? `/api/dashboard?${query}` : "/api/dashboard";
  const data = await apiRequest(path, { method: "GET" });
  dashboardDataCache = {
    complaints: data.complaints || [],
    users: data.manageableUsers || [],
    digitalTwin: data.digitalTwin || null,
    riskPredictions: data.riskPredictions || null,
    civicIntelligence: data.civicIntelligence || null,
    communityCases: data.communityCases || [],
    incidentCommands: data.incidentCommands || [],
    incidentClusters: data.incidentClusters || []
  };
  renderMetrics(data.metrics);
  renderRecentComplaints(data.complaints);
  renderComplaints(data.complaints);
  renderAdminInsights(data.complaints, data.analytics || null);
  renderAiObservability(data.aiObservability || null);
  renderDigitalTwin(data.digitalTwin || null);
  renderRiskPredictions(data.riskPredictions || null);
  renderCivicIntelligence(data.civicIntelligence || null);
  renderCommunityCases(data.communityCases || []);
  renderIncidentCommands(data.incidentCommands || []);
  renderIncidentClusters(data.incidentClusters || []);
  renderAdminTable(data.complaints);
  renderAlerts(data.complaints);
  renderMap(data.complaints, data.civicIntelligence || null);
  renderUserManagement(data.manageableUsers || []);
  await loadLocalAlertPreferences();

  if (data.auth) {
    authState = { ...authState, role: data.auth.role, username: data.auth.username, permissions: data.auth.permissions };
    saveAuthState();
    applyPermissionState();
  }
  await Promise.all([
    loadAuthorityGovernance(),
    loadExternalContextUsage()
  ]);
}

function resetComposer({ clearDraft = true } = {}) {
  form.reset();
  imageAnalysisRequestId += 1;
  uploadPreview.hidden = true;
  imagePreview.removeAttribute("src");
  imageName.textContent = "No image selected";
  imageHintText.textContent = "AI visual inspection will appear here after upload.";
  aiImageDescription.value = "";
  aiAccuracyStatus.textContent = "Upload an image to analyze the visible scene.";
  retryImageAnalysisBtn.hidden = true;
  retryImageAnalysisBtn.disabled = false;
  imageAnalysisProgress.hidden = true;
  imageAnalysisProgress.dataset.state = "working";
  imageAnalysisProgressFill.style.width = "0%";
  imageAnalysisProgressTrack.setAttribute("aria-valuenow", "0");
  currentImageFeatures = null;
  currentImageDataUrl = null;
  currentImageAiPayload = null;
  currentImageAnalysisToken = "";
  currentReportMapLocation = null;
  resetWeatherPreview();
  resetCivicContext();
  clearEmailProgressTimer();
  emailProgress.hidden = true;
  emailProgress.dataset.state = "";
  emailProgressFill.style.width = "0%";
  emailProgressValue.textContent = "0%";
  emailProgressLabel.textContent = "Preparing report...";
  if (reportResultPanel) reportResultPanel.hidden = true;
  if (postSubmitContext) postSubmitContext.innerHTML = "";
  if (closeContactsForm) {
    closeContactsForm.hidden = true;
    closeContactsForm.reset();
  }
  if (closeContactsMessage) closeContactsMessage.textContent = "";
  updateLiveLocationMap("");
  clearVoiceAudioSelection();
  updateVoiceTranscriptValue("");
  setComplaintInputMode(complaintInputMode.value || "text");
  if (clearDraft) {
    clearReportDraft(false);
    updateDraftStatus("Draft cleared after reset.", "cleared");
  }
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

async function prepareImageForAi(file) {
  if (!file) return null;

  const image = await loadImageElement(file);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");
  const maxSide = 768;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));

  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  const mimeType = file.type === "image/png" || file.type === "image/webp" ? file.type : "image/jpeg";
  const quality = mimeType === "image/jpeg" ? 0.78 : undefined;
  const dataUrl = canvas.toDataURL(mimeType, quality);
  const base64 = extractBase64Payload(dataUrl);

  return {
    base64,
    mimeType,
    width: canvas.width,
    height: canvas.height,
    bytes: Math.floor((base64.length * 3) / 4)
  };
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

function formatImageAnalysisResult(imageAnalysis = {}) {
  const lines = [];
  if (imageAnalysis.incident) lines.push(`Incident: ${imageAnalysis.incident}`);
  if (imageAnalysis.description) lines.push(`Scene: ${imageAnalysis.description}`);
  if (imageAnalysis.hazards?.length) lines.push(`Hazards: ${imageAnalysis.hazards.join(", ")}`);
  return lines.join("\n") || imageAnalysis.reason || "No visual incident could be confirmed from this image.";
}

function updateImageAnalysisProgress({ value, label, detail, state = "working", hidden = false }) {
  const boundedValue = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
  imageAnalysisProgress.hidden = hidden;
  imageAnalysisProgress.dataset.state = state;
  imageAnalysisProgressLabel.textContent = label;
  imageAnalysisProgressValue.textContent = `${boundedValue}%`;
  imageAnalysisProgressFill.style.width = `${boundedValue}%`;
  imageAnalysisProgressTrack.setAttribute("aria-valuenow", String(boundedValue));
  imageAnalysisProgressDetail.textContent = detail;
}

function renderImageAnalysisResult(imageAnalysis = {}) {
  const rawConfidence = Number(imageAnalysis.confidence || 0);
  const confidence = rawConfidence > 0 && rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;
  aiImageDescription.value = formatImageAnalysisResult(imageAnalysis);
  retryImageAnalysisBtn.hidden = imageAnalysis.status !== "unavailable";

  if (imageAnalysis.status === "complete") {
    aiAccuracyStatus.textContent = `Visual analysis completed${confidence ? ` with ${Math.round(confidence)}% evidence confidence` : ""}.`;
    updateImageAnalysisProgress({
      value: 100,
      label: "Image analysis complete",
      detail: "The visible scene, hazards, and complaint consistency were checked.",
      state: "success"
    });
  } else if (imageAnalysis.status === "needs_review") {
    aiAccuracyStatus.textContent = imageAnalysis.additionalEvidenceRequired
      ? "Additional evidence is recommended because the image is unclear or incomplete."
      : `Human review is recommended${confidence ? ` (${Math.round(confidence)}% evidence confidence)` : ""}.`;
    updateImageAnalysisProgress({
      value: 100,
      label: "Analysis complete - review recommended",
      detail: imageAnalysis.additionalEvidenceRequired
        ? "The image was processed, but clearer or additional evidence would improve the decision."
        : "The image was processed and retained for a human decision check.",
      state: "review"
    });
  } else if (imageAnalysis.status === "processing") {
    aiAccuracyStatus.textContent = imageAnalysis.reason || "Visual evidence is still being analyzed.";
    updateImageAnalysisProgress({
      value: 88,
      label: "Vision service is preparing",
      detail: "The image is ready. The analysis service may be completing a cold start.",
      state: "working"
    });
  } else {
    const reference = imageAnalysis.requestId ? ` Reference: ${imageAnalysis.requestId}.` : "";
    aiAccuracyStatus.textContent = imageAnalysis.reason || "Visual analysis is unavailable. The photo will still be attached for review.";
    updateImageAnalysisProgress({
      value: 100,
      label: "Image analysis unavailable",
      detail: `The photo remains attached. Re-submit it to retry visual analysis.${reference}`,
      state: "error"
    });
  }
}

function waitForImageAnalysisRetry(milliseconds) {
  return new Promise((resolve) => window.setTimeout(resolve, milliseconds));
}

async function analyzePreparedImage(requestId) {
  if (!currentImageAiPayload) {
    throw new Error("The image could not be prepared for analysis.");
  }

  aiImageDescription.value = "Analyzing the uploaded image...";
  const analysisStages = [
    { value: 22, label: "Analyzing image", detail: "Reading the visible scene and infrastructure." },
    { value: 46, label: "Detecting visible hazards", detail: "Checking for safety risks and damaged infrastructure." },
    { value: 68, label: "Checking multiple issues", detail: "Looking for more than one civic problem in the image." },
    { value: 84, label: "Comparing evidence", detail: "Comparing the image with the complaint text and location." }
  ];
  let stageIndex = 0;
  aiAccuracyStatus.textContent = `${analysisStages[stageIndex].label}...`;
  updateImageAnalysisProgress(analysisStages[stageIndex]);
  const stageTimer = window.setInterval(() => {
    if (requestId !== imageAnalysisRequestId) return;
    stageIndex = Math.min(stageIndex + 1, analysisStages.length - 1);
    aiAccuracyStatus.textContent = `${analysisStages[stageIndex].label}...`;
    updateImageAnalysisProgress(analysisStages[stageIndex]);
  }, 1800);
  showAiAccuracyBtn.disabled = true;
  retryImageAnalysisBtn.hidden = true;
  retryImageAnalysisBtn.disabled = true;

  try {
    const requestBody = JSON.stringify({
      textComplaint: String(typedComplaintInput?.value || "").trim(),
      voiceTranscript: String(voiceTranscriptInput?.value || "").trim(),
      location: String(reportLocationInput?.value || "").trim(),
      imageFeatures: currentImageFeatures,
      imageBase64: currentImageAiPayload.base64,
      imageMimeType: currentImageAiPayload.mimeType
    });

    let analysis = null;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      analysis = await apiRequest("/api/analyze-image", { method: "POST", body: requestBody });
      if (requestId !== imageAnalysisRequestId) return;
      const imageAnalysis = analysis.imageAnalysis || {};
      renderImageAnalysisResult(imageAnalysis);
      currentImageAnalysisToken = String(analysis.imageAnalysisToken || "");
      if (currentImageAnalysisToken) {
        resetCivicContext({ imageReady: true });
      }
      if (!imageAnalysis.retryable || imageAnalysis.status !== "processing") break;
      aiAccuracyStatus.textContent = `Visual analysis is still preparing. Retrying automatically (${attempt + 1}/20)...`;
      updateImageAnalysisProgress({
        value: 90,
        label: "Waiting for visual analysis",
        detail: `The vision service is preparing. Automatic retry ${attempt + 1} of 20.`,
        state: "working"
      });
      if (attempt === 19) {
        aiAccuracyStatus.textContent = "Visual analysis is still preparing. Re-submit the image shortly to try again.";
        retryImageAnalysisBtn.hidden = false;
        updateImageAnalysisProgress({
          value: 90,
          label: "Analysis delayed",
          detail: "The image is retained. Re-submit it after the vision service finishes starting.",
          state: "review"
        });
        break;
      }
      await waitForImageAnalysisRetry(3000);
      if (requestId !== imageAnalysisRequestId) return;
    }
  } finally {
    window.clearInterval(stageTimer);
    if (requestId === imageAnalysisRequestId) {
      showAiAccuracyBtn.disabled = false;
      retryImageAnalysisBtn.disabled = false;
    }
  }
}

function setupImageUpload() {
  imageFileInput.addEventListener("change", async () => {
    const requestId = ++imageAnalysisRequestId;
    currentImageAnalysisToken = "";
    resetCivicContext();
    const file = imageFileInput.files[0];
    if (!file) {
      uploadPreview.hidden = true;
      imagePreview.removeAttribute("src");
      aiImageDescription.value = "";
      aiAccuracyStatus.textContent = "Upload an image to attach visual evidence.";
      currentImageFeatures = null;
      currentImageDataUrl = null;
      currentImageAiPayload = null;
      retryImageAnalysisBtn.hidden = true;
      imageAnalysisProgress.hidden = true;
      scheduleDraftSave();
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    imagePreview.src = previewUrl;
    imageName.textContent = file.name;
    imageHintText.textContent = `Selected ${file.type || "image"} - ${Math.round(file.size / 1024)} KB`;
    uploadPreview.hidden = false;

    try {
      aiAccuracyStatus.textContent = "Uploading evidence...";
      retryImageAnalysisBtn.hidden = true;
      updateImageAnalysisProgress({
        value: 8,
        label: "Preparing image",
        detail: "Validating, resizing, and preparing the selected evidence.",
        state: "working"
      });
      currentImageDataUrl = await readFileAsDataUrl(file);
      currentImageAiPayload = await prepareImageForAi(file);
      currentImageFeatures = await extractImageFeatures(file);
      await analyzePreparedImage(requestId);
      scheduleDraftSave();
    } catch (error) {
      if (requestId !== imageAnalysisRequestId) return;
      currentImageFeatures = null;
      aiImageDescription.value = "Image analysis is temporarily unavailable. You can still submit the complaint with the photo.";
      aiAccuracyStatus.textContent = `Image analysis could not complete: ${error.message}`;
      retryImageAnalysisBtn.hidden = false;
      updateImageAnalysisProgress({
        value: 100,
        label: "Image analysis failed",
        detail: `The photo remains selected. Re-submit it to try again.${error.requestId ? ` Reference: ${error.requestId}.` : ""}`,
        state: "error"
      });
      scheduleDraftSave();
    }
  });
}

showAiAccuracyBtn.addEventListener("click", async () => {
  if (!currentImageAiPayload) {
    aiAccuracyStatus.textContent = "Upload an image first to run image-only detection.";
    return;
  }

  const requestId = ++imageAnalysisRequestId;
  try {
    await analyzePreparedImage(requestId);
  } catch (error) {
    if (requestId !== imageAnalysisRequestId) return;
    aiAccuracyStatus.textContent = `Image analysis could not complete: ${error.message}`;
    retryImageAnalysisBtn.hidden = false;
    updateImageAnalysisProgress({
      value: 100,
      label: "Image analysis failed",
      detail: `The photo remains selected. Re-submit it to try again.${error.requestId ? ` Reference: ${error.requestId}.` : ""}`,
      state: "error"
    });
  }
});

retryImageAnalysisBtn.addEventListener("click", async () => {
  if (!currentImageAiPayload) {
    retryImageAnalysisBtn.hidden = true;
    aiAccuracyStatus.textContent = "Select the image again before re-submitting it for analysis.";
    return;
  }

  const requestId = ++imageAnalysisRequestId;
  currentImageAnalysisToken = "";
  resetCivicContext();
  aiAccuracyStatus.textContent = "Re-submitting the image for visual analysis...";
  updateImageAnalysisProgress({
    value: 10,
    label: "Re-submitting image",
    detail: "Sending the retained evidence through the visual analysis pipeline again.",
    state: "working"
  });
  try {
    await analyzePreparedImage(requestId);
  } catch (error) {
    if (requestId !== imageAnalysisRequestId) return;
    aiAccuracyStatus.textContent = `Image analysis could not complete: ${error.message}`;
    retryImageAnalysisBtn.hidden = false;
    updateImageAnalysisProgress({
      value: 100,
      label: "Image analysis failed",
      detail: `The photo remains selected. Re-submit it to try again.${error.requestId ? ` Reference: ${error.requestId}.` : ""}`,
      state: "error"
    });
  }
});

showLoginBtn.addEventListener("click", () => openAuthOverlay("login"));
showRegisterBtn.addEventListener("click", () => openAuthOverlay("register"));
forgotPasswordBtn?.addEventListener("click", () => openAuthOverlay("reset-password"));
sendOtpBtn?.addEventListener("click", requestActiveOtp);
authIdentityInput?.addEventListener("input", () => {
  if (authMode === "register" && registrationOtpIssued && !registrationOtpMatchesCurrentForm()) {
    invalidateOtpState("register", "Email changed. Request a new registration OTP.");
  }
  if (authMode === "reset-password" && passwordResetOtpIssued && !passwordResetOtpMatchesCurrentForm()) {
    invalidateOtpState("reset", "Email changed. Request a new password reset OTP.");
  }
});
authPasswordInput?.addEventListener("input", () => {
  if (authMode === "register" && registrationOtpIssued && !registrationOtpMatchesCurrentForm()) {
    invalidateOtpState("register", "Password changed. Request a new registration OTP.");
  }
});
authRoleSelect?.addEventListener("change", () => {
  if (authMode === "register" && registrationOtpIssued && !registrationOtpMatchesCurrentForm()) {
    invalidateOtpState("register", "Role changed. Request a new registration OTP.");
  }
});
issueTokenBtn.addEventListener("click", () => openAuthOverlay("login"));
logoutBtn?.addEventListener("click", () => logoutCurrentUser());
openFaqLink?.addEventListener("click", (event) => {
  event.preventDefault();
  openFaqOverlay();
});
closeFaqBtn?.addEventListener("click", closeFaqOverlay);
closeComplaintDetailBtn?.addEventListener("click", closeComplaintDetailOverlay);
informClosedOnesBtn?.addEventListener("click", () => {
  closeContactsForm.hidden = false;
  closeContactsMessage.textContent = "Add at least one email ID, up to 5.";
  closeContactsForm.querySelector("input")?.focus();
});
cancelCloseContactsBtn?.addEventListener("click", () => {
  closeContactsForm.hidden = true;
  closeContactsForm.reset();
  closeContactsMessage.textContent = "";
});
closeContactsForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    if (!lastSubmittedReport) {
      throw new Error("Submit a complaint before informing close contacts.");
    }

    const emails = Array.from(closeContactsForm.querySelectorAll('input[name="contactEmail"]'))
      .map((input) => input.value.trim())
      .filter(Boolean);

    if (!emails.length) {
      throw new Error("Enter at least one email ID.");
    }

    sendCloseContactsBtn.disabled = true;
    closeContactsMessage.textContent = "Sending warning email...";
    emailProgress.dataset.state = "working";
    setEmailProgress(36, "Preparing contact notifications...");
    const response = await apiRequest("/api/inform-close-contacts", {
      method: "POST",
      body: JSON.stringify({
        emails,
        report: lastSubmittedReport
      })
    });

    closeContactsMessage.textContent = response.message || "Close contacts were informed successfully.";
    finishReportProgress(true, "Contact notifications sent successfully.");
    setDashboardMessage(closeContactsMessage.textContent, "success");
    closeContactsForm.reset();
  } catch (error) {
    closeContactsMessage.textContent = error.message;
    finishReportProgress(false, "Contact notifications could not be sent.");
    setDashboardMessage(error.message, "error");
  } finally {
    sendCloseContactsBtn.disabled = false;
  }
});
localAlertsForm?.addEventListener("submit", saveLocalAlertPreferences);
generatePdfBtn.addEventListener("click", async () => {
  try {
    emailProgress.dataset.state = "working";
    setEmailProgress(18, "Generating complaint PDF...");
    const result = await generatePdfReport(lastSubmittedReport, { download: true });
    finishReportProgress(true, `PDF generated as ${result.filename}.`);
    setDashboardMessage(`Complaint report PDF downloaded as ${result.filename}.`, "success");
  } catch (error) {
    finishReportProgress(false, "Complaint PDF could not be generated.");
    setDashboardMessage(error.message, "error");
  }
});
emailBbmpBtn.addEventListener("click", async () => {
  try {
    if (!lastSubmittedReport) {
      throw new Error("Submit a complaint first before preparing the authority email.");
    }

    emailBbmpBtn.disabled = true;
    beginEmailProgress();
    const { blob, filename } = await generatePdfReport(lastSubmittedReport, { download: false });
    setEmailProgress(42, "Generating formal PDF attachment...");
    const pdfBase64 = await blobToBase64(blob);
    setEmailProgress(68, "Encoding report for authority delivery...");

    const response = await apiRequest("/api/email-authority", {
      method: "POST",
      body: JSON.stringify({
        subject: (lastSubmittedReport.textComplaint || lastSubmittedReport.issueType || "Complaint report").trim(),
        report: lastSubmittedReport,
        pdfBase64,
        filename
      })
    });

    finishEmailProgress(true);
    setDashboardMessage(response.message || "Complaint email sent to the configured authority successfully.", "success");
  } catch (error) {
    finishEmailProgress(false);
    setDashboardMessage(error.message, "error");
  } finally {
    emailBbmpBtn.disabled = !lastSubmittedReport;
  }
});
reportLocationInput.addEventListener("input", (event) => {
  currentReportMapLocation = null;
  updateLiveLocationMap(event.target.value);
  const currentLocationKey = `${event.target.value.trim()}||`;
  if (lastWeatherPreviewLocation && lastWeatherPreviewLocation !== currentLocationKey) {
    resetWeatherPreview("Location changed. Press Check Weather to retrieve the new conditions.");
  }
  if (currentCivicContextToken) {
    resetCivicContext({
      imageReady: Boolean(currentImageAnalysisToken),
      message: "Location changed. Check civic context again for the new location."
    });
  }
});
previewLocationBtn.addEventListener("click", showTypedLocationOnMap);
checkWeatherBtn?.addEventListener("click", requestWeatherPreview);
checkCivicContextBtn?.addEventListener("click", requestCivicContextPreview);
useLiveLocationBtn?.addEventListener("click", useLiveLocation);
closeLocationPreviewBtn?.addEventListener("click", closeLocationPreview);
locationPreviewOverlay?.addEventListener("click", (event) => {
  if (event.target === locationPreviewOverlay) closeLocationPreview();
});

authForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const submittedMode = authMode;

  try {
    authSubmitBtn.disabled = true;
    showLoginBtn.disabled = true;
    showRegisterBtn.disabled = true;
    const formData = new FormData(authForm);
    const payload = Object.fromEntries(formData.entries());

    if (submittedMode === "register") {
      if (!registrationOtpIssued) {
        throw new Error("Send the OTP to your email before completing registration.");
      }
      if (!registrationOtpMatchesCurrentForm()) {
        invalidateOtpState("register");
        throw new Error("Your registration details changed. Request a new OTP before completing registration.");
      }
    }

    if (submittedMode === "reset-password") {
      if (!passwordResetOtpIssued) {
        throw new Error("Send the OTP to your email before resetting the password.");
      }
      if (!passwordResetOtpMatchesCurrentForm()) {
        invalidateOtpState("reset");
        throw new Error("Your email changed. Request a new OTP before resetting the password.");
      }
    }

    const endpoint =
      submittedMode === "login"
        ? "/api/auth/login"
        : submittedMode === "reset-password"
          ? "/api/auth/password-reset"
          : "/api/auth/register";
    const data = await apiRequest(endpoint, {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (submittedMode === "reset-password") {
      const successMessage = data.message || "Password reset successful. You can now log in with your new password.";
      const previousRole = authRoleSelect?.value;
      setDashboardMessage(successMessage, "success");
      passwordResetOtpIssued = false;
      passwordResetOtpContext = null;
      clearOtpTimer();
      setOtpTimerMessage("");
      sendOtpBtn.textContent = "Send OTP";
      authForm.reset();
      if (previousRole && authRoleSelect) {
        authRoleSelect.value = previousRole;
      }
      openAuthOverlay("login");
      authMessage.textContent = successMessage;
      authMessage.dataset.state = "success";
      return;
    }

    authState = data;
    saveAuthState();
    applyPermissionState();
    resetLoginAttemptState();
    const successMessage = getAuthSuccessMessage(submittedMode, data);
    authMessage.textContent = successMessage;
    setDashboardMessage(successMessage, "success");
    registrationOtpIssued = false;
    passwordResetOtpIssued = false;
    registrationOtpContext = null;
    passwordResetOtpContext = null;
    clearOtpTimer();
    setOtpTimerMessage("");
    sendOtpBtn.textContent = "Send OTP";
    const authenticatedRole = data.role;
    authForm.reset();
    if (authenticatedRole && authRoleSelect) {
      authRoleSelect.value = authenticatedRole;
    }
    if (submittedMode === "login") {
      await window.UrbanPulseAuthCharacters?.celebrate?.(2000);
    }
    closeAuthOverlay();
    goToMainDashboard();
    await loadDashboard();
  } catch (error) {
    if (submittedMode === "login" && error.status === 401) {
      recordClientLoginFailure();
      window.UrbanPulseAuthCharacters?.angry?.();
    }
    authMessage.textContent = error.message;
    authMessage.dataset.state = "error";
    setDashboardMessage(error.message, "error");
  } finally {
    showLoginBtn.disabled = false;
    showRegisterBtn.disabled = false;
    if (!loginLockTimer) {
      authSubmitBtn.disabled = false;
    }
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
    payload.weatherContextToken = currentWeatherContextToken;
    payload.civicContextToken = currentCivicContextToken;
    if (currentReportMapLocation) {
      payload.mapLocation = currentReportMapLocation;
    }
    payload.imageFeatures = currentImageFeatures || (await extractImageFeatures(imageFile));
    const imageAiPayload = currentImageAiPayload || (imageFile ? await prepareImageForAi(imageFile) : null);
    if (imageAiPayload) {
      payload.imageBase64 = imageAiPayload.base64;
      payload.imageMimeType = imageAiPayload.mimeType;
    }
    // Browser pixel statistics are transport metadata, never trusted semantic evidence.
    payload.imageHint = "";
    showTypedLocationOnMap();
    beginSubmissionProgress(Boolean(imageAiPayload));

    const result = await apiRequest("/api/analyze-complaint", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    lastSubmittedReport = buildSubmittedReport(payload, result);
    setPdfButtonState(true);
    resetComposer();
    renderAnalysis(result);
    showInlineReportResult(lastSubmittedReport);
    finishReportProgress(true, "Complaint submitted. Report actions are ready.");
    await loadDashboard();
  } catch (error) {
    aiAccuracyStatus.textContent = `Analysis could not complete: ${error.message}`;
    finishReportProgress(false, `Complaint could not be submitted: ${error.message}`);
    setDashboardMessage(error.message, "error");
  } finally {
    updateComplaintSubmitAvailability();
  }
});

document.getElementById("recentComplaints")?.addEventListener("click", (event) => {
  const complaintItem = event.target.closest(".mini-item[data-complaint-id]");
  const complaintId = complaintItem?.dataset.complaintId;
  if (complaintId) openComplaintDetail(complaintId);
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

window.smartCommunityApp = {
  apiRequest,
  getAuthState: () => authState,
  getCurrentVoiceTranscript: () => String(voiceTranscriptInput?.value || "").trim(),
  setDashboardMessage
};

loadSavedAuthState();
setupImageUpload();
setupComplaintInputMode();
setupMobileMenu();
setupRevealAnimations();
setupAboutVideoExperience();
setupAppNavigation();
setupGooeyInteractions();
applyPermissionState();
setPdfButtonState(false);
setupDraftAutosave();
setupDashboardFilters();
resetComposer({ clearDraft: false });
restoreReportDraft();
if (!authState?.token) {
  openAuthOverlay("login");
}
loadDashboard().catch((error) => {
  setDashboardMessage(error.message, "error");
});
