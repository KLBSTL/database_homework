const state = {
  token: localStorage.getItem("lease_app_token") || "",
  currentRoom: null,
  phone: "",
  demoData: false,
  demoReason: ""
};

const DEMO_TOKEN = "FRONTEND_DEMO_APP";
const appointmentLabels = { 1: ["待看房", "warn"], 2: ["已取消", "danger"], 3: ["已看房", "ok"] };
const agreementLabels = { 1: ["待确认", "warn"], 2: ["已签约", "ok"], 3: ["已取消", "danger"], 4: ["已到期", "warn"], 5: ["退租中", "warn"], 6: ["已结束", "danger"], 7: ["续约中", "warn"] };

const mockApp = {
  rooms: [
    {
      id: 1001,
      roomNumber: "A-101",
      rent: 3200,
      apartmentInfo: {
        id: 9,
        name: "温都水城社区",
        provinceName: "北京市",
        cityName: "北京市",
        districtName: "昌平区"
      },
      labelInfoList: [{ name: "近校园" }, { name: "拎包入住" }],
      graphVoList: []
    },
    {
      id: 1002,
      roomNumber: "A-203",
      rent: 3600,
      apartmentInfo: {
        id: 9,
        name: "温都水城社区",
        provinceName: "北京市",
        cityName: "北京市",
        districtName: "昌平区"
      },
      labelInfoList: [{ name: "楼层安静" }, { name: "采光好" }],
      graphVoList: []
    },
    {
      id: 2001,
      roomNumber: "B-1102",
      rent: 4100,
      apartmentInfo: {
        id: 10,
        name: "回龙观社区",
        provinceName: "北京市",
        cityName: "北京市",
        districtName: "昌平区"
      },
      labelInfoList: [{ name: "近地铁" }, { name: "景观房" }],
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
        name: "温都水城社区",
        provinceName: "北京市",
        cityName: "北京市",
        districtName: "昌平区",
        addressDetail: "王府街 55 号",
        phone: "1234567788"
      },
      attrValueVoList: [{ attrKey: "户型", attrValueName: "一室一卫" }, { attrKey: "面积", attrValueName: "35 平米" }],
      facilityInfoList: [{ name: "空调" }, { name: "书桌" }],
      labelInfoList: [{ name: "近校园" }, { name: "拎包入住" }],
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
        name: "温都水城社区",
        provinceName: "北京市",
        cityName: "北京市",
        districtName: "昌平区",
        addressDetail: "王府街 55 号",
        phone: "1234567788"
      },
      attrValueVoList: [{ attrKey: "户型", attrValueName: "开间" }, { attrKey: "面积", attrValueName: "28 平米" }],
      facilityInfoList: [{ name: "洗衣机" }, { name: "衣柜" }],
      labelInfoList: [{ name: "楼层安静" }, { name: "采光好" }],
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
        name: "回龙观社区",
        provinceName: "北京市",
        cityName: "北京市",
        districtName: "昌平区",
        addressDetail: "地铁站 B 口附近",
        phone: "12345678"
      },
      attrValueVoList: [{ attrKey: "户型", attrValueName: "一室一卫" }, { attrKey: "面积", attrValueName: "40 平米" }],
      facilityInfoList: [{ name: "阳台" }, { name: "冰箱" }],
      labelInfoList: [{ name: "近地铁" }, { name: "景观房" }],
      leaseTermList: [{ monthCount: 12 }, { monthCount: 18 }],
      graphVoList: []
    }
  },
  appointments: [
    { id: 1, apartmentName: "温都水城社区", appointmentTime: "2026-04-18T14:00:00", appointmentStatus: 1 },
    { id: 2, apartmentName: "回龙观社区", appointmentTime: "2026-04-20T10:30:00", appointmentStatus: 3 }
  ],
  agreements: [
    {
      id: 1,
      apartmentName: "温都水城社区",
      roomNumber: "A-101",
      leaseStatus: 2,
      leaseStartDate: "2026-03-01",
      leaseEndDate: "2027-02-28",
      rent: 3200
    }
  ],
  history: [
    { id: 1, apartmentName: "温都水城社区", roomNumber: "A-101", provinceName: "北京市", cityName: "北京市", districtName: "昌平区", rent: 3200 },
    { id: 2, apartmentName: "回龙观社区", roomNumber: "B-1102", provinceName: "北京市", cityName: "北京市", districtName: "昌平区", rent: 4100 }
  ]
};

const $ = (selector) => document.querySelector(selector);

async function request(url, options = {}, withAuth = true) {
  const headers = { ...(options.headers || {}) };
  if (withAuth && state.token && state.token !== DEMO_TOKEN) headers["access-token"] = state.token;
  const response = await fetch(url, { ...options, headers });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const result = await response.json();
  if (result.code !== 200) throw new Error(result.message || "请求失败");
  return result.data;
}

function normalizeReason(reason) {
  if (!reason) return "用户端接口暂不可用";
  if (/^HTTP\s+\d+/i.test(reason)) return "接口返回异常";
  if (reason === "Failed to fetch") return "无法连接后端服务";
  if (reason === "Request failed") return "请求失败";
  return reason;
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
  const [text, tone] = map[value] || ["未知", "warn"];
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
    state.demoReason = normalizeReason(reason);
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
  $("#loginMessage").textContent = "正在登录...";
  try {
    const token = await request("/app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    }, false);
    state.token = token;
    state.phone = payload.phone;
    state.demoData = false;
    state.demoReason = "";
    localStorage.setItem("lease_app_token", token);
    $("#loginMessage").textContent = "登录成功，正在加载个人数据...";
    await bootstrap();
  } catch (error) {
    if (payload.phone && payload.code === "123456") {
      state.token = DEMO_TOKEN;
      state.phone = payload.phone;
      state.demoData = true;
      state.demoReason = normalizeReason(error.message);
      localStorage.setItem("lease_app_token", DEMO_TOKEN);
      $("#loginMessage").textContent = "已切换到离线演示模式。";
      await bootstrap();
      return;
    }
    $("#loginMessage").textContent = normalizeReason(error.message) || "登录失败";
  }
}

async function loadProfile() {
  if (state.token === DEMO_TOKEN) {
    fillProfile("演示租客", `离线演示模式：${state.demoReason || "使用本地示例数据"}`);
    return;
  }

  try {
    const data = await request("/app/info");
    fillProfile(data.nickname || "租客", data.avatarUrl ? "个人信息已加载" : "当前为在线模式");
  } catch (error) {
    enableDemoData(error.message);
    fillProfile("演示租客", `离线演示模式：${state.demoReason}`);
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
        <h3>${item.apartmentInfo?.name || "公寓"} · ${item.roomNumber || "-"}</h3>
        <p>${[item.apartmentInfo?.provinceName, item.apartmentInfo?.cityName, item.apartmentInfo?.districtName].filter(Boolean).join(" / ") || "暂无位置信息"}</p>
        <p>${(item.labelInfoList || []).map((label) => label.name).join(" / ") || "可直接入住"}</p>
        <div class="detail-meta">
          <div>月租 ${fmtMoney(item.rent)}</div>
          <div><button class="ghost-btn" onclick="showRoom(${item.id})">查看详情</button></div>
        </div>
      </div>
    </article>
  `).join("") : `<div class="empty-state">暂无房源数据</div>`;

  if (records[0] && !state.currentRoom) {
    await showRoom(records[0].id);
  }
}

function renderRoomDetail(item) {
  state.currentRoom = item;
  const apartment = item.apartmentItemVo || {};
  const attrs = (item.attrValueVoList || []).map((node) => `${node.attrKey || "属性"}：${node.attrValueName || "-"}`).join(" / ") || "暂无属性";
  const facilities = (item.facilityInfoList || []).map((node) => node.name).join(" / ") || "暂无配套";
  const labels = (item.labelInfoList || []).map((node) => node.name).join(" / ") || "暂无标签";
  const terms = (item.leaseTermList || []).map((node) => node.monthCount ? `${node.monthCount} 个月` : (node.name || "租期")).join(" / ") || "暂无租期";

  $("#roomDetail").innerHTML = `
    <div class="detail-banner" ${roomCover(item)}></div>
    <div class="detail-content">
      <p class="eyebrow">房源详情</p>
      <h2>${apartment.name || "公寓"} · ${item.roomNumber || "-"}</h2>
      <div class="detail-meta">
        <div>月租 ${fmtMoney(item.rent)}</div>
        <div>联系电话 ${apartment.phone || "-"}</div>
        <div>${[apartment.provinceName, apartment.cityName, apartment.districtName, apartment.addressDetail].filter(Boolean).join("，") || "暂无地址信息"}</div>
      </div>
      <div class="detail-grid">
        <div><strong>标签</strong><p>${labels}</p></div>
        <div><strong>属性</strong><p>${attrs}</p></div>
        <div><strong>配套</strong><p>${facilities}</p></div>
        <div><strong>租期</strong><p>${terms}</p></div>
      </div>
      <form id="appointmentForm" class="appointment-form">
        <label>
          <span>姓名</span>
          <input name="name" type="text" placeholder="请输入姓名" required>
        </label>
        <label>
          <span>手机号</span>
          <input name="phone" type="text" value="${state.phone || ""}" placeholder="请输入手机号" required>
        </label>
        <label>
          <span>看房时间</span>
          <input name="appointmentTime" type="datetime-local" required>
        </label>
        <label>
          <span>备注</span>
          <textarea name="additionalInfo" placeholder="可填写到访时间、问题或看房偏好"></textarea>
        </label>
        <button class="primary-btn" type="submit">提交预约</button>
        <p id="appointmentMessage" class="muted-text">即使后端未启动，也可以用本地演示数据完整展示流程。</p>
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
    $("#appointmentMessage").textContent = "请先登录，再提交预约。";
    return;
  }

  const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
  payload.apartmentId = state.currentRoom?.apartmentItemVo?.id || state.currentRoom?.apartmentId;
  payload.appointmentStatus = 1;
  payload.appointmentTime = `${payload.appointmentTime}:00`;
  $("#appointmentMessage").textContent = "正在提交...";

  if (state.demoData || state.token === DEMO_TOKEN) {
    mockApp.appointments.unshift({
      id: Date.now(),
      apartmentName: state.currentRoom?.apartmentItemVo?.name || "演示公寓",
      appointmentTime: payload.appointmentTime,
      appointmentStatus: 1
    });
    $("#appointmentMessage").textContent = "已保存到本地演示数据。";
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
    $("#appointmentMessage").textContent = "预约提交成功。";
    event.currentTarget.reset();
    await loadAppointments();
  } catch (error) {
    enableDemoData(error.message);
    $("#appointmentMessage").textContent = "后端不可用，已自动切换到本地演示数据。";
  }
}

async function loadAppointments() {
  if (!state.token) {
    $("#appointmentList").innerHTML = `<div class="empty-state">登录后可查看预约记录</div>`;
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
      <h3>${item.apartmentName || "预约记录"}</h3>
      <p>${fmtDateTime(item.appointmentTime)}</p>
      <p>${statusTag(appointmentLabels, item.appointmentStatus)}</p>
    </article>
  `).join("") : `<div class="empty-state">暂无预约记录</div>`;
}

async function loadAgreements() {
  if (!state.token) {
    $("#agreementList").innerHTML = `<div class="empty-state">登录后可查看租约信息</div>`;
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
      <h3>${item.apartmentName || "租约"} · ${item.roomNumber || "-"}</h3>
      <p>租期 ${fmtDateTime(item.leaseStartDate).slice(0, 10)} 至 ${fmtDateTime(item.leaseEndDate).slice(0, 10)}</p>
      <p>月租 ${fmtMoney(item.rent)}</p>
      <p>${statusTag(agreementLabels, item.leaseStatus)}</p>
    </article>
  `).join("") : `<div class="empty-state">暂无租约记录</div>`;
}

async function loadHistory() {
  if (!state.token) {
    $("#historyList").innerHTML = `<div class="empty-state">登录后会记录浏览历史</div>`;
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
      <h3>${item.apartmentName || "浏览记录"} · ${item.roomNumber || "-"}</h3>
      <p>${[item.provinceName, item.cityName, item.districtName].filter(Boolean).join(" / ") || "暂无位置信息"}</p>
      <p>月租 ${fmtMoney(item.rent)}</p>
    </article>
  `).join("") : `<div class="empty-state">暂无浏览历史</div>`;
}

async function bootstrap() {
  try {
    if (state.token) {
      await loadProfile();
    } else {
      fillProfile("游客模式", "未登录也可以浏览房源。");
    }
    await Promise.all([loadAppointments(), loadAgreements(), loadHistory()]);
  } catch (error) {
    localStorage.removeItem("lease_app_token");
    state.token = "";
    fillProfile("游客模式", normalizeReason(error.message) || "加载失败");
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
    fillProfile("游客模式", "未登录也可以浏览房源。");
    $("#loginMessage").textContent = "已退出当前登录。";
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
