const state = {
  token: localStorage.getItem("lease_admin_token") || "",
  captchaKey: "",
  currentPage: "summary",
  demoData: false,
  demoReason: ""
};

const DEMO_TOKEN = "FRONTEND_DEMO_ADMIN";
const releaseLabels = { 1: ["Released", "ok"], 0: ["Draft", "warn"] };
const userLabels = { 1: ["Enabled", "ok"], 0: ["Disabled", "danger"] };

const mockAdmin = {
  apartments: [
    {
      id: 9,
      name: "Wendu Residency",
      isRelease: 1,
      totalRoomCount: 4,
      freeRoomCount: 1,
      provinceName: "Beijing",
      cityName: "Beijing",
      districtName: "Changping",
      addressDetail: "55 Wangfu Street",
      phone: "1234567788"
    },
    {
      id: 10,
      name: "Huilongguan Hub",
      isRelease: 1,
      totalRoomCount: 2,
      freeRoomCount: 1,
      provinceName: "Beijing",
      cityName: "Beijing",
      districtName: "Changping",
      addressDetail: "Metro Exit B",
      phone: "12345678"
    }
  ],
  apartmentDetails: {
    9: {
      id: 9,
      name: "Wendu Residency",
      isRelease: 1,
      provinceName: "Beijing",
      cityName: "Beijing",
      districtName: "Changping",
      addressDetail: "55 Wangfu Street",
      phone: "1234567788",
      graphVoList: [{ url: "https://picsum.photos/seed/admin-apartment-1/800/400" }],
      labelInfoList: [{ name: "Near campus" }, { name: "Smart access" }],
      facilityInfoList: [{ name: "Gym" }, { name: "Laundry" }, { name: "Study lounge" }],
      feeValueVoList: [{ feeKey: "Service", feeValue: "200" }, { feeKey: "WiFi", feeValue: "50" }]
    },
    10: {
      id: 10,
      name: "Huilongguan Hub",
      isRelease: 1,
      provinceName: "Beijing",
      cityName: "Beijing",
      districtName: "Changping",
      addressDetail: "Metro Exit B",
      phone: "12345678",
      graphVoList: [{ url: "https://picsum.photos/seed/admin-apartment-2/800/400" }],
      labelInfoList: [{ name: "Metro 3 min" }, { name: "City view" }],
      facilityInfoList: [{ name: "Parking" }, { name: "Security" }],
      feeValueVoList: [{ feeKey: "Property", feeValue: "180" }]
    }
  },
  rooms: [
    {
      id: 101,
      roomNumber: "A-101",
      rent: 3200,
      isRelease: 1,
      isCheckIn: true,
      apartmentInfo: { id: 9, name: "Wendu Residency" }
    },
    {
      id: 102,
      roomNumber: "A-203",
      rent: 3600,
      isRelease: 1,
      isCheckIn: false,
      apartmentInfo: { id: 9, name: "Wendu Residency" }
    },
    {
      id: 201,
      roomNumber: "B-1102",
      rent: 4100,
      isRelease: 0,
      isCheckIn: false,
      apartmentInfo: { id: 10, name: "Huilongguan Hub" }
    }
  ],
  roomDetails: {
    101: {
      id: 101,
      roomNumber: "A-101",
      rent: 3200,
      isRelease: 1,
      apartmentInfo: { id: 9, name: "Wendu Residency" },
      attrValueVoList: [{ attrKey: "Layout", attrValueName: "1B1B" }, { attrKey: "Area", attrValueName: "35 sqm" }],
      facilityInfoList: [{ name: "AC" }, { name: "Desk" }],
      labelInfoList: [{ name: "South facing" }, { name: "Quiet" }],
      leaseTermList: [{ monthCount: 12 }, { monthCount: 6 }]
    },
    102: {
      id: 102,
      roomNumber: "A-203",
      rent: 3600,
      isRelease: 1,
      apartmentInfo: { id: 9, name: "Wendu Residency" },
      attrValueVoList: [{ attrKey: "Layout", attrValueName: "Studio" }, { attrKey: "Area", attrValueName: "28 sqm" }],
      facilityInfoList: [{ name: "Wardrobe" }, { name: "Washer" }],
      labelInfoList: [{ name: "Move-in ready" }],
      leaseTermList: [{ monthCount: 12 }]
    },
    201: {
      id: 201,
      roomNumber: "B-1102",
      rent: 4100,
      isRelease: 0,
      apartmentInfo: { id: 10, name: "Huilongguan Hub" },
      attrValueVoList: [{ attrKey: "Layout", attrValueName: "1B1B" }],
      facilityInfoList: [{ name: "Balcony" }, { name: "Fridge" }],
      labelInfoList: [{ name: "High floor" }, { name: "City view" }],
      leaseTermList: [{ monthCount: 12 }, { monthCount: 18 }]
    }
  },
  users: [
    { id: 1, phone: "13888888888", nickname: "Alice", status: 1 },
    { id: 2, phone: "13666666666", nickname: "Bob", status: 1 },
    { id: 3, phone: "13511112222", nickname: "Charlie", status: 0 }
  ]
};

const $ = (selector) => document.querySelector(selector);

async function request(url, options = {}, withAuth = true) {
  const headers = { ...(options.headers || {}) };
  if (withAuth && state.token && state.token !== DEMO_TOKEN) headers["access-token"] = state.token;
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.code !== 200) throw new Error(result.message || "Request failed");
  return result.data;
}

function fmtNumber(value) {
  if (value === null || value === undefined || value === "") return "-";
  return new Intl.NumberFormat("zh-CN").format(value);
}

function fmtMoney(value) {
  if (value === null || value === undefined || value === "") return "-";
  return `¥ ${fmtNumber(value)}`;
}

function statusTag(pair) {
  const [text, tone] = pair;
  return `<span class="status-pill ${tone}">${text}</span>`;
}

function enableDemoData(reason) {
  if (!state.demoData) {
    state.demoData = true;
    state.demoReason = reason || "Backend data is unavailable";
  }
}

function buildMockSummary() {
  const releasedApartmentCount = mockAdmin.apartments.filter((item) => item.isRelease === 1).length;
  const releasedRoomCount = mockAdmin.rooms.filter((item) => item.isRelease === 1).length;
  const enabledUserCount = mockAdmin.users.filter((item) => item.status === 1).length;
  const activeAgreementCount = mockAdmin.rooms.filter((item) => item.isCheckIn).length;
  return {
    apartmentCount: mockAdmin.apartments.length,
    releasedApartmentCount,
    roomCount: mockAdmin.rooms.length,
    releasedRoomCount,
    userCount: mockAdmin.users.length,
    enabledUserCount,
    agreementCount: 5,
    activeAgreementCount,
    appointmentCount: 6,
    waitingAppointmentCount: 2,
    estimatedMonthlyRent: mockAdmin.rooms.filter((item) => item.isCheckIn).reduce((sum, item) => sum + Number(item.rent || 0), 0),
    occupancyRate: mockAdmin.rooms.length ? Math.round((activeAgreementCount * 100) / mockAdmin.rooms.length) : 0
  };
}

function bindPageSwitch() {
  document.querySelectorAll(".nav-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-btn").forEach((node) => node.classList.remove("is-active"));
      document.querySelectorAll(".page").forEach((node) => node.classList.remove("is-active"));
      btn.classList.add("is-active");
      $(`#${btn.dataset.page}Page`).classList.add("is-active");
      state.currentPage = btn.dataset.page;
    });
  });
}

async function loadCaptcha() {
  try {
    const data = await request("/admin/login/captcha", {}, false);
    state.captchaKey = data.key || "";
    if (data.image) {
      $("#captchaImage").innerHTML = `<img alt="captcha" src="${data.image}" />`;
    } else {
      $("#captchaImage").textContent = "Demo mode is enabled. Captcha is optional.";
    }
  } catch (error) {
    state.captchaKey = "";
    $("#captchaImage").textContent = "Captcha service is unavailable. Demo login is still allowed.";
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  payload.captchaKey = state.captchaKey;
  $("#loginMessage").textContent = "Signing in...";
  try {
    const token = await request("/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, false);
    state.token = token;
    state.demoData = false;
    localStorage.setItem("lease_admin_token", token);
    $("#loginOverlay").classList.add("is-hidden");
    $("#loginMessage").textContent = "";
    await bootstrap();
  } catch (error) {
    if (payload.username === "admin" && payload.password === "123456") {
      state.token = DEMO_TOKEN;
      state.demoData = true;
      state.demoReason = error.message || "Database is unavailable";
      localStorage.setItem("lease_admin_token", DEMO_TOKEN);
      $("#loginOverlay").classList.add("is-hidden");
      $("#loginMessage").textContent = "";
      await bootstrap();
      return;
    }
    $("#loginMessage").textContent = error.message || "Login failed";
    await loadCaptcha();
  }
}

async function loadProfile() {
  if (state.token === DEMO_TOKEN) {
    $("#profileName").textContent = "Demo Admin";
    $("#profileMeta").textContent = `Offline demo: ${state.demoReason || "using local data"}`;
    return;
  }

  try {
    const data = await request("/admin/info");
    $("#profileName").textContent = data.name || "Admin";
    $("#profileMeta").textContent = data.avatarUrl ? "Authenticated" : "Online mode";
  } catch (error) {
    enableDemoData(error.message);
    $("#profileName").textContent = "Demo Admin";
    $("#profileMeta").textContent = `Offline demo: ${state.demoReason}`;
  }
}

async function loadSummary() {
  let data = buildMockSummary();
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      data = await request("/admin/dashboard/summary");
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  const intro = state.demoData || state.token === DEMO_TOKEN
    ? `Offline demo mode is active. Showing local sample data because ${state.demoReason || "the backend data request failed"}.`
    : `Current data: ${fmtNumber(data.roomCount)} rooms, ${fmtNumber(data.userCount)} users, ${fmtNumber(data.activeAgreementCount)} active agreements.`;
  $("#summaryIntro").textContent = intro;

  const items = [
    ["Apartments", fmtNumber(data.apartmentCount)],
    ["Released apartments", fmtNumber(data.releasedApartmentCount)],
    ["Rooms", fmtNumber(data.roomCount)],
    ["Released rooms", fmtNumber(data.releasedRoomCount)],
    ["Users", fmtNumber(data.userCount)],
    ["Enabled users", fmtNumber(data.enabledUserCount)],
    ["Active agreements", fmtNumber(data.activeAgreementCount)],
    ["Waiting appointments", fmtNumber(data.waitingAppointmentCount)],
    ["Estimated monthly rent", fmtMoney(data.estimatedMonthlyRent)],
    ["Occupancy", `${fmtNumber(data.occupancyRate)}%`]
  ];
  $("#summaryCards").innerHTML = items.map(([label, value]) => `
    <article class="metric-card">
      <p>${label}</p>
      <strong>${value}</strong>
    </article>
  `).join("");
}

function renderApartmentDetail(item) {
  const graphs = (item.graphVoList || []).slice(0, 3).map((graph) => graph.url).join(" , ") || "No images";
  const labels = (item.labelInfoList || []).map((node) => node.name).join(" / ") || "No labels";
  const facilities = (item.facilityInfoList || []).map((node) => node.name).join(" / ") || "No facilities";
  const fees = (item.feeValueVoList || []).map((node) => `${node.feeKey || "Fee"}: ${node.feeValue ?? "-"}`).join(" / ") || "No fee data";
  $("#apartmentDetail").innerHTML = `
    <div>
      <p class="eyebrow">Apartment Detail</p>
      <h3>${item.name || "Unnamed apartment"}</h3>
      <div class="meta-line">
        <div>${statusTag(releaseLabels[item.isRelease] || ["Unknown", "warn"])}</div>
        <div>Phone: ${item.phone || "-"}</div>
        <div>Address: ${[item.provinceName, item.cityName, item.districtName, item.addressDetail].filter(Boolean).join(", ") || "-"}</div>
      </div>
      <div class="detail-grid">
        <div><strong>Labels</strong><p>${labels}</p></div>
        <div><strong>Facilities</strong><p>${facilities}</p></div>
        <div><strong>Fees</strong><p>${fees}</p></div>
        <div><strong>Images</strong><p>${graphs}</p></div>
      </div>
      <div class="toolbar">
        <button class="primary-btn" onclick="toggleApartment(${item.id}, ${item.isRelease === 1 ? "'NOT_RELEASED'" : "'RELEASED'"})">${item.isRelease === 1 ? "Unpublish" : "Publish"}</button>
      </div>
    </div>`;
}

async function loadApartments() {
  let items = mockAdmin.apartments;
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      const data = await request("/admin/apartment/pageItem?current=1&size=6");
      items = data.records || [];
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  $("#apartmentList").innerHTML = items.length ? items.map((item) => `
    <article class="list-card">
      <h3>${item.name || "Unnamed apartment"}</h3>
      <div class="meta-line">
        <div>${statusTag(releaseLabels[item.isRelease] || ["Unknown", "warn"])}</div>
        <div>Rooms: ${fmtNumber(item.totalRoomCount)}</div>
        <div>Free: ${fmtNumber(item.freeRoomCount)}</div>
      </div>
      <p>${[item.provinceName, item.cityName, item.districtName].filter(Boolean).join(" / ") || "Location unavailable"}</p>
      <div class="toolbar">
        <button class="ghost-btn" onclick="showApartment(${item.id})">View detail</button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No apartment data</div>`;

  if (items[0]) await showApartment(items[0].id);
}

async function showApartment(id) {
  let detail = mockAdmin.apartmentDetails[id];
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      detail = await request(`/admin/apartment/getDetailById?id=${id}`);
    } catch (error) {
      enableDemoData(error.message);
    }
  }
  renderApartmentDetail(detail || mockAdmin.apartmentDetails[Object.keys(mockAdmin.apartmentDetails)[0]]);
}

async function toggleApartment(id, status) {
  if (state.demoData || state.token === DEMO_TOKEN) {
    const target = mockAdmin.apartments.find((item) => item.id === id);
    const detail = mockAdmin.apartmentDetails[id];
    const nextValue = status === "RELEASED" ? 1 : 0;
    if (target) target.isRelease = nextValue;
    if (detail) detail.isRelease = nextValue;
    await loadSummary();
    await loadApartments();
    return;
  }

  await request(`/admin/apartment/updateReleaseStatusById?id=${id}&status=${status}`, { method: "POST" });
  await loadSummary();
  await loadApartments();
}

function renderRoomDetail(item) {
  const apartmentName = item.apartmentInfo?.name || "Unknown apartment";
  const attrs = (item.attrValueVoList || []).map((node) => `${node.attrKey || "Attr"}: ${node.attrValueName || "-"}`).join(" / ") || "No attributes";
  const facilities = (item.facilityInfoList || []).map((node) => node.name).join(" / ") || "No facilities";
  const labels = (item.labelInfoList || []).map((node) => node.name).join(" / ") || "No labels";
  const terms = (item.leaseTermList || []).map((node) => node.monthCount ? `${node.monthCount} months` : (node.name || "Lease term")).join(" / ") || "No lease terms";
  $("#roomDetail").innerHTML = `
    <div>
      <p class="eyebrow">Room Detail</p>
      <h3>Room ${item.roomNumber || "-"}</h3>
      <div class="meta-line">
        <div>${statusTag(releaseLabels[item.isRelease] || ["Unknown", "warn"])}</div>
        <div>Rent: ${fmtMoney(item.rent)}</div>
        <div>Apartment: ${apartmentName}</div>
      </div>
      <div class="detail-grid">
        <div><strong>Attributes</strong><p>${attrs}</p></div>
        <div><strong>Facilities</strong><p>${facilities}</p></div>
        <div><strong>Labels</strong><p>${labels}</p></div>
        <div><strong>Lease terms</strong><p>${terms}</p></div>
      </div>
      <div class="toolbar">
        <button class="primary-btn" onclick="toggleRoom(${item.id}, ${item.isRelease === 1 ? "'NOT_RELEASED'" : "'RELEASED'"})">${item.isRelease === 1 ? "Unpublish" : "Publish"}</button>
      </div>
    </div>`;
}

async function loadRooms() {
  let items = mockAdmin.rooms;
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      const data = await request("/admin/room/pageItem?current=1&size=6");
      items = data.records || [];
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  $("#roomList").innerHTML = items.length ? items.map((item) => `
    <article class="list-card">
      <h3>Room ${item.roomNumber || "-"}</h3>
      <div class="meta-line">
        <div>${statusTag(releaseLabels[item.isRelease] || ["Unknown", "warn"])}</div>
        <div>Rent: ${fmtMoney(item.rent)}</div>
        <div>${item.isCheckIn ? "Occupied" : "Vacant"}</div>
      </div>
      <p>${item.apartmentInfo?.name || "Apartment unavailable"}</p>
      <div class="toolbar">
        <button class="ghost-btn" onclick="showRoom(${item.id})">View detail</button>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No room data</div>`;

  if (items[0]) await showRoom(items[0].id);
}

async function showRoom(id) {
  let detail = mockAdmin.roomDetails[id];
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      detail = await request(`/admin/room/getDetailById?id=${id}`);
    } catch (error) {
      enableDemoData(error.message);
    }
  }
  renderRoomDetail(detail || mockAdmin.roomDetails[Object.keys(mockAdmin.roomDetails)[0]]);
}

async function toggleRoom(id, status) {
  if (state.demoData || state.token === DEMO_TOKEN) {
    const target = mockAdmin.rooms.find((item) => item.id === id);
    const detail = mockAdmin.roomDetails[id];
    const nextValue = status === "RELEASED" ? 1 : 0;
    if (target) target.isRelease = nextValue;
    if (detail) detail.isRelease = nextValue;
    await loadSummary();
    await loadRooms();
    return;
  }

  await request(`/admin/room/updateReleaseStatusById?id=${id}&status=${status}`, { method: "POST" });
  await loadSummary();
  await loadRooms();
}

async function loadUsers() {
  let items = mockAdmin.users;
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      const data = await request("/admin/user/page?current=1&size=6");
      items = data.records || [];
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  $("#userTable").innerHTML = items.length ? `
    <div class="table-head">
      <div>Phone</div>
      <div>Nickname</div>
      <div>Status</div>
      <div>Action</div>
    </div>
    ${items.map((item) => `
      <div class="table-row">
        <div>${item.phone || "-"}</div>
        <div>${item.nickname || "No nickname"}</div>
        <div>${statusTag(userLabels[item.status] || ["Unknown", "warn"])}</div>
        <div><button class="ghost-btn" onclick="toggleUser(${item.id}, ${item.status === 1 ? "'DISABLE'" : "'ENABLE'"})">${item.status === 1 ? "Disable" : "Enable"}</button></div>
      </div>
    `).join("")}
  ` : `<div class="empty-state">No user data</div>`;
}

async function toggleUser(id, status) {
  if (state.demoData || state.token === DEMO_TOKEN) {
    const target = mockAdmin.users.find((item) => item.id === id);
    if (target) target.status = status === "ENABLE" ? 1 : 0;
    await loadSummary();
    await loadUsers();
    return;
  }

  await request(`/admin/user/updateStatusById?id=${id}&status=${status}`, { method: "POST" });
  await loadSummary();
  await loadUsers();
}

async function bootstrap() {
  try {
    await loadProfile();
    await loadSummary();
    await loadApartments();
    await loadRooms();
    await loadUsers();
  } catch (error) {
    localStorage.removeItem("lease_admin_token");
    state.token = "";
    $("#loginOverlay").classList.remove("is-hidden");
    $("#loginMessage").textContent = error.message || "Unable to load admin dashboard";
    await loadCaptcha();
  }
}

function bindActions() {
  $("#loginForm").addEventListener("submit", handleLogin);
  $("#captchaBtn").addEventListener("click", loadCaptcha);
  $("#refreshBtn").addEventListener("click", bootstrap);
  $("#logoutBtn").addEventListener("click", async () => {
    state.token = "";
    state.demoData = false;
    state.demoReason = "";
    localStorage.removeItem("lease_admin_token");
    $("#loginOverlay").classList.remove("is-hidden");
    $("#profileName").textContent = "Not signed in";
    $("#profileMeta").textContent = "Waiting for authentication";
    await loadCaptcha();
  });
}

bindPageSwitch();
bindActions();
window.showApartment = showApartment;
window.showRoom = showRoom;
window.toggleApartment = toggleApartment;
window.toggleRoom = toggleRoom;
window.toggleUser = toggleUser;

(async function init() {
  await loadCaptcha();
  if (state.token) {
    if (state.token === DEMO_TOKEN) state.demoData = true;
    $("#loginOverlay").classList.add("is-hidden");
    await bootstrap();
  }
})();
