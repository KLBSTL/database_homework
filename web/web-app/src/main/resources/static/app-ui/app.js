(() => {
    const STORAGE_KEY = "lease_app_token";
    const PHONE_KEY = "lease_app_phone";
    const DEMO_TOKEN = "FRONTEND_DEMO_APP";
    const API_BASE = window.location.port === "8081"
        ? `${window.location.protocol}//${window.location.hostname || "localhost"}:18082`
        : "";

    const state = {
        token: localStorage.getItem(STORAGE_KEY) || "",
        phone: localStorage.getItem(PHONE_KEY) || "",
        currentPage: "discover",
        browseDemo: false,
        browseReason: "",
        userDemo: false,
        userReason: "",
        refs: {
            provinces: []
        },
        caches: {
            citiesByProvince: {},
            districtsByCity: {}
        },
        filters: {
            provinceId: "",
            cityId: "",
            districtId: "",
            minRent: "",
            maxRent: "",
            orderType: ""
        },
        apartments: {
            records: [],
            selectedId: null,
            detail: null
        },
        rooms: {
            records: [],
            rawRecords: [],
            selectedId: null,
            detail: null
        }
    };

    const statusMaps = {
        appointment: {
            1: ["待看房", "warn"],
            2: ["已取消", "danger"],
            3: ["已完成", "ok"]
        },
        agreement: {
            1: ["签约待确认", "warn"],
            2: ["已签约", "ok"],
            3: ["已取消", "danger"],
            4: ["已到期", "warn"],
            5: ["退租待确认", "warn"],
            6: ["已退租", "danger"],
            7: ["续约待确认", "warn"]
        }
    };

    const mock = {
        refs: {
            provinces: [
                { id: 11, name: "北京市" },
                { id: 31, name: "上海市" }
            ],
            citiesByProvince: {
                11: [{ id: 1101, name: "北京市", provinceId: 11 }],
                31: [{ id: 3101, name: "上海市", provinceId: 31 }]
            },
            districtsByCity: {
                1101: [
                    { id: 110105, name: "朝阳区", cityId: 1101 },
                    { id: 110108, name: "海淀区", cityId: 1101 }
                ],
                3101: [
                    { id: 310104, name: "徐汇区", cityId: 3101 },
                    { id: 310115, name: "浦东新区", cityId: 3101 }
                ]
            }
        },
        apartments: [
            {
                id: 101,
                name: "望京青年公寓 A 栋",
                introduction: "靠近地铁和商圈，适合课程答辩演示的标准公寓示例。",
                provinceId: 11,
                provinceName: "北京市",
                cityId: 1101,
                cityName: "北京市",
                districtId: 110105,
                districtName: "朝阳区",
                addressDetail: "阜通东大街 88 号",
                phone: "010-88886666",
                minRent: 3200,
                labelInfoList: [{ name: "近地铁" }, { name: "拎包入住" }]
            },
            {
                id: 102,
                name: "徐汇宜居公寓",
                introduction: "已发布公寓会自动出现在用户端，多层界面会实时同步。",
                provinceId: 31,
                provinceName: "上海市",
                cityId: 3101,
                cityName: "上海市",
                districtId: 310104,
                districtName: "徐汇区",
                addressDetail: "漕溪北路 66 号",
                phone: "021-66668888",
                minRent: 4100,
                labelInfoList: [{ name: "商圈便利" }, { name: "带公共厨房" }]
            }
        ],
        apartmentDetails: {
            101: {
                id: 101,
                name: "望京青年公寓 A 栋",
                introduction: "靠近地铁和商圈，周边生活配套成熟，适合学生和初入职场用户。",
                provinceName: "北京市",
                cityName: "北京市",
                districtName: "朝阳区",
                addressDetail: "阜通东大街 88 号",
                phone: "010-88886666",
                minRent: 3200,
                labelInfoList: [{ name: "近地铁" }, { name: "拎包入住" }],
                facilityInfoList: [{ name: "电梯" }, { name: "公共洗衣房" }, { name: "门禁" }],
                graphVoList: [
                    { name: "公寓外景", url: "https://picsum.photos/seed/app-apartment-101/900/420" },
                    { name: "大厅", url: "https://picsum.photos/seed/app-apartment-101-hall/900/420" }
                ]
            },
            102: {
                id: 102,
                name: "徐汇宜居公寓",
                introduction: "靠近商圈与写字楼，日常通勤方便，适合需要稳定租住的用户。",
                provinceName: "上海市",
                cityName: "上海市",
                districtName: "徐汇区",
                addressDetail: "漕溪北路 66 号",
                phone: "021-66668888",
                minRent: 4100,
                labelInfoList: [{ name: "商圈便利" }, { name: "带公共厨房" }],
                facilityInfoList: [{ name: "健身区" }, { name: "快递柜" }, { name: "监控" }],
                graphVoList: [
                    { name: "公寓外景", url: "https://picsum.photos/seed/app-apartment-102/900/420" },
                    { name: "公共区", url: "https://picsum.photos/seed/app-apartment-102-hall/900/420" }
                ]
            }
        },
        rooms: {
            101: [
                {
                    id: 201,
                    roomNumber: "A-101",
                    rent: 3200,
                    apartmentInfo: { id: 101, name: "望京青年公寓 A 栋", provinceName: "北京市", cityName: "北京市", districtName: "朝阳区" },
                    labelInfoList: [{ name: "朝南" }, { name: "独立卫浴" }],
                    graphVoList: [{ name: "房间图", url: "https://picsum.photos/seed/app-room-201/900/420" }]
                },
                {
                    id: 202,
                    roomNumber: "A-203",
                    rent: 3600,
                    apartmentInfo: { id: 101, name: "望京青年公寓 A 栋", provinceName: "北京市", cityName: "北京市", districtName: "朝阳区" },
                    labelInfoList: [{ name: "采光好" }, { name: "有书桌" }],
                    graphVoList: [{ name: "房间图", url: "https://picsum.photos/seed/app-room-202/900/420" }]
                }
            ],
            102: [
                {
                    id: 203,
                    roomNumber: "B-1102",
                    rent: 4100,
                    apartmentInfo: { id: 102, name: "徐汇宜居公寓", provinceName: "上海市", cityName: "上海市", districtName: "徐汇区" },
                    labelInfoList: [{ name: "高楼层" }, { name: "独立阳台" }],
                    graphVoList: [{ name: "房间图", url: "https://picsum.photos/seed/app-room-203/900/420" }]
                }
            ]
        },
        roomDetails: {
            201: {
                id: 201,
                roomNumber: "A-101",
                rent: 3200,
                apartmentId: 101,
                apartmentItemVo: {
                    id: 101,
                    name: "望京青年公寓 A 栋",
                    provinceName: "北京市",
                    cityName: "北京市",
                    districtName: "朝阳区",
                    addressDetail: "阜通东大街 88 号",
                    phone: "010-88886666"
                },
                attrValueVoList: [{ attrKeyName: "户型", name: "一室一卫" }, { attrKeyName: "面积", name: "35㎡" }],
                facilityInfoList: [{ name: "洗衣机" }, { name: "空调" }, { name: "热水器" }],
                labelInfoList: [{ name: "朝南" }, { name: "独立卫浴" }],
                paymentTypeList: [{ name: "押一付一" }, { name: "押一付三" }],
                feeValueVoList: [{ feeItemName: "物业费", feeValueName: "150 元/月" }],
                leaseTermList: [{ monthCount: 6, unit: "个月" }, { monthCount: 12, unit: "个月" }],
                graphVoList: [
                    { name: "客厅", url: "https://picsum.photos/seed/app-room-detail-201/900/420" },
                    { name: "卧室", url: "https://picsum.photos/seed/app-room-detail-201-bed/900/420" }
                ]
            },
            202: {
                id: 202,
                roomNumber: "A-203",
                rent: 3600,
                apartmentId: 101,
                apartmentItemVo: {
                    id: 101,
                    name: "望京青年公寓 A 栋",
                    provinceName: "北京市",
                    cityName: "北京市",
                    districtName: "朝阳区",
                    addressDetail: "阜通东大街 88 号",
                    phone: "010-88886666"
                },
                attrValueVoList: [{ attrKeyName: "户型", name: "一室一厅" }, { attrKeyName: "面积", name: "42㎡" }],
                facilityInfoList: [{ name: "冰箱" }, { name: "空调" }],
                labelInfoList: [{ name: "采光好" }, { name: "有书桌" }],
                paymentTypeList: [{ name: "押一付三" }],
                feeValueVoList: [{ feeItemName: "物业费", feeValueName: "180 元/月" }],
                leaseTermList: [{ monthCount: 12, unit: "个月" }],
                graphVoList: [
                    { name: "客厅", url: "https://picsum.photos/seed/app-room-detail-202/900/420" },
                    { name: "卧室", url: "https://picsum.photos/seed/app-room-detail-202-bed/900/420" }
                ]
            },
            203: {
                id: 203,
                roomNumber: "B-1102",
                rent: 4100,
                apartmentId: 102,
                apartmentItemVo: {
                    id: 102,
                    name: "徐汇宜居公寓",
                    provinceName: "上海市",
                    cityName: "上海市",
                    districtName: "徐汇区",
                    addressDetail: "漕溪北路 66 号",
                    phone: "021-66668888"
                },
                attrValueVoList: [{ attrKeyName: "户型", name: "一室一厅" }, { attrKeyName: "面积", name: "45㎡" }],
                facilityInfoList: [{ name: "洗衣机" }, { name: "冰箱" }, { name: "独立阳台" }],
                labelInfoList: [{ name: "高楼层" }, { name: "独立阳台" }],
                paymentTypeList: [{ name: "押一付一" }, { name: "押一付三" }],
                feeValueVoList: [{ feeItemName: "物业费", feeValueName: "200 元/月" }],
                leaseTermList: [{ monthCount: 12, unit: "个月" }, { monthCount: 18, unit: "个月" }],
                graphVoList: [
                    { name: "客厅", url: "https://picsum.photos/seed/app-room-detail-203/900/420" },
                    { name: "卧室", url: "https://picsum.photos/seed/app-room-detail-203-bed/900/420" }
                ]
            }
        },
        appointments: [
            { id: 1, apartmentName: "望京青年公寓 A 栋", appointmentTime: "2026-04-18 14:00:00", appointmentStatus: 1 },
            { id: 2, apartmentName: "徐汇宜居公寓", appointmentTime: "2026-04-20 10:30:00", appointmentStatus: 3 }
        ],
        agreements: [
            { id: 1, apartmentName: "望京青年公寓 A 栋", roomNumber: "A-101", leaseStatus: 2, leaseStartDate: "2026-03-01", leaseEndDate: "2027-02-28", rent: 3200 }
        ],
        history: [
            { id: 1, apartmentName: "望京青年公寓 A 栋", roomNumber: "A-101", provinceName: "北京市", cityName: "北京市", districtName: "朝阳区", rent: 3200 },
            { id: 2, apartmentName: "徐汇宜居公寓", roomNumber: "B-1102", provinceName: "上海市", cityName: "上海市", districtName: "徐汇区", rent: 4100 }
        ]
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
    const clone = (value) => JSON.parse(JSON.stringify(value));

    function escapeHtml(value) {
        return String(value ?? "")
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");
    }

    function formatMoney(value) {
        if (value === null || value === undefined || value === "") return "-";
        return `¥ ${new Intl.NumberFormat("zh-CN").format(Number(value))} / 月`;
    }

    function formatDate(value, mode = "datetime") {
        if (!value) return "-";
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return String(value).replace("T", " ").slice(0, mode === "date" ? 10 : 16);
        }
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        if (mode === "date") return `${year}-${month}-${day}`;
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day} ${hours}:${minutes}`;
    }

    function toDatetimeLocalValue(date) {
        const next = date instanceof Date ? date : new Date(date);
        const year = next.getFullYear();
        const month = String(next.getMonth() + 1).padStart(2, "0");
        const day = String(next.getDate()).padStart(2, "0");
        const hours = String(next.getHours()).padStart(2, "0");
        const minutes = String(next.getMinutes()).padStart(2, "0");
        return `${year}-${month}-${day}T${hours}:${minutes}`;
    }

    function toApiDateTime(value) {
        if (!value) return "";
        return `${value.replace("T", " ")}:00`;
    }

    function normalizeReason(reason) {
        if (!reason) return "公共接口暂时不可用，已切换到演示数据。";
        if (reason === "Failed to fetch") {
            return API_BASE
                ? "无法连接到 18082 用户端服务，请确认用户端已经启动。"
                : "无法连接到用户端服务，请检查后端是否正在运行。";
        }
        if (/HTTP\\s+401/i.test(reason)) return "当前登录态已失效，请重新登录。";
        return String(reason);
    }

    function makeStatus(map, value) {
        const key = String(value?.code ?? value ?? "");
        const [text, tone] = map[key] || ["未知状态", "warn"];
        return `<span class="status-pill ${tone}">${escapeHtml(text)}</span>`;
    }

    function renderTags(items, emptyText = "暂无标签", formatter = (item) => item.name || item.label || item.text) {
        const list = (items || []).map((item) => formatter(item)).filter(Boolean);
        if (!list.length) return `<span class="muted-text">${escapeHtml(emptyText)}</span>`;
        return list.map((text) => `<span class="tag-chip">${escapeHtml(text)}</span>`).join("");
    }

    function formatLocation(item) {
        return [item?.provinceName, item?.cityName, item?.districtName].filter(Boolean).join(" / ") || "暂无区域信息";
    }

    function getImageUrl(graphList, seed) {
        const url = (graphList || []).find((item) => item?.url)?.url;
        return url || `https://picsum.photos/seed/${seed}/900/420`;
    }

    function buildUrl(path) {
        return `${API_BASE}${path}`;
    }

    async function request(path, options = {}, withAuth = false) {
        const headers = { ...(options.headers || {}) };
        if (withAuth && state.token && state.token !== DEMO_TOKEN) {
            headers["access-token"] = state.token;
        }

        let response;
        try {
            response = await fetch(buildUrl(path), { ...options, headers });
        } catch (error) {
            const wrapped = new Error(error.message || "Failed to fetch");
            wrapped.networkError = true;
            throw wrapped;
        }

        if (!response.ok) {
            const wrapped = new Error(`HTTP ${response.status}`);
            wrapped.httpStatus = response.status;
            throw wrapped;
        }

        const result = await response.json();
        if (result.code !== 200) {
            const wrapped = new Error(result.message || "请求失败");
            wrapped.businessError = true;
            throw wrapped;
        }
        return result.data;
    }

    function persistSession() {
        if (state.token) {
            localStorage.setItem(STORAGE_KEY, state.token);
        } else {
            localStorage.removeItem(STORAGE_KEY);
        }

        if (state.phone) {
            localStorage.setItem(PHONE_KEY, state.phone);
        } else {
            localStorage.removeItem(PHONE_KEY);
        }
    }

    function setLoginMessage(text) {
        $("#loginMessage").textContent = text;
    }

    function setBrowseMode(live, reason = "") {
        state.browseDemo = !live;
        state.browseReason = reason || "";
        const tag = $("#browseModeTag");
        tag.textContent = live ? "实时数据" : "演示数据";
        tag.className = `status-pill ${live ? "ok" : "warn"}`;
        $("#apiHint").textContent = live
            ? (API_BASE
                ? `当前页面通过 ${API_BASE} 读取用户端接口，后台发布、编辑或删除已发布公寓后，这里刷新即可同步。`
                : "当前页面直接读取用户端真实数据，后台修改已发布公寓后，这里刷新即可同步。")
            : `当前已切换到演示数据。${normalizeReason(reason)}`;
    }

    function setProfile(name, desc) {
        $("#profileName").textContent = name;
        $("#profileMeta").textContent = desc;
    }

    function fillSelect(select, items, placeholder, selectedValue = "") {
        const selected = selectedValue == null ? "" : String(selectedValue);
        const options = [`<option value="">${escapeHtml(placeholder)}</option>`];
        (items || []).forEach((item) => {
            const value = String(item.id);
            const selectedAttr = value === selected ? " selected" : "";
            options.push(`<option value="${escapeHtml(value)}"${selectedAttr}>${escapeHtml(item.name)}</option>`);
        });
        select.innerHTML = options.join("");
    }

    async function loadProvinceRefs() {
        try {
            const data = await request("/app/region/province/list");
            state.refs.provinces = data || [];
            setBrowseMode(true);
        } catch (error) {
            state.refs.provinces = clone(mock.refs.provinces);
            setBrowseMode(false, error.message);
        }
    }

    async function ensureCities(provinceId) {
        if (!provinceId) return [];
        const key = String(provinceId);
        if (state.browseDemo) return clone(mock.refs.citiesByProvince[key] || []);
        if (!state.caches.citiesByProvince[key]) {
            try {
                state.caches.citiesByProvince[key] = await request(`/app/region/city/listByProvinceId?id=${provinceId}`);
                setBrowseMode(true);
            } catch (error) {
                setBrowseMode(false, error.message);
                return clone(mock.refs.citiesByProvince[key] || []);
            }
        }
        return clone(state.caches.citiesByProvince[key] || []);
    }

    async function ensureDistricts(cityId) {
        if (!cityId) return [];
        const key = String(cityId);
        if (state.browseDemo) return clone(mock.refs.districtsByCity[key] || []);
        if (!state.caches.districtsByCity[key]) {
            try {
                state.caches.districtsByCity[key] = await request(`/app/region/district/listByCityId?id=${cityId}`);
                setBrowseMode(true);
            } catch (error) {
                setBrowseMode(false, error.message);
                return clone(mock.refs.districtsByCity[key] || []);
            }
        }
        return clone(state.caches.districtsByCity[key] || []);
    }

    async function syncRegionFilters() {
        fillSelect($("#provinceFilter"), state.refs.provinces, "按省份筛选", state.filters.provinceId);
        const cities = state.filters.provinceId ? await ensureCities(state.filters.provinceId) : [];
        fillSelect($("#cityFilter"), cities, "按城市筛选", state.filters.cityId);
        const districts = state.filters.cityId ? await ensureDistricts(state.filters.cityId) : [];
        fillSelect($("#districtFilter"), districts, "按区域筛选", state.filters.districtId);
    }

    function buildMockApartmentList() {
        return clone(mock.apartments)
            .filter((item) => !state.filters.provinceId || String(item.provinceId) === String(state.filters.provinceId))
            .filter((item) => !state.filters.cityId || String(item.cityId) === String(state.filters.cityId))
            .filter((item) => !state.filters.districtId || String(item.districtId) === String(state.filters.districtId));
    }

    async function loadApartments(preferredId = state.apartments.selectedId) {
        let records = buildMockApartmentList();
        if (!state.browseDemo) {
            try {
                const query = new URLSearchParams({ current: "1", size: "30" });
                if (state.filters.provinceId) query.set("provinceId", state.filters.provinceId);
                if (state.filters.cityId) query.set("cityId", state.filters.cityId);
                if (state.filters.districtId) query.set("districtId", state.filters.districtId);
                const data = await request(`/app/apartment/pageItem?${query.toString()}`);
                records = data.records || [];
                setBrowseMode(true);
            } catch (error) {
                records = buildMockApartmentList();
                setBrowseMode(false, error.message);
            }
        }

        state.apartments.records = records;
        renderApartmentList();

        if (!records.length) {
            state.apartments.selectedId = null;
            state.apartments.detail = null;
            state.rooms.records = [];
            state.rooms.rawRecords = [];
            state.rooms.selectedId = null;
            state.rooms.detail = null;
            renderRoomList();
            renderDetail();
            return;
        }

        const nextId = records.some((item) => String(item.id) === String(preferredId))
            ? preferredId
            : records[0].id;
        await showApartment(nextId);
    }

    function renderApartmentList() {
        $("#apartmentCount").textContent = `${state.apartments.records.length} 个公寓`;
        const container = $("#apartmentList");
        if (!state.apartments.records.length) {
            container.innerHTML = `<div class="empty-state">当前没有符合条件的公寓。</div>`;
            return;
        }

        container.innerHTML = state.apartments.records.map((item) => {
            const active = String(item.id) === String(state.apartments.selectedId);
            const intro = item.introduction || item.addressDetail || "查看这个公寓的房间和配套";
            return `
                <article class="list-card ${active ? "is-active" : ""}" data-id="${item.id}">
                    <p class="eyebrow">公寓社区</p>
                    <h4>${escapeHtml(item.name || "未命名公寓")}</h4>
                    <p>${escapeHtml(formatLocation(item))}</p>
                    <p>${escapeHtml(intro)}</p>
                    <div class="toolbar">
                        <span class="count-chip">起租 ${escapeHtml(formatMoney(item.minRent))}</span>
                    </div>
                    <div class="pill-wrap">${renderTags(item.labelInfoList, "暂无标签")}</div>
                </article>
            `;
        }).join("");
    }

    async function showApartment(id) {
        state.apartments.selectedId = id;
        renderApartmentList();

        let detail = clone(mock.apartmentDetails[id] || mock.apartments.find((item) => String(item.id) === String(id)) || null);
        if (!state.browseDemo) {
            try {
                detail = await request(`/app/apartment/getDetailById?id=${id}`);
                setBrowseMode(true);
            } catch (error) {
                detail = clone(mock.apartmentDetails[id] || mock.apartments.find((item) => String(item.id) === String(id)) || null);
                setBrowseMode(false, error.message);
            }
        }

        state.apartments.detail = detail;
        await loadRoomsByApartment(id);
        renderDetail();
    }

    function applyRoomFilters(records) {
        let next = clone(records || []);
        if (state.filters.minRent) next = next.filter((item) => Number(item.rent || 0) >= Number(state.filters.minRent));
        if (state.filters.maxRent) next = next.filter((item) => Number(item.rent || 0) <= Number(state.filters.maxRent));
        if (state.filters.orderType === "asc") next.sort((a, b) => Number(a.rent || 0) - Number(b.rent || 0));
        if (state.filters.orderType === "desc") next.sort((a, b) => Number(b.rent || 0) - Number(a.rent || 0));
        return next;
    }

    async function loadRoomsByApartment(apartmentId, preferredRoomId = state.rooms.selectedId) {
        if (!apartmentId) {
            state.rooms.records = [];
            state.rooms.rawRecords = [];
            state.rooms.selectedId = null;
            state.rooms.detail = null;
            renderRoomList();
            renderDetail();
            return;
        }

        let records = clone(mock.rooms[apartmentId] || []);
        if (!state.browseDemo) {
            try {
                const data = await request(`/app/room/pageItemByApartmentId?current=1&size=50&id=${apartmentId}`);
                records = data.records || [];
                setBrowseMode(true);
            } catch (error) {
                records = clone(mock.rooms[apartmentId] || []);
                setBrowseMode(false, error.message);
            }
        }

        state.rooms.rawRecords = records;
        state.rooms.records = applyRoomFilters(records);
        renderRoomList();

        if (!state.rooms.records.length) {
            state.rooms.selectedId = null;
            state.rooms.detail = null;
            renderDetail();
            return;
        }

        const nextId = state.rooms.records.some((item) => String(item.id) === String(preferredRoomId))
            ? preferredRoomId
            : state.rooms.records[0].id;
        await showRoom(nextId);
    }

    function renderRoomList() {
        $("#roomCount").textContent = `${state.rooms.records.length} 个房间`;
        const container = $("#roomList");
        if (!state.apartments.selectedId) {
            container.innerHTML = `<div class="empty-state">请选择左侧公寓后查看可租房间。</div>`;
            return;
        }
        if (!state.rooms.records.length) {
            container.innerHTML = `<div class="empty-state">当前公寓暂无符合条件的可租房间。</div>`;
            return;
        }

        container.innerHTML = state.rooms.records.map((item) => {
            const active = String(item.id) === String(state.rooms.selectedId);
            return `
                <article class="list-card ${active ? "is-active" : ""}" data-id="${item.id}">
                    <p class="eyebrow">可租房间</p>
                    <h4>${escapeHtml(item.roomNumber || "未命名房间")}</h4>
                    <p>${escapeHtml(item.apartmentInfo?.name || state.apartments.detail?.name || "所属公寓")}</p>
                    <div class="toolbar">
                        <span class="count-chip">${escapeHtml(formatMoney(item.rent))}</span>
                    </div>
                    <div class="pill-wrap">${renderTags(item.labelInfoList, "暂无房间标签")}</div>
                </article>
            `;
        }).join("");
    }

    async function showRoom(id) {
        state.rooms.selectedId = id;
        renderRoomList();

        let detail = clone(mock.roomDetails[id] || null);
        if (!state.browseDemo) {
            try {
                detail = await request(`/app/room/getDetailById?id=${id}`);
                setBrowseMode(true);
            } catch (error) {
                detail = clone(mock.roomDetails[id] || null);
                setBrowseMode(false, error.message);
            }
        }

        state.rooms.detail = detail;
        renderDetail();
    }

    function renderDetail() {
        const container = $("#roomDetail");
        const apartment = state.apartments.detail;
        if (!apartment) {
            container.innerHTML = `<div class="empty-state">先从左侧选择一个公寓，右侧会显示公寓概览、房间详情和预约入口。</div>`;
            return;
        }

        const room = state.rooms.detail;
        const heroImage = getImageUrl(room?.graphVoList || apartment.graphVoList, `user-detail-${room?.id || apartment.id}`);
        const roomTitle = room ? `${room.roomNumber} · ${formatMoney(room.rent)}` : "请选择一个房间";
        const roomIntro = room
            ? "当前房间已与后台房源数据同步，适合演示“后台改数据，前台实时查看”的效果。"
            : "当前公寓暂无房间详情，您仍然可以查看公寓概况与配套。";
        const roomAttrs = (room?.attrValueVoList || []).map((item) => {
            const key = item.attrKeyName || item.attrKey || "属性";
            const value = item.name || item.attrValueName || "-";
            return `
                <div class="metric-box">
                    <strong>${escapeHtml(key)}</strong>
                    <span>${escapeHtml(value)}</span>
                </div>
            `;
        }).join("");
        const paymentTags = renderTags(room?.paymentTypeList, "暂无支付方式");
        const feeTags = renderTags(room?.feeValueVoList, "暂无杂费信息", (item) => item.feeItemName && item.feeValueName ? `${item.feeItemName}：${item.feeValueName}` : item.name);
        const termTags = renderTags(room?.leaseTermList, "暂无租期信息", (item) => `${item.monthCount || "-"}${item.unit || "个月"}`);
        const gallery = (room?.graphVoList?.length ? room.graphVoList : apartment.graphVoList || [])
            .slice(0, 3)
            .map((item, index) => `<img src="${escapeHtml(item.url || `https://picsum.photos/seed/gallery-${index}/900/420`)}" alt="${escapeHtml(item.name || "房源图片")}">`)
            .join("");
        const defaultAppointmentTime = toDatetimeLocalValue(new Date(Date.now() + 24 * 60 * 60 * 1000));
        const canSubmit = Boolean(room);

        container.innerHTML = `
            <article class="detail-hero" style="background-image: linear-gradient(180deg, rgba(15, 23, 42, 0.1), rgba(15, 23, 42, 0.35)), url('${escapeHtml(heroImage)}');">
                <p class="eyebrow">第三层</p>
                <h2>${escapeHtml(apartment.name || "未命名公寓")}</h2>
                <p>${escapeHtml(apartment.introduction || "这里展示公寓概览、房间详情和预约入口。")}</p>
                <div class="toolbar">
                    <span class="count-chip">起租 ${escapeHtml(formatMoney(apartment.minRent))}</span>
                    <span class="status-pill ${state.browseDemo ? "warn" : "ok"}">${state.browseDemo ? "演示浏览" : "实时同步"}</span>
                </div>
            </article>

            <div class="detail-meta">
                <div class="metric-box">
                    <strong>所在区域</strong>
                    <span>${escapeHtml(formatLocation(apartment))}</span>
                </div>
                <div class="metric-box">
                    <strong>详细地址</strong>
                    <span>${escapeHtml(apartment.addressDetail || "暂无地址")}</span>
                </div>
                <div class="metric-box">
                    <strong>咨询电话</strong>
                    <span>${escapeHtml(apartment.phone || "暂无联系电话")}</span>
                </div>
                <div class="metric-box">
                    <strong>当前选中房间</strong>
                    <span>${escapeHtml(roomTitle)}</span>
                </div>
            </div>

            <div class="detail-grid">
                <section class="detail-block">
                    <h3>公寓概况</h3>
                    <div class="kv-list">
                        <div>
                            <strong>公寓标签</strong>
                            <div class="pill-wrap">${renderTags(apartment.labelInfoList, "暂无公寓标签")}</div>
                        </div>
                        <div>
                            <strong>公寓配套</strong>
                            <div class="pill-wrap">${renderTags(apartment.facilityInfoList, "暂无配套信息")}</div>
                        </div>
                    </div>
                </section>

                <section class="detail-block">
                    <h3>房间详情</h3>
                    <p class="soft-note">${escapeHtml(roomIntro)}</p>
                    ${room ? `
                        <div class="metric-line">${roomAttrs || `<div class="muted-text">暂无房间属性</div>`}</div>
                        <div class="kv-list">
                            <div>
                                <strong>房间标签</strong>
                                <div class="pill-wrap">${renderTags(room.labelInfoList, "暂无房间标签")}</div>
                            </div>
                            <div>
                                <strong>房间配套</strong>
                                <div class="pill-wrap">${renderTags(room.facilityInfoList, "暂无房间配套")}</div>
                            </div>
                            <div>
                                <strong>支付方式</strong>
                                <div class="pill-wrap">${paymentTags}</div>
                            </div>
                            <div>
                                <strong>租期选择</strong>
                                <div class="pill-wrap">${termTags}</div>
                            </div>
                            <div>
                                <strong>杂费说明</strong>
                                <div class="pill-wrap">${feeTags}</div>
                            </div>
                        </div>
                    ` : `<div class="empty-state">当前公寓暂无房间，请返回左侧查看其他公寓。</div>`}
                </section>

                <section class="detail-block">
                    <h3>预约看房</h3>
                    <p class="soft-note">${state.token ? "已登录后可以直接提交预约。" : "请先登录再提交预约，浏览不受影响。"}</p>
                    <form id="appointmentForm" class="appointment-form" data-apartment-id="${escapeHtml(apartment.id)}">
                        <label>
                            <span>联系人</span>
                            <input name="name" type="text" value="${escapeHtml(state.token ? $("#profileName").textContent : "租客同学")}" required>
                        </label>
                        <label>
                            <span>手机号</span>
                            <input name="phone" type="text" value="${escapeHtml(state.phone || "")}" placeholder="填写手机号" required>
                        </label>
                        <label>
                            <span>预约时间</span>
                            <input name="appointmentTime" type="datetime-local" value="${escapeHtml(defaultAppointmentTime)}" required>
                        </label>
                        <label>
                            <span>备注</span>
                            <textarea name="additionalInfo" placeholder="例如：希望周末上午看房，或备注当前关注的房间号">${escapeHtml(room ? `关注房间：${room.roomNumber}` : "")}</textarea>
                        </label>
                        <button class="primary-btn" type="submit" ${canSubmit ? "" : "disabled"}>${canSubmit ? "提交预约" : "当前无房间可预约"}</button>
                    </form>
                </section>
            </div>

            <div class="gallery-stack">
                <div class="notice-box">
                    <strong>同步说明</strong>
                    <p>${escapeHtml(state.browseDemo ? normalizeReason(state.browseReason) : "这里展示的是用户端对已发布公寓和房间的实时浏览结果，后台 CRUD 变更后刷新即可看到最新数据。")}</p>
                </div>
                <div class="gallery-grid">${gallery || `<div class="muted-text">暂无图片</div>`}</div>
            </div>
        `;

        const form = $("#appointmentForm");
        if (form) {
            form.addEventListener("submit", submitAppointment);
        }
    }

    function renderNeedLogin(container, text) {
        container.innerHTML = `<div class="empty-state">${escapeHtml(text)}</div>`;
    }

    function renderAppointments(items) {
        const container = $("#appointmentList");
        if (!items.length) {
            container.innerHTML = `<div class="empty-state">当前没有预约记录。</div>`;
            return;
        }

        container.innerHTML = items.map((item) => `
            <article class="stack-item">
                <p class="eyebrow">看房预约</p>
                <h3>${escapeHtml(item.apartmentName || "未命名公寓")}</h3>
                <p>预约时间：${escapeHtml(formatDate(item.appointmentTime))}</p>
                <div class="toolbar">
                    ${makeStatus(statusMaps.appointment, item.appointmentStatus)}
                </div>
            </article>
        `).join("");
    }

    function renderAgreements(items) {
        const container = $("#agreementList");
        if (!items.length) {
            container.innerHTML = `<div class="empty-state">当前没有租约记录。</div>`;
            return;
        }

        container.innerHTML = items.map((item) => `
            <article class="stack-item">
                <p class="eyebrow">租约信息</p>
                <h3>${escapeHtml(item.apartmentName || "未命名公寓")} · ${escapeHtml(item.roomNumber || "房间未命名")}</h3>
                <p>租期：${escapeHtml(formatDate(item.leaseStartDate, "date"))} 至 ${escapeHtml(formatDate(item.leaseEndDate, "date"))}</p>
                <div class="toolbar">
                    <span class="count-chip">${escapeHtml(formatMoney(item.rent))}</span>
                    ${makeStatus(statusMaps.agreement, item.leaseStatus)}
                </div>
            </article>
        `).join("");
    }

    function renderHistory(items) {
        const container = $("#historyList");
        if (!items.length) {
            container.innerHTML = `<div class="empty-state">当前没有浏览历史。</div>`;
            return;
        }

        container.innerHTML = items.map((item) => `
            <article class="stack-item">
                <p class="eyebrow">浏览记录</p>
                <h3>${escapeHtml(item.apartmentName || "未命名公寓")} · ${escapeHtml(item.roomNumber || "未命名房间")}</h3>
                <p>${escapeHtml([item.provinceName, item.cityName, item.districtName].filter(Boolean).join(" / ") || "暂无区域信息")}</p>
                <div class="toolbar">
                    <span class="count-chip">${escapeHtml(formatMoney(item.rent))}</span>
                </div>
            </article>
        `).join("");
    }

    async function submitAppointment(event) {
        event.preventDefault();

        if (!state.token) {
            setLoginMessage("请先登录，再提交预约看房。");
            showPage("discover");
            return;
        }

        const apartmentId = Number(event.currentTarget.dataset.apartmentId || 0);
        const formData = new FormData(event.currentTarget);
        const payload = {
            apartmentId,
            name: (formData.get("name") || "").toString().trim() || $("#profileName").textContent.trim(),
            phone: (formData.get("phone") || "").toString().trim() || state.phone,
            appointmentTime: toApiDateTime((formData.get("appointmentTime") || "").toString()),
            additionalInfo: (formData.get("additionalInfo") || "").toString().trim()
        };

        if (!payload.phone) {
            setLoginMessage("请填写手机号后再提交预约。");
            return;
        }

        if (!payload.appointmentTime) {
            setLoginMessage("请选择预约时间。");
            return;
        }

        if (state.token === DEMO_TOKEN || state.userDemo) {
            mock.appointments.unshift({
                id: Date.now(),
                apartmentName: state.apartments.detail?.name || "演示公寓",
                appointmentTime: payload.appointmentTime,
                appointmentStatus: 1
            });
            setLoginMessage("当前处于演示模式，预约已写入前端演示数据。");
            await loadAppointments();
            showPage("appointments");
            return;
        }

        try {
            await request("/app/appointment/saveOrUpdate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }, true);
            setLoginMessage("预约提交成功，已同步到后端数据库。");
            await loadAppointments();
            showPage("appointments");
        } catch (error) {
            setLoginMessage(`预约提交失败：${normalizeReason(error.message)}`);
        }
    }

    async function loadProfile() {
        if (!state.token) {
            state.userDemo = false;
            state.userReason = "";
            setProfile("游客模式", "未登录也可以浏览公寓与房间，登录后可预约看房并查看个人记录");
            setLoginMessage("演示环境默认验证码为 123456，登录后会读取真实个人接口。");
            return;
        }

        if (state.token === DEMO_TOKEN) {
            state.userDemo = true;
            setProfile("演示租客", state.phone ? `当前手机号：${state.phone}` : "登录接口不可用时，会自动切换到演示个人数据。");
            setLoginMessage("当前处于演示登录模式，个人数据使用前端演示数据。");
            return;
        }

        try {
            const data = await request("/app/info", {}, true);
            state.userDemo = false;
            state.userReason = "";
            setProfile(data.nickname || "已登录用户", "当前个人区域读取真实后端接口。");
            setLoginMessage("登录成功，个人数据已与后端同步。");
        } catch (error) {
            if (/HTTP\s+401/i.test(error.message)) {
                state.token = "";
                state.phone = "";
                persistSession();
                setProfile("游客模式", "登录状态已过期，请重新登录。");
                setLoginMessage("登录状态已过期，请重新登录。");
                return;
            }
            state.userDemo = true;
            state.userReason = error.message;
            setProfile("演示租客", state.phone ? `当前手机号：${state.phone}` : "个人接口暂时不可用");
            setLoginMessage(`个人接口不可用，已切换为演示数据。${normalizeReason(error.message)}`);
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const phone = (formData.get("phone") || "").toString().trim();
        const code = (formData.get("code") || "").toString().trim();

        if (!phone || !code) {
            setLoginMessage("请填写手机号和验证码。");
            return;
        }

        state.phone = phone;

        try {
            const token = await request("/app/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ phone, code })
            });
            state.token = token;
            state.userDemo = false;
            state.userReason = "";
            persistSession();
            await loadProfile();
            await loadPersonalData();
        } catch (error) {
            if (error.networkError || /HTTP\s+5/i.test(error.message)) {
                state.token = DEMO_TOKEN;
                state.userDemo = true;
                state.userReason = error.message;
                persistSession();
                await loadProfile();
                await loadPersonalData();
                return;
            }
            setLoginMessage(`登录失败：${normalizeReason(error.message)}`);
        }
    }

    async function logout() {
        state.token = "";
        state.phone = "";
        state.userDemo = false;
        state.userReason = "";
        persistSession();
        await loadProfile();
        await loadPersonalData();
    }

    async function loadAppointments() {
        const container = $("#appointmentList");
        if (!state.token) {
            renderNeedLogin(container, "登录后可以查看预约记录。");
            return;
        }

        if (state.token === DEMO_TOKEN || state.userDemo) {
            renderAppointments(clone(mock.appointments));
            return;
        }

        try {
            const data = await request("/app/appointment/listItem", {}, true);
            renderAppointments(data || []);
        } catch (error) {
            renderAppointments(clone(mock.appointments));
            setLoginMessage(`预约记录接口不可用，已展示演示数据。${normalizeReason(error.message)}`);
        }
    }

    async function loadAgreements() {
        const container = $("#agreementList");
        if (!state.token) {
            renderNeedLogin(container, "登录后可以查看租约信息。");
            return;
        }

        if (state.token === DEMO_TOKEN || state.userDemo) {
            renderAgreements(clone(mock.agreements));
            return;
        }

        try {
            const data = await request("/app/agreement/listItem", {}, true);
            renderAgreements(data || []);
        } catch (error) {
            renderAgreements(clone(mock.agreements));
            setLoginMessage(`租约接口不可用，已展示演示数据。${normalizeReason(error.message)}`);
        }
    }

    async function loadHistory() {
        const container = $("#historyList");
        if (!state.token) {
            renderNeedLogin(container, "登录后查看过房间详情，浏览历史会自动记录在这里。");
            return;
        }

        if (state.token === DEMO_TOKEN || state.userDemo) {
            renderHistory(clone(mock.history));
            return;
        }

        try {
            const data = await request("/app/history/pageItem?current=1&size=20", {}, true);
            renderHistory(data.records || []);
        } catch (error) {
            renderHistory(clone(mock.history));
            setLoginMessage(`浏览历史接口不可用，已展示演示数据。${normalizeReason(error.message)}`);
        }
    }

    async function loadPersonalData() {
        await Promise.all([loadAppointments(), loadAgreements(), loadHistory()]);
    }

    function showPage(page) {
        state.currentPage = page;
        $$(".nav-btn").forEach((button) => {
            button.classList.toggle("is-active", button.dataset.page === page);
        });
        $$(".page").forEach((section) => {
            section.classList.toggle("is-active", section.id === `${page}Page`);
        });
    }

    function bindNav() {
        $$(".nav-btn").forEach((button) => {
            button.addEventListener("click", async () => {
                const page = button.dataset.page;
                showPage(page);
                if (page === "appointments") await loadAppointments();
                if (page === "agreements") await loadAgreements();
                if (page === "history") await loadHistory();
            });
        });
    }

    function bindFilters() {
        $("#provinceFilter").addEventListener("change", async (event) => {
            state.filters.provinceId = event.target.value;
            state.filters.cityId = "";
            state.filters.districtId = "";
            await syncRegionFilters();
        });

        $("#cityFilter").addEventListener("change", async (event) => {
            state.filters.cityId = event.target.value;
            state.filters.districtId = "";
            await syncRegionFilters();
        });

        $("#districtFilter").addEventListener("change", (event) => {
            state.filters.districtId = event.target.value;
        });

        $("#discoverFilterForm").addEventListener("submit", async (event) => {
            event.preventDefault();
            const formData = new FormData(event.currentTarget);
            state.filters.provinceId = (formData.get("provinceId") || "").toString();
            state.filters.cityId = (formData.get("cityId") || "").toString();
            state.filters.districtId = (formData.get("districtId") || "").toString();
            state.filters.minRent = (formData.get("minRent") || "").toString();
            state.filters.maxRent = (formData.get("maxRent") || "").toString();
            state.filters.orderType = (formData.get("orderType") || "").toString();
            await syncRegionFilters();
            await loadApartments();
        });

        $("#resetFiltersBtn").addEventListener("click", async () => {
            state.filters = {
                provinceId: "",
                cityId: "",
                districtId: "",
                minRent: "",
                maxRent: "",
                orderType: ""
            };
            $("#discoverFilterForm").reset();
            await syncRegionFilters();
            await loadApartments();
        });
    }

    function bindLists() {
        $("#apartmentList").addEventListener("click", async (event) => {
            const card = event.target.closest("[data-id]");
            if (!card) return;
            await showApartment(card.dataset.id);
        });

        $("#roomList").addEventListener("click", async (event) => {
            const card = event.target.closest("[data-id]");
            if (!card) return;
            await showRoom(card.dataset.id);
        });
    }

    function bindAccount() {
        $("#loginForm").addEventListener("submit", handleLogin);
        $("#logoutBtn").addEventListener("click", logout);
    }

    function bindActions() {
        $("#refreshBtn").addEventListener("click", refreshAll);
    }

    async function refreshAll() {
        await loadProvinceRefs();
        await syncRegionFilters();
        await loadApartments();
        await loadProfile();
        await loadPersonalData();
    }

    async function init() {
        bindNav();
        bindFilters();
        bindLists();
        bindAccount();
        bindActions();
        showPage("discover");
        await refreshAll();
    }

    init().catch((error) => {
        console.error(error);
        setBrowseMode(false, error.message);
        renderApartmentList();
        renderRoomList();
        renderDetail();
    });
})();
