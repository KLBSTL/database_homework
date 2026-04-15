(() => {
    const STORAGE_KEY = "lease_admin_token";
    const DEMO_TOKEN = "FRONTEND_DEMO_ADMIN";

    const state = {
        token: localStorage.getItem(STORAGE_KEY) || "",
        captchaKey: "",
        currentPage: "summary",
        demoData: false,
        demoReason: "",
        refs: {
            provinces: [],
            apartmentFacilities: [],
            roomFacilities: [],
            apartmentLabels: [],
            roomLabels: [],
            feeGroups: [],
            attrGroups: [],
            paymentTypes: [],
            leaseTerms: [],
            posts: []
        },
        caches: {
            citiesByProvince: {},
            districtsByCity: {}
        }
    };

    const enums = {
        release: {
            1: ["已发布", "ok"],
            0: ["未发布", "warn"]
        },
        userStatus: {
            1: ["启用", "ok"],
            0: ["停用", "danger"]
        },
        userTypeLabel: {
            ADMIN: "管理员",
            COMMON: "普通员工",
            0: "管理员",
            1: "普通员工"
        },
        userTypeValue: {
            0: "ADMIN",
            1: "COMMON"
        },
        userStatusValue: {
            1: "ENABLE",
            0: "DISABLE"
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
            },
            apartmentFacilities: [
                { id: 1, name: "前台接待" },
                { id: 2, name: "公共休息区" },
                { id: 3, name: "监控门禁" }
            ],
            roomFacilities: [
                { id: 11, name: "独立卫浴" },
                { id: 12, name: "空调" },
                { id: 13, name: "洗衣机" },
                { id: 14, name: "冰箱" }
            ],
            apartmentLabels: [
                { id: 21, name: "近地铁" },
                { id: 22, name: "拎包入住" },
                { id: 23, name: "安静社区" }
            ],
            roomLabels: [
                { id: 31, name: "朝南" },
                { id: 32, name: "采光好" },
                { id: 33, name: "精装修" }
            ],
            feeGroups: [
                {
                    id: 41,
                    name: "基础费用",
                    feeValueList: [
                        { id: 411, feeKeyId: 41, name: "物业费", unit: "元/月" },
                        { id: 412, feeKeyId: 41, name: "保洁费", unit: "元/月" }
                    ]
                },
                {
                    id: 42,
                    name: "能源费用",
                    feeValueList: [
                        { id: 421, feeKeyId: 42, name: "水费", unit: "元/吨" },
                        { id: 422, feeKeyId: 42, name: "电费", unit: "元/度" }
                    ]
                }
            ],
            attrGroups: [
                {
                    id: 51,
                    name: "户型",
                    attrValueList: [
                        { id: 511, attrKeyId: 51, name: "一室一厅" },
                        { id: 512, attrKeyId: 51, name: "两室一厅" }
                    ]
                },
                {
                    id: 52,
                    name: "面积",
                    attrValueList: [
                        { id: 521, attrKeyId: 52, name: "28㎡" },
                        { id: 522, attrKeyId: 52, name: "35㎡" },
                        { id: 523, attrKeyId: 52, name: "42㎡" }
                    ]
                }
            ],
            paymentTypes: [
                { id: 61, name: "押一付一", payMonthCount: "1", additionalInfo: "每月支付一次租金" },
                { id: 62, name: "押一付三", payMonthCount: "3", additionalInfo: "每三个月支付一次租金" }
            ],
            leaseTerms: [
                { id: 71, monthCount: 6, unit: "月" },
                { id: 72, monthCount: 12, unit: "月" },
                { id: 73, monthCount: 18, unit: "月" }
            ],
            posts: [
                { id: 81, name: "运营管理员" },
                { id: 82, name: "财务管理员" }
            ]
        },
        apartments: [
            {
                id: 101,
                name: "望京创寓 A 座",
                introduction: "主打白领合租与整租，步行可达地铁站。",
                provinceId: 11,
                provinceName: "北京市",
                cityId: 1101,
                cityName: "北京市",
                districtId: 110105,
                districtName: "朝阳区",
                addressDetail: "阜通东大街 88 号",
                latitude: "39.9912",
                longitude: "116.4863",
                phone: "010-88886666",
                isRelease: 1,
                facilityInfoIds: [1, 2, 3],
                labelIds: [21, 22],
                feeValueIds: [411, 421, 422],
                graphVoList: [
                    { name: "外景", url: "https://picsum.photos/seed/mock-apartment-1/800/420" },
                    { name: "大厅", url: "https://picsum.photos/seed/mock-apartment-2/800/420" }
                ]
            },
            {
                id: 102,
                name: "徐汇青年社区",
                introduction: "适合应届毕业生和通勤租客，配套完善。",
                provinceId: 31,
                provinceName: "上海市",
                cityId: 3101,
                cityName: "上海市",
                districtId: 310104,
                districtName: "徐汇区",
                addressDetail: "漕溪北路 66 号",
                latitude: "31.1981",
                longitude: "121.4358",
                phone: "021-66668888",
                isRelease: 0,
                facilityInfoIds: [1, 3],
                labelIds: [22, 23],
                feeValueIds: [411, 412],
                graphVoList: [
                    { name: "社区外观", url: "https://picsum.photos/seed/mock-apartment-3/800/420" }
                ]
            }
        ],
        rooms: [
            {
                id: 201,
                roomNumber: "A-101",
                rent: 3200,
                apartmentId: 101,
                isRelease: 1,
                isCheckIn: true,
                attrValueIds: [511, 522],
                facilityInfoIds: [11, 12, 13],
                labelInfoIds: [31, 33],
                paymentTypeIds: [61],
                leaseTermIds: [72],
                graphVoList: [
                    { name: "房间一", url: "https://picsum.photos/seed/mock-room-1/800/420" }
                ]
            },
            {
                id: 202,
                roomNumber: "A-203",
                rent: 3600,
                apartmentId: 101,
                isRelease: 1,
                isCheckIn: false,
                attrValueIds: [511, 523],
                facilityInfoIds: [11, 12, 13, 14],
                labelInfoIds: [31, 32, 33],
                paymentTypeIds: [61, 62],
                leaseTermIds: [71, 72],
                graphVoList: [
                    { name: "房间二", url: "https://picsum.photos/seed/mock-room-2/800/420" }
                ]
            },
            {
                id: 203,
                roomNumber: "B-1102",
                rent: 4100,
                apartmentId: 102,
                isRelease: 0,
                isCheckIn: false,
                attrValueIds: [512, 523],
                facilityInfoIds: [11, 12, 14],
                labelInfoIds: [32],
                paymentTypeIds: [62],
                leaseTermIds: [72, 73],
                graphVoList: [
                    { name: "房间三", url: "https://picsum.photos/seed/mock-room-3/800/420" }
                ]
            }
        ],
        systemUsers: [
            {
                id: 301,
                username: "admin",
                name: "系统管理员",
                type: "ADMIN",
                phone: "18888888888",
                avatarUrl: "",
                additionalInfo: "系统默认账号，用于课程演示。",
                postId: 81,
                status: "ENABLE"
            },
            {
                id: 302,
                username: "finance01",
                name: "财务老师",
                type: "COMMON",
                phone: "17777777777",
                avatarUrl: "",
                additionalInfo: "负责月度账单复核。",
                postId: 82,
                status: "ENABLE"
            }
        ]
    };

    const $ = (selector, root = document) => root.querySelector(selector);
    const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

    const clone = (value) => JSON.parse(JSON.stringify(value));

    const escapeHtml = (value) => {
        const text = value == null ? "" : String(value);
        return text
            .replaceAll("&", "&amp;")
            .replaceAll("<", "&lt;")
            .replaceAll(">", "&gt;")
            .replaceAll("\"", "&quot;")
            .replaceAll("'", "&#39;");
    };

    const fmtNumber = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        return new Intl.NumberFormat("zh-CN").format(Number(value));
    };

    const fmtMoney = (value) => {
        if (value === null || value === undefined || value === "") return "-";
        return `¥ ${fmtNumber(value)}`;
    };

    const statusPill = (pair) => {
        const [text, tone] = pair || ["未知", "warn"];
        return `<span class="status-pill ${tone}">${escapeHtml(text)}</span>`;
    };

    const toQueryString = (params) => {
        const search = new URLSearchParams();
        Object.entries(params || {}).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                search.append(key, value);
            }
        });
        return search.toString();
    };

    function setLoginVisible(visible) {
        const overlay = $("#loginOverlay");
        if (!overlay) return;
        overlay.classList.toggle("is-hidden", !visible);
    }

    function normalizeReason(reason) {
        if (!reason) return "接口暂不可用，已切换到演示模式。";
        if (reason === "Failed to fetch") return "无法连接到后端服务，已切换到演示模式。";
        if (/HTTP\s+401/i.test(reason)) return "登录状态已失效，请重新登录。";
        if (/HTTP\s+5\d{2}/i.test(reason)) return "后端服务暂时异常，已切换到演示模式。";
        return String(reason);
    }

    function shouldFallback(error) {
        if (!error) return false;
        if (error.businessError) return false;
        if (error.httpStatus && error.httpStatus < 500 && error.httpStatus !== 404) return false;
        return true;
    }

    function enableDemo(reason, persistToken = false) {
        state.demoData = true;
        state.demoReason = normalizeReason(reason);
        if (persistToken) {
            state.token = DEMO_TOKEN;
            localStorage.setItem(STORAGE_KEY, DEMO_TOKEN);
        }
    }

    function disableDemo() {
        state.demoData = false;
        state.demoReason = "";
    }

    function isDemoMode() {
        return state.demoData || state.token === DEMO_TOKEN;
    }

    function pickSettledValue(results, index, mockValue) {
        const item = results[index];
        if (item && item.status === "fulfilled") {
            const value = Array.isArray(item.value) ? item.value : [];
            if (value.length > 0) {
                return value;
            }
        }
        return clone(mockValue || []);
    }

    function getMockCities(provinceId) {
        return clone(mock.refs.citiesByProvince[provinceId] || []);
    }

    function getMockDistricts(cityId) {
        return clone(mock.refs.districtsByCity[cityId] || []);
    }

    function computeMockSummary() {
        const apartmentCount = mock.apartments.length;
        const releasedApartmentCount = mock.apartments.filter((item) => Number(item.isRelease) === 1).length;
        const roomCount = mock.rooms.length;
        const releasedRoomCount = mock.rooms.filter((item) => Number(item.isRelease) === 1).length;
        const activeAgreementCount = mock.rooms.filter((item) => item.isCheckIn).length;
        const enabledUserCount = mock.systemUsers.filter((item) => (item.status || "DISABLE") === "ENABLE").length;
        const estimatedMonthlyRent = mock.rooms
            .filter((item) => item.isCheckIn)
            .reduce((sum, item) => sum + Number(item.rent || 0), 0);

        return {
            apartmentCount,
            releasedApartmentCount,
            roomCount,
            releasedRoomCount,
            userCount: mock.systemUsers.length,
            enabledUserCount,
            agreementCount: activeAgreementCount,
            activeAgreementCount,
            appointmentCount: 6,
            waitingAppointmentCount: 2,
            estimatedMonthlyRent,
            occupancyRate: roomCount ? Math.round((activeAgreementCount * 100) / roomCount) : 0
        };
    }

    async function request(url, options = {}, withAuth = true) {
        const headers = { ...(options.headers || {}) };
        if (withAuth && state.token && state.token !== DEMO_TOKEN) {
            headers["access-token"] = state.token;
        }

        let response;
        try {
            response = await fetch(url, { ...options, headers });
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
            wrapped.resultCode = result.code;
            throw wrapped;
        }

        return result.data;
    }

    function setProfile(name, meta) {
        $("#profileName").textContent = name || "未登录";
        $("#profileMeta").textContent = meta || "等待身份校验";
    }

    async function loadCaptcha() {
        try {
            const data = await request("/admin/login/captcha", {}, false);
            state.captchaKey = data.key || "";
            if (data.image) {
                $("#captchaImage").innerHTML = `<img src="${data.image}" alt="验证码">`;
            } else {
                $("#captchaImage").textContent = "当前环境未返回验证码图片，可直接尝试登录。";
            }
        } catch (error) {
            state.captchaKey = "";
            $("#captchaImage").textContent = "演示模式下可直接登录。";
        }
    }

    async function handleLogin(event) {
        event.preventDefault();
        const messageNode = $("#loginMessage");
        const payload = Object.fromEntries(new FormData(event.currentTarget).entries());
        payload.captchaKey = state.captchaKey;
        messageNode.textContent = "正在登录，请稍候...";

        try {
            const token = await request("/admin/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            }, false);

            state.token = token;
            localStorage.setItem(STORAGE_KEY, token);
            disableDemo();
            setLoginVisible(false);
            messageNode.textContent = "";
            await bootstrap();
        } catch (error) {
            if (payload.username === "admin" && payload.password === "123456") {
                enableDemo(error.message, true);
                setLoginVisible(false);
                messageNode.textContent = "";
                await bootstrap();
                return;
            }

            messageNode.textContent = normalizeReason(error.message) || "登录失败";
            await loadCaptcha();
        }
    }

    async function loadProfile() {
        if (isDemoMode()) {
            setProfile("演示账号", state.demoReason || "当前使用本地演示数据。");
            return;
        }

        const data = await request("/admin/info");
        const typeLabel = enums.userTypeLabel[data.type] || "后台账号";
        setProfile(data.name || "后台账号", `当前身份：${typeLabel}`);
    }

    async function loadCommonRefs() {
        if (isDemoMode()) {
            state.refs.provinces = clone(mock.refs.provinces);
            state.refs.apartmentFacilities = clone(mock.refs.apartmentFacilities);
            state.refs.roomFacilities = clone(mock.refs.roomFacilities);
            state.refs.apartmentLabels = clone(mock.refs.apartmentLabels);
            state.refs.roomLabels = clone(mock.refs.roomLabels);
            state.refs.feeGroups = clone(mock.refs.feeGroups);
            state.refs.attrGroups = clone(mock.refs.attrGroups);
            state.refs.paymentTypes = clone(mock.refs.paymentTypes);
            state.refs.leaseTerms = clone(mock.refs.leaseTerms);
            state.refs.posts = clone(mock.refs.posts);
            return;
        }

        const results = await Promise.allSettled([
            request("/admin/region/province/list"),
            request("/admin/facility/list?type=APARTMENT"),
            request("/admin/facility/list?type=ROOM"),
            request("/admin/label/list?type=APARTMENT"),
            request("/admin/label/list?type=ROOM"),
            request("/admin/fee/list"),
            request("/admin/attr/list"),
            request("/admin/payment/list"),
            request("/admin/term/list"),
            request("/admin/system/post/list")
        ]);

        state.refs.provinces = pickSettledValue(results, 0, mock.refs.provinces);
        state.refs.apartmentFacilities = pickSettledValue(results, 1, mock.refs.apartmentFacilities);
        state.refs.roomFacilities = pickSettledValue(results, 2, mock.refs.roomFacilities);
        state.refs.apartmentLabels = pickSettledValue(results, 3, mock.refs.apartmentLabels);
        state.refs.roomLabels = pickSettledValue(results, 4, mock.refs.roomLabels);
        state.refs.feeGroups = pickSettledValue(results, 5, mock.refs.feeGroups);
        state.refs.attrGroups = pickSettledValue(results, 6, mock.refs.attrGroups);
        state.refs.paymentTypes = pickSettledValue(results, 7, mock.refs.paymentTypes);
        state.refs.leaseTerms = pickSettledValue(results, 8, mock.refs.leaseTerms);
        state.refs.posts = pickSettledValue(results, 9, mock.refs.posts);
    }

    async function ensureCities(provinceId) {
        if (!provinceId) return [];
        const key = String(provinceId);

        if (isDemoMode()) {
            return getMockCities(key);
        }

        if (!state.caches.citiesByProvince[key]) {
            try {
                const cities = await request(`/admin/region/city/listByProvinceId?id=${provinceId}`);
                state.caches.citiesByProvince[key] = Array.isArray(cities) && cities.length
                    ? cities
                    : getMockCities(key);
            } catch (error) {
                if (!shouldFallback(error)) throw error;
                state.caches.citiesByProvince[key] = getMockCities(key);
            }
        }

        return clone(state.caches.citiesByProvince[key] || []);
    }

    async function ensureDistricts(cityId) {
        if (!cityId) return [];
        const key = String(cityId);

        if (isDemoMode()) {
            return getMockDistricts(key);
        }

        if (!state.caches.districtsByCity[key]) {
            try {
                const districts = await request(`/admin/region/district/listByCityId?id=${cityId}`);
                state.caches.districtsByCity[key] = Array.isArray(districts) && districts.length
                    ? districts
                    : getMockDistricts(key);
            } catch (error) {
                if (!shouldFallback(error)) throw error;
                state.caches.districtsByCity[key] = getMockDistricts(key);
            }
        }

        return clone(state.caches.districtsByCity[key] || []);
    }

    function fillSelect(select, items, placeholder, selectedValue = "", config = {}) {
        if (!select) return;
        const valueGetter = config.value || ((item) => item.id);
        const labelGetter = config.label || ((item) => item.name);
        const selected = selectedValue == null ? "" : String(selectedValue);

        const options = [`<option value="">${escapeHtml(placeholder)}</option>`];
        (items || []).forEach((item) => {
            const value = String(valueGetter(item));
            const label = labelGetter(item);
            options.push(
                `<option value="${escapeHtml(value)}" ${value === selected ? "selected" : ""}>${escapeHtml(label)}</option>`
            );
        });

        select.innerHTML = options.join("");
    }

    function openDrawer({ eyebrow, title, html, onReady }) {
        $("#drawerEyebrow").textContent = eyebrow || "编辑";
        $("#drawerTitle").textContent = title || "表单";
        $("#drawerBody").innerHTML = html || "";
        $("#drawerOverlay").classList.remove("is-hidden");
        if (typeof onReady === "function") {
            onReady($("#drawerBody"));
        }
    }

    function closeDrawer() {
        $("#drawerOverlay").classList.add("is-hidden");
        $("#drawerBody").innerHTML = "";
    }

    function renderSummaryCards(data) {
        const cards = [
            ["公寓总数", fmtNumber(data.apartmentCount)],
            ["已发布公寓", fmtNumber(data.releasedApartmentCount)],
            ["房间总数", fmtNumber(data.roomCount)],
            ["已发布房间", fmtNumber(data.releasedRoomCount)],
            ["账号总数", fmtNumber(data.userCount)],
            ["启用账号", fmtNumber(data.enabledUserCount)],
            ["有效租约", fmtNumber(data.activeAgreementCount)],
            ["待处理预约", fmtNumber(data.waitingAppointmentCount)],
            ["预计月租收入", fmtMoney(data.estimatedMonthlyRent)],
            ["入住率", `${fmtNumber(data.occupancyRate)}%`]
        ];

        $("#summaryCards").innerHTML = cards.map(([label, value]) => `
            <article class="metric-card">
                <p>${escapeHtml(label)}</p>
                <strong>${escapeHtml(value)}</strong>
            </article>
        `).join("");
    }

    async function loadSummary() {
        let summary = computeMockSummary();
        let intro = "";

        if (isDemoMode()) {
            intro = `当前处于演示模式：${state.demoReason || "使用本地示例数据进行功能演示。"}`;
        } else {
            try {
                summary = await request("/admin/dashboard/summary");
                intro = "当前已接入真实后端与数据库，可直接演示公寓、房间、后台账号的查询与维护。";
            } catch (error) {
                if (!shouldFallback(error)) throw error;
                summary = computeMockSummary();
                intro = `当前已接入真实后端与数据库，统计卡片暂时使用本地汇总；${normalizeReason(error.message)}`;
            }
        }

        $("#summaryIntro").textContent = intro;
        renderSummaryCards(summary);
        return summary;
    }

    async function refreshEverything() {
        await loadSummary();
        if (window.AdminCrud && typeof window.AdminCrud.refreshCurrentPage === "function") {
            await window.AdminCrud.refreshCurrentPage();
        }
    }

    function bindPageSwitch() {
        $$(".nav-btn").forEach((button) => {
            button.addEventListener("click", async () => {
                const page = button.dataset.page;
                if (!page) return;

                $$(".nav-btn").forEach((node) => node.classList.remove("is-active"));
                $$(".page").forEach((node) => node.classList.remove("is-active"));

                button.classList.add("is-active");
                $(`#${page}Page`).classList.add("is-active");
                state.currentPage = page;

                if (window.AdminCrud && typeof window.AdminCrud.activatePage === "function") {
                    await window.AdminCrud.activatePage(page);
                }
            });
        });
    }

    function logout() {
        state.token = "";
        disableDemo();
        localStorage.removeItem(STORAGE_KEY);
        setProfile("未登录", "等待身份校验");
        setLoginVisible(true);
        closeDrawer();
        loadCaptcha();
    }

    function bindActions() {
        $("#loginForm").addEventListener("submit", handleLogin);
        $("#captchaBtn").addEventListener("click", loadCaptcha);
        $("#refreshBtn").addEventListener("click", refreshEverything);
        $("#logoutBtn").addEventListener("click", logout);
        $("#drawerCloseBtn").addEventListener("click", closeDrawer);
        $(".drawer-backdrop").addEventListener("click", closeDrawer);
    }

    async function bootstrap(forceDemo = false) {
        if (forceDemo) {
            enableDemo(state.demoReason || "已切换到演示模式。", true);
        }

        try {
            await loadProfile();
            await loadCommonRefs();
            await loadSummary();
            if (window.AdminCrud && typeof window.AdminCrud.bootstrap === "function") {
                await window.AdminCrud.bootstrap();
            }
        } catch (error) {
            if (!forceDemo && state.token === DEMO_TOKEN && shouldFallback(error)) {
                enableDemo(error.message, true);
                return bootstrap(true);
            }

            if (error && error.httpStatus !== 401) {
                $("#loginMessage").textContent = normalizeReason(error.message);
                return;
            }

            localStorage.removeItem(STORAGE_KEY);
            state.token = "";
            disableDemo();
            setLoginVisible(true);
            $("#loginMessage").textContent = normalizeReason(error.message);
            await loadCaptcha();
        }
    }

    window.AdminApp = {
        DEMO_TOKEN,
        state,
        enums,
        mock,
        $,
        $$,
        clone,
        escapeHtml,
        fmtNumber,
        fmtMoney,
        statusPill,
        toQueryString,
        normalizeReason,
        shouldFallback,
        enableDemo,
        disableDemo,
        isDemoMode,
        request,
        fillSelect,
        ensureCities,
        ensureDistricts,
        openDrawer,
        closeDrawer,
        loadCommonRefs,
        loadSummary,
        refreshEverything,
        bootstrap
    };

    window.addEventListener("load", async () => {
        bindPageSwitch();
        bindActions();
        await loadCaptcha();

        if (state.token) {
            if (state.token === DEMO_TOKEN) {
                localStorage.removeItem(STORAGE_KEY);
                state.token = "";
                disableDemo();
                setLoginVisible(true);
                $("#loginMessage").textContent = "检测到旧的演示登录信息，请重新登录真实后台账号。";
                return;
            }
            setLoginVisible(false);
            await bootstrap();
        }
    });
})();
