const state = {
  token: localStorage.getItem("lease_app_token") || "",
  currentRoom: null,
  phone: "",
  demoData: false,
  demoReason: ""
};

const DEMO_TOKEN = "FRONTEND_DEMO_APP";
const appointmentLabels = { 1: ["Waiting", "warn"], 2: ["Canceled", "danger"], 3: ["Viewed", "ok"] };
const agreementLabels = { 1: ["Pending", "warn"], 2: ["Signed", "ok"], 3: ["Canceled", "danger"], 4: ["Expired", "warn"], 5: ["Leaving", "warn"], 6: ["Closed", "danger"], 7: ["Renewing", "warn"] };

const mockApp = {
  rooms: [
    {
      id: 1001,
      roomNumber: "A-101",
      rent: 3200,
      apartmentInfo: {
        id: 9,
        name: "Wendu Residency",
        provinceName: "Beijing",
        cityName: "Beijing",
        districtName: "Changping"
      },
      labelInfoList: [{ name: "Near campus" }, { name: "Move-in ready" }],
      graphVoList: []
    },
    {
      id: 1002,
      roomNumber: "A-203",
      rent: 3600,
      apartmentInfo: {
        id: 9,
        name: "Wendu Residency",
        provinceName: "Beijing",
        cityName: "Beijing",
        districtName: "Changping"
      },
      labelInfoList: [{ name: "Quiet floor" }, { name: "Good sunlight" }],
      graphVoList: []
    },
    {
      id: 2001,
      roomNumber: "B-1102",
      rent: 4100,
      apartmentInfo: {
        id: 10,
        name: "Huilongguan Hub",
        provinceName: "Beijing",
        cityName: "Beijing",
        districtName: "Changping"
      },
      labelInfoList: [{ name: "Metro nearby" }, { name: "City view" }],
      graphVoList: []
    }
  ],
  roomDetails: {
    1001: {
      id: 1001,
      roomNumber: "A-101",
      rent: 3200,
      apartmentId: 9,
      apartmentItemVo: {
        id: 9,
        name: "Wendu Residency",
        provinceName: "Beijing",
        cityName: "Beijing",
        districtName: "Changping",
        addressDetail: "55 Wangfu Street",
        phone: "1234567788"
      },
      attrValueVoList: [{ attrKey: "Layout", attrValueName: "1B1B" }, { attrKey: "Area", attrValueName: "35 sqm" }],
      facilityInfoList: [{ name: "AC" }, { name: "Desk" }],
      labelInfoList: [{ name: "Near campus" }, { name: "Move-in ready" }],
      leaseTermList: [{ monthCount: 12 }, { monthCount: 6 }],
      graphVoList: []
    },
    1002: {
      id: 1002,
      roomNumber: "A-203",
      rent: 3600,
      apartmentId: 9,
      apartmentItemVo: {
        id: 9,
        name: "Wendu Residency",
        provinceName: "Beijing",
        cityName: "Beijing",
        districtName: "Changping",
        addressDetail: "55 Wangfu Street",
        phone: "1234567788"
      },
      attrValueVoList: [{ attrKey: "Layout", attrValueName: "Studio" }, { attrKey: "Area", attrValueName: "28 sqm" }],
      facilityInfoList: [{ name: "Washer" }, { name: "Wardrobe" }],
      labelInfoList: [{ name: "Quiet floor" }, { name: "Good sunlight" }],
      leaseTermList: [{ monthCount: 12 }],
      graphVoList: []
    },
    2001: {
      id: 2001,
      roomNumber: "B-1102",
      rent: 4100,
      apartmentId: 10,
      apartmentItemVo: {
        id: 10,
        name: "Huilongguan Hub",
        provinceName: "Beijing",
        cityName: "Beijing",
        districtName: "Changping",
        addressDetail: "Metro Exit B",
        phone: "12345678"
      },
      attrValueVoList: [{ attrKey: "Layout", attrValueName: "1B1B" }, { attrKey: "Area", attrValueName: "40 sqm" }],
      facilityInfoList: [{ name: "Balcony" }, { name: "Fridge" }],
      labelInfoList: [{ name: "Metro nearby" }, { name: "City view" }],
      leaseTermList: [{ monthCount: 12 }, { monthCount: 18 }],
      graphVoList: []
    }
  },
  appointments: [
    { id: 1, apartmentName: "Wendu Residency", appointmentTime: "2026-04-18T14:00:00", appointmentStatus: 1 },
    { id: 2, apartmentName: "Huilongguan Hub", appointmentTime: "2026-04-20T10:30:00", appointmentStatus: 3 }
  ],
  agreements: [
    {
      id: 1,
      apartmentName: "Wendu Residency",
      roomNumber: "A-101",
      leaseStatus: 2,
      leaseStartDate: "2026-03-01",
      leaseEndDate: "2027-02-28",
      rent: 3200
    }
  ],
  history: [
    { id: 1, apartmentName: "Wendu Residency", roomNumber: "A-101", provinceName: "Beijing", cityName: "Beijing", districtName: "Changping", rent: 3200 },
    { id: 2, apartmentName: "Huilongguan Hub", roomNumber: "B-1102", provinceName: "Beijing", cityName: "Beijing", districtName: "Changping", rent: 4100 }
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

function fmtDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value).replace("T", " ").slice(0, 16);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")} ${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function statusTag(map, value) {
  const [text, tone] = map[value] || ["Unknown", "warn"];
  return `<span class="status-pill ${tone}">${text}</span>`;
}

function roomCover() {
  return "";
}

function fillProfile(name, desc) {
  $("#profileName").textContent = name;
  $("#profileMeta").textContent = desc;
}

function enableDemoData(reason) {
  if (!state.demoData) {
    state.demoData = true;
    state.demoReason = reason || "App backend is unavailable";
  }
}

function getMockRooms(params = {}) {
  let rooms = [...mockApp.rooms];
  if (params.minRent) rooms = rooms.filter((item) => Number(item.rent) >= Number(params.minRent));
  if (params.maxRent) rooms = rooms.filter((item) => Number(item.rent) <= Number(params.maxRent));
  if (params.orderType === "asc") rooms.sort((a, b) => Number(a.rent) - Number(b.rent));
  if (params.orderType === "desc") rooms.sort((a, b) => Number(b.rent) - Number(a.rent));
  return rooms;
}

async function handleLogin(event) {
  event.preventDefault();
  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  $("#loginMessage").textContent = "Signing in...";
  try {
    const token = await request("/app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, false);
    state.token = token;
    state.phone = payload.phone;
    state.demoData = false;
    localStorage.setItem("lease_app_token", token);
    $("#loginMessage").textContent = "Login succeeded. Loading your data...";
    await bootstrap();
  } catch (error) {
    if (payload.phone && payload.code === "123456") {
      state.token = DEMO_TOKEN;
      state.phone = payload.phone;
      state.demoData = true;
      state.demoReason = error.message || "App backend is unavailable";
      localStorage.setItem("lease_app_token", DEMO_TOKEN);
      $("#loginMessage").textContent = "Offline demo mode is active.";
      await bootstrap();
      return;
    }
    $("#loginMessage").textContent = error.message || "Login failed";
  }
}

async function loadProfile() {
  if (state.token === DEMO_TOKEN) {
    fillProfile("Demo tenant", `Offline demo: ${state.demoReason || "using local data"}`);
    return;
  }

  try {
    const data = await request("/app/info");
    fillProfile(data.nickname || "Tenant", data.avatarUrl ? "Profile loaded" : "Online mode");
  } catch (error) {
    enableDemoData(error.message);
    fillProfile("Demo tenant", `Offline demo: ${state.demoReason}`);
  }
}

async function loadRooms(params = {}) {
  let records = getMockRooms(params);
  if (!state.demoData) {
    try {
      const search = new URLSearchParams({ current: 1, size: 8 });
      Object.entries(params).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== "") search.set(key, value);
      });
      const data = await request(`/app/room/pageItem?${search.toString()}`, {}, false);
      records = data.records || [];
    } catch (error) {
      enableDemoData(error.message);
      records = getMockRooms(params);
    }
  }

  $("#roomList").innerHTML = records.length ? records.map((item) => `
    <article class="room-card">
      <div class="room-cover" ${roomCover(item)}></div>
      <div class="room-body">
        <h3>${item.apartmentInfo?.name || "Apartment"} · ${item.roomNumber || "-"}</h3>
        <p>${[item.apartmentInfo?.provinceName, item.apartmentInfo?.cityName, item.apartmentInfo?.districtName].filter(Boolean).join(" / ") || "Location unavailable"}</p>
        <p>${(item.labelInfoList || []).map((label) => label.name).join(" / ") || "Ready to move in"}</p>
        <div class="detail-meta">
          <div>Rent ${fmtMoney(item.rent)}</div>
          <div><button class="ghost-btn" onclick="showRoom(${item.id})">View detail</button></div>
        </div>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No room data available</div>`;

  if (records[0] && !state.currentRoom) {
    await showRoom(records[0].id);
  }
}

function renderRoomDetail(item) {
  state.currentRoom = item;
  const apartment = item.apartmentItemVo || {};
  const attrs = (item.attrValueVoList || []).map((node) => `${node.attrKey || "Attr"}: ${node.attrValueName || "-"}`).join(" / ") || "No attributes";
  const facilities = (item.facilityInfoList || []).map((node) => node.name).join(" / ") || "No facilities";
  const labels = (item.labelInfoList || []).map((node) => node.name).join(" / ") || "No labels";
  const terms = (item.leaseTermList || []).map((node) => node.monthCount ? `${node.monthCount} months` : (node.name || "Lease term")).join(" / ") || "No lease terms";
  $("#roomDetail").innerHTML = `
    <div class="detail-banner" ${roomCover(item)}></div>
    <div class="detail-content">
      <p class="eyebrow">Room Detail</p>
      <h2>${apartment.name || "Apartment"} · ${item.roomNumber || "-"}</h2>
      <div class="detail-meta">
        <div>Monthly rent ${fmtMoney(item.rent)}</div>
        <div>Contact ${apartment.phone || "-"}</div>
        <div>${[apartment.provinceName, apartment.cityName, apartment.districtName, apartment.addressDetail].filter(Boolean).join(", ") || "Address unavailable"}</div>
      </div>
      <div class="detail-grid">
        <div><strong>Labels</strong><p>${labels}</p></div>
        <div><strong>Attributes</strong><p>${attrs}</p></div>
        <div><strong>Facilities</strong><p>${facilities}</p></div>
        <div><strong>Lease terms</strong><p>${terms}</p></div>
      </div>
      <form id="appointmentForm" class="appointment-form">
        <label>
          <span>Name</span>
          <input name="name" type="text" placeholder="Your name" required>
        </label>
        <label>
          <span>Phone</span>
          <input name="phone" type="text" value="${state.phone || ""}" placeholder="Your phone number" required>
        </label>
        <label>
          <span>Visit time</span>
          <input name="appointmentTime" type="datetime-local" required>
        </label>
        <label>
          <span>Notes</span>
          <textarea name="additionalInfo" placeholder="Preferred time, questions, or anything else"></textarea>
        </label>
        <button class="primary-btn" type="submit">Submit appointment</button>
        <p id="appointmentMessage" class="muted-text">You can still demonstrate appointments in offline mode.</p>
      </form>
    </div>`;
  $("#appointmentForm").addEventListener("submit", submitAppointment);
}

async function showRoom(id) {
  let detail = mockApp.roomDetails[id];
  if (!state.demoData) {
    try {
      detail = await request(`/app/room/getDetailById?id=${id}`, {}, false);
    } catch (error) {
      enableDemoData(error.message);
    }
  }
  renderRoomDetail(detail || mockApp.roomDetails[Object.keys(mockApp.roomDetails)[0]]);
  if (state.token) await loadHistory();
}

async function submitAppointment(event) {
  event.preventDefault();
  if (!state.token) {
    $("#appointmentMessage").textContent = "Sign in first, or use the demo login.";
    return;
  }

  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  payload.apartmentId = state.currentRoom?.apartmentItemVo?.id || state.currentRoom?.apartmentId;
  payload.appointmentStatus = 1;
  payload.appointmentTime = `${payload.appointmentTime}:00`;
  $("#appointmentMessage").textContent = "Submitting...";

  if (state.demoData || state.token === DEMO_TOKEN) {
    mockApp.appointments.unshift({
      id: Date.now(),
      apartmentName: state.currentRoom?.apartmentItemVo?.name || "Demo apartment",
      appointmentTime: payload.appointmentTime,
      appointmentStatus: 1
    });
    $("#appointmentMessage").textContent = "Saved into local demo data.";
    event.currentTarget.reset();
    await loadAppointments();
    return;
  }

  try {
    await request("/app/appointment/saveOrUpdate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    $("#appointmentMessage").textContent = "Appointment submitted.";
    event.currentTarget.reset();
    await loadAppointments();
  } catch (error) {
    enableDemoData(error.message);
    $("#appointmentMessage").textContent = "Backend unavailable. Switched to local demo data.";
  }
}

async function loadAppointments() {
  if (!state.token) {
    $("#appointmentList").innerHTML = `<div class="empty-state">Sign in to see appointments</div>`;
    return;
  }

  let items = mockApp.appointments;
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      items = await request("/app/appointment/listItem");
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  $("#appointmentList").innerHTML = items.length ? items.map((item) => `
    <article class="stack-item">
      <h3>${item.apartmentName || "Appointment"}</h3>
      <p>${fmtDateTime(item.appointmentTime)}</p>
      <p>${statusTag(appointmentLabels, item.appointmentStatus)}</p>
    </article>
  `).join("") : `<div class="empty-state">No appointments yet</div>`;
}

async function loadAgreements() {
  if (!state.token) {
    $("#agreementList").innerHTML = `<div class="empty-state">Sign in to see agreements</div>`;
    return;
  }

  let items = mockApp.agreements;
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      items = await request("/app/agreement/listItem");
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  $("#agreementList").innerHTML = items.length ? items.map((item) => `
    <article class="stack-item">
      <h3>${item.apartmentName || "Agreement"} · ${item.roomNumber || "-"}</h3>
      <p>Lease ${fmtDateTime(item.leaseStartDate).slice(0, 10)} to ${fmtDateTime(item.leaseEndDate).slice(0, 10)}</p>
      <p>Rent ${fmtMoney(item.rent)}</p>
      <p>${statusTag(agreementLabels, item.leaseStatus)}</p>
    </article>
  `).join("") : `<div class="empty-state">No agreements yet</div>`;
}

async function loadHistory() {
  if (!state.token) {
    $("#historyList").innerHTML = `<div class="empty-state">Sign in to collect browsing history</div>`;
    return;
  }

  let items = mockApp.history;
  if (!state.demoData && state.token !== DEMO_TOKEN) {
    try {
      const data = await request("/app/history/pageItem?current=1&size=6");
      items = data.records || [];
    } catch (error) {
      enableDemoData(error.message);
    }
  }

  $("#historyList").innerHTML = items.length ? items.map((item) => `
    <article class="stack-item">
      <h3>${item.apartmentName || "History"} · ${item.roomNumber || "-"}</h3>
      <p>${[item.provinceName, item.cityName, item.districtName].filter(Boolean).join(" / ") || "Location unavailable"}</p>
      <p>Rent ${fmtMoney(item.rent)}</p>
    </article>
  `).join("") : `<div class="empty-state">No browsing history yet</div>`;
}

async function bootstrap() {
  try {
    if (state.token) await loadProfile();
    else fillProfile("Guest mode", "You can browse rooms without signing in.");
    await Promise.all([loadAppointments(), loadAgreements(), loadHistory()]);
  } catch (error) {
    localStorage.removeItem("lease_app_token");
    state.token = "";
    fillProfile("Guest mode", error.message || "Unable to load profile");
  }
}

function bindFilters() {
  $("#filterForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const params = Object.fromEntries(new FormData(event.currentTarget).entries());
    state.currentRoom = null;
    await loadRooms(params);
  });
}

function bindLogout() {
  $("#logoutBtn").addEventListener("click", async () => {
    state.token = "";
    state.phone = "";
    state.demoData = false;
    state.demoReason = "";
    localStorage.removeItem("lease_app_token");
    fillProfile("Guest mode", "You can browse rooms without signing in.");
    $("#loginMessage").textContent = "Signed out.";
    await Promise.all([loadAppointments(), loadAgreements(), loadHistory()]);
  });
}

$("#loginForm").addEventListener("submit", handleLogin);
bindFilters();
bindLogout();
window.showRoom = showRoom;

(async function init() {
  if (state.token === DEMO_TOKEN) state.demoData = true;
  await loadRooms();
  if (state.token) await bootstrap();
})();
