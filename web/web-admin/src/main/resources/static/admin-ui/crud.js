(() => {
    const App = window.AdminApp;
    if (!App) return;

    const state = {
        bootstrapped: false,
        apartments: {
            records: [],
            selectedId: null,
            detail: null,
            filters: { provinceId: "", cityId: "", districtId: "" }
        },
        rooms: {
            records: [],
            selectedId: null,
            detail: null,
            apartmentOptions: [],
            filters: { provinceId: "", cityId: "", districtId: "", apartmentId: "" }
        },
        users: {
            records: [],
            selectedId: null,
            detail: null,
            filters: { name: "", phone: "" }
        }
    };

    const $ = App.$;
    const $$ = App.$$;

    const toNullableNumber = (value) => {
        const text = value == null ? "" : String(value).trim();
        if (!text) return null;
        const number = Number(text);
        return Number.isNaN(number) ? null : number;
    };

    const releaseCode = (value) => (String(value) === "RELEASED" || Number(value) === 1 ? 1 : 0);
    const releaseStatusName = (value) => (releaseCode(value) === 1 ? "RELEASED" : "NOT_RELEASED");
    const userStatusCode = (value) => (String(value) === "ENABLE" || Number(value) === 1 ? 1 : 0);
    const userStatusName = (value) => (userStatusCode(value) === 1 ? "ENABLE" : "DISABLE");
    const userTypeName = (value) => (String(value) === "COMMON" || Number(value) === 1 ? "COMMON" : "ADMIN");

    function showError(error) {
        window.alert(App.normalizeReason(error.message || error));
    }

    function findById(list, id) {
        return (list || []).find((item) => String(item.id) === String(id));
    }

    function renderTagList(items, formatter) {
        if (!items || !items.length) return `<span class="muted-text">暂无</span>`;
        return items.map((item) => `<span class="tag-chip">${App.escapeHtml(formatter(item))}</span>`).join("");
    }

    function choiceHtml(name, items, selectedIds, labelBuilder) {
        const selected = new Set((selectedIds || []).map((item) => String(item)));
        return `
            <div class="choice-grid">
                ${(items || []).map((item) => {
                    const label = labelBuilder(item);
                    return `
                        <label class="choice-item">
                            <input type="checkbox" name="${App.escapeHtml(name)}" value="${App.escapeHtml(item.id)}" ${selected.has(String(item.id)) ? "checked" : ""}>
                            <div>
                                <strong>${App.escapeHtml(label.title)}</strong>
                                <span>${App.escapeHtml(label.meta || "勾选后会同步保存")}</span>
                            </div>
                        </label>
                    `;
                }).join("")}
            </div>
        `;
    }

    function collectCheckedNumbers(form, name) {
        return $$(`input[name="${name}"]:checked`, form).map((input) => Number(input.value));
    }

    function parseImageUrls(text) {
        return String(text || "")
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter(Boolean)
            .map((url, index) => ({ name: `图片 ${index + 1}`, url }));
    }

    function flattenFeeOptions() {
        return (App.state.refs.feeGroups || []).flatMap((group) =>
            (group.feeValueList || []).map((item) => ({ ...item, feeKeyName: group.name }))
        );
    }

    function flattenAttrOptions() {
        return (App.state.refs.attrGroups || []).flatMap((group) =>
            (group.attrValueList || []).map((item) => ({ ...item, attrKeyName: group.name }))
        );
    }

    function getApartmentStats(apartmentId) {
        const relatedRooms = App.mock.rooms.filter((item) => Number(item.apartmentId) === Number(apartmentId));
        return {
            totalRoomCount: relatedRooms.length,
            freeRoomCount: relatedRooms.filter((item) => !item.isCheckIn).length
        };
    }

    function getMockApartmentList() {
        return App.mock.apartments
            .filter((item) => !state.apartments.filters.provinceId || String(item.provinceId) === String(state.apartments.filters.provinceId))
            .filter((item) => !state.apartments.filters.cityId || String(item.cityId) === String(state.apartments.filters.cityId))
            .filter((item) => !state.apartments.filters.districtId || String(item.districtId) === String(state.apartments.filters.districtId))
            .map((item) => ({ ...App.clone(item), ...getApartmentStats(item.id) }));
    }

    function getMockApartmentDetail(id) {
        const base = App.clone(findById(App.mock.apartments, id));
        if (!base) return null;
        return {
            ...base,
            ...getApartmentStats(id),
            facilityInfoList: App.state.refs.apartmentFacilities.filter((item) => (base.facilityInfoIds || []).includes(item.id)),
            labelInfoList: App.state.refs.apartmentLabels.filter((item) => (base.labelIds || []).includes(item.id)),
            feeValueVoList: flattenFeeOptions().filter((item) => (base.feeValueIds || []).includes(item.id))
        };
    }

    function getMockApartmentOptions() {
        return App.mock.apartments
            .filter((item) => !state.rooms.filters.provinceId || String(item.provinceId) === String(state.rooms.filters.provinceId))
            .filter((item) => !state.rooms.filters.cityId || String(item.cityId) === String(state.rooms.filters.cityId))
            .filter((item) => !state.rooms.filters.districtId || String(item.districtId) === String(state.rooms.filters.districtId))
            .map((item) => App.clone(item));
    }

    function getMockRoomList() {
        return App.mock.rooms
            .filter((room) => {
                const apartment = findById(App.mock.apartments, room.apartmentId);
                if (!apartment) return false;
                if (state.rooms.filters.provinceId && String(apartment.provinceId) !== String(state.rooms.filters.provinceId)) return false;
                if (state.rooms.filters.cityId && String(apartment.cityId) !== String(state.rooms.filters.cityId)) return false;
                if (state.rooms.filters.districtId && String(apartment.districtId) !== String(state.rooms.filters.districtId)) return false;
                if (state.rooms.filters.apartmentId && String(room.apartmentId) !== String(state.rooms.filters.apartmentId)) return false;
                return true;
            })
            .map((room) => ({ ...App.clone(room), apartmentInfo: App.clone(findById(App.mock.apartments, room.apartmentId)) }));
    }

    function getMockRoomDetail(id) {
        const room = App.clone(findById(App.mock.rooms, id));
        if (!room) return null;
        return {
            ...room,
            apartmentInfo: App.clone(findById(App.mock.apartments, room.apartmentId)),
            attrValueVoList: flattenAttrOptions().filter((item) => (room.attrValueIds || []).includes(item.id)),
            facilityInfoList: App.state.refs.roomFacilities.filter((item) => (room.facilityInfoIds || []).includes(item.id)),
            labelInfoList: App.state.refs.roomLabels.filter((item) => (room.labelInfoIds || []).includes(item.id)),
            paymentTypeList: App.state.refs.paymentTypes.filter((item) => (room.paymentTypeIds || []).includes(item.id)),
            leaseTermList: App.state.refs.leaseTerms.filter((item) => (room.leaseTermIds || []).includes(item.id))
        };
    }

    function getMockUserList() {
        return App.mock.systemUsers
            .filter((item) => !state.users.filters.name || String(item.name || "").includes(state.users.filters.name))
            .filter((item) => !state.users.filters.phone || String(item.phone || "").includes(state.users.filters.phone))
            .map((item) => ({ ...App.clone(item), postName: findById(App.state.refs.posts, item.postId)?.name || "未设置岗位" }));
    }

    function getMockUserDetail(id) {
        const user = App.clone(findById(App.mock.systemUsers, id));
        if (!user) return null;
        user.postName = findById(App.state.refs.posts, user.postId)?.name || "未设置岗位";
        return user;
    }

    function nextMockId(list) {
        return Math.max(0, ...(list || []).map((item) => Number(item.id || 0))) + 1;
    }

    async function resolveData(realAction, mockAction) {
        if (App.isDemoMode()) return mockAction();
        return await realAction();
    }

    async function syncApartmentFilterSelects() {
        App.fillSelect($("#apartmentProvinceFilter"), App.state.refs.provinces, "按省份筛选", state.apartments.filters.provinceId);
        const cities = state.apartments.filters.provinceId ? await App.ensureCities(state.apartments.filters.provinceId) : [];
        App.fillSelect($("#apartmentCityFilter"), cities, "按城市筛选", state.apartments.filters.cityId);
        const districts = state.apartments.filters.cityId ? await App.ensureDistricts(state.apartments.filters.cityId) : [];
        App.fillSelect($("#apartmentDistrictFilter"), districts, "按区域筛选", state.apartments.filters.districtId);
    }

    async function loadRoomApartmentOptions() {
        const options = await resolveData(
            async () => {
                if (state.rooms.filters.districtId) {
                    return await App.request(`/admin/apartment/listInfoByDistrictId?id=${state.rooms.filters.districtId}`);
                }
                const query = App.toQueryString({ current: 1, size: 100, provinceId: state.rooms.filters.provinceId, cityId: state.rooms.filters.cityId, districtId: state.rooms.filters.districtId });
                const data = await App.request(`/admin/apartment/pageItem?${query}`);
                return data.records || [];
            },
            async () => getMockApartmentOptions()
        );
        state.rooms.apartmentOptions = options || [];
        App.fillSelect($("#roomApartmentFilter"), state.rooms.apartmentOptions, "按公寓筛选", state.rooms.filters.apartmentId);
    }

    async function syncRoomFilterSelects() {
        App.fillSelect($("#roomProvinceFilter"), App.state.refs.provinces, "按省份筛选", state.rooms.filters.provinceId);
        const cities = state.rooms.filters.provinceId ? await App.ensureCities(state.rooms.filters.provinceId) : [];
        App.fillSelect($("#roomCityFilter"), cities, "按城市筛选", state.rooms.filters.cityId);
        const districts = state.rooms.filters.cityId ? await App.ensureDistricts(state.rooms.filters.cityId) : [];
        App.fillSelect($("#roomDistrictFilter"), districts, "按区域筛选", state.rooms.filters.districtId);
        await loadRoomApartmentOptions();
    }

    function renderApartmentList() {
        const container = $("#apartmentList");
        if (!state.apartments.records.length) {
            container.innerHTML = `<div class="empty-state">当前没有符合条件的公寓记录。</div>`;
            return;
        }

        container.innerHTML = state.apartments.records.map((item) => {
            const selected = String(item.id) === String(state.apartments.selectedId);
            return `
                <article class="list-card ${selected ? "is-selected" : ""}" data-id="${item.id}">
                    <div class="list-card-head">
                        <div>
                            <p class="eyebrow">公寓 #${App.escapeHtml(item.id)}</p>
                            <h3>${App.escapeHtml(item.name || "未命名公寓")}</h3>
                        </div>
                        ${App.statusPill(App.enums.release[releaseCode(item.isRelease)])}
                    </div>
                    <div class="meta-line">
                        <div class="soft-box">房间总数：${App.fmtNumber(item.totalRoomCount)}</div>
                        <div class="soft-box">空闲房间：${App.fmtNumber(item.freeRoomCount)}</div>
                        <div class="soft-box">联系电话：${App.escapeHtml(item.phone || "-")}</div>
                    </div>
                    <p class="muted-text">${App.escapeHtml([item.provinceName, item.cityName, item.districtName, item.addressDetail].filter(Boolean).join(" / ") || "暂无地址信息")}</p>
                    <div class="list-actions">
                        <button class="ghost-btn" data-action="view" data-id="${item.id}" type="button">查看详情</button>
                        <button class="ghost-btn" data-action="edit" data-id="${item.id}" type="button">编辑</button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderApartmentDetail(detail) {
        const container = $("#apartmentDetail");
        if (!detail) {
            container.innerHTML = `<div class="empty-state">选择左侧公寓查看详情，或点击上方按钮新增公寓。</div>`;
            return;
        }

        container.innerHTML = `
            <div>
                <div class="list-card-head">
                    <div>
                        <p class="eyebrow">公寓详情</p>
                        <h3>${App.escapeHtml(detail.name || "未命名公寓")}</h3>
                    </div>
                    ${App.statusPill(App.enums.release[releaseCode(detail.isRelease)])}
                </div>
                <div class="toolbar">
                    <span class="count-chip">房间总数 ${App.fmtNumber(detail.totalRoomCount)}</span>
                    <span class="count-chip">空闲 ${App.fmtNumber(detail.freeRoomCount)}</span>
                </div>
                <div class="kv-list">
                    <div class="kv-item">
                        <strong>地址</strong>
                        <p>${App.escapeHtml([detail.provinceName, detail.cityName, detail.districtName, detail.addressDetail].filter(Boolean).join(" / ") || "暂无地址")}</p>
                    </div>
                    <div class="kv-item">
                        <strong>联系电话</strong>
                        <p>${App.escapeHtml(detail.phone || "-")}</p>
                    </div>
                    <div class="kv-item">
                        <strong>经纬度</strong>
                        <p>${App.escapeHtml(detail.latitude || "-")} / ${App.escapeHtml(detail.longitude || "-")}</p>
                    </div>
                    <div class="kv-item">
                        <strong>简介</strong>
                        <p>${App.escapeHtml(detail.introduction || "暂无简介")}</p>
                    </div>
                </div>
                <div class="detail-grid">
                    <section class="detail-section">
                        <h4>公寓标签</h4>
                        <div class="pill-wrap">${renderTagList(detail.labelInfoList, (item) => item.name)}</div>
                    </section>
                    <section class="detail-section">
                        <h4>公寓配套</h4>
                        <div class="pill-wrap">${renderTagList(detail.facilityInfoList, (item) => item.name)}</div>
                    </section>
                    <section class="detail-section">
                        <h4>费用方案</h4>
                        <div class="pill-wrap">${renderTagList(detail.feeValueVoList, (item) => `${item.feeKeyName || "费用"}：${item.name}${item.unit ? ` (${item.unit})` : ""}`)}</div>
                    </section>
                </div>
                <section class="detail-section" style="margin-top: 18px;">
                    <h4>图片资料</h4>
                    ${(detail.graphVoList || []).length ? `
                        <div class="gallery-grid">
                            ${(detail.graphVoList || []).map((item) => `
                                <div class="gallery-card">
                                    <img src="${item.url}" alt="${App.escapeHtml(item.name || "公寓图片")}">
                                    <p>${App.escapeHtml(item.name || item.url)}</p>
                                </div>
                            `).join("")}
                        </div>
                    ` : `<p class="muted-text">暂无图片资料</p>`}
                </section>
                <div class="toolbar">
                    <button class="primary-btn" data-action="edit" data-id="${detail.id}" type="button">编辑公寓</button>
                    <button class="ghost-btn" data-action="toggle" data-id="${detail.id}" data-status="${releaseStatusName(detail.isRelease) === "RELEASED" ? "NOT_RELEASED" : "RELEASED"}" type="button">${releaseStatusName(detail.isRelease) === "RELEASED" ? "下架公寓" : "发布公寓"}</button>
                    <button class="danger-btn" data-action="delete" data-id="${detail.id}" type="button">删除公寓</button>
                </div>
            </div>
        `;
    }

    async function fetchApartmentList() {
        const query = App.toQueryString({ current: 1, size: 50, provinceId: state.apartments.filters.provinceId, cityId: state.apartments.filters.cityId, districtId: state.apartments.filters.districtId });
        const data = await App.request(`/admin/apartment/pageItem?${query}`);
        return data.records || [];
    }

    async function loadApartments(preferredId = state.apartments.selectedId) {
        state.apartments.records = await resolveData(fetchApartmentList, async () => getMockApartmentList());
        renderApartmentList();
        if (!state.apartments.records.length) {
            state.apartments.selectedId = null;
            state.apartments.detail = null;
            renderApartmentDetail(null);
            return;
        }
        const nextId = state.apartments.records.some((item) => String(item.id) === String(preferredId)) ? preferredId : state.apartments.records[0].id;
        await showApartment(nextId);
    }

    async function showApartment(id) {
        state.apartments.selectedId = id;
        renderApartmentList();
        state.apartments.detail = await resolveData(
            async () => App.request(`/admin/apartment/getDetailById?id=${id}`),
            async () => getMockApartmentDetail(id)
        );
        renderApartmentDetail(state.apartments.detail);
    }

    function saveMockApartment(payload) {
        if (payload.id) {
            const target = findById(App.mock.apartments, payload.id);
            if (target) Object.assign(target, payload);
            return payload.id;
        }
        const nextIdValue = nextMockId(App.mock.apartments);
        App.mock.apartments.unshift({ ...payload, id: nextIdValue, isRelease: 0 });
        return nextIdValue;
    }

    function deleteMockApartment(id) {
        if (App.mock.rooms.some((item) => Number(item.apartmentId) === Number(id))) {
            throw new Error("当前公寓下仍有关联房间，不能直接删除。");
        }
        const next = App.mock.apartments.filter((item) => Number(item.id) !== Number(id));
        App.mock.apartments.length = 0;
        App.mock.apartments.push(...next);
    }

    function toggleMockApartment(id, status) {
        const target = findById(App.mock.apartments, id);
        if (target) target.isRelease = status === "RELEASED" ? 1 : 0;
    }

    async function saveApartment(payload) {
        if (App.isDemoMode()) return saveMockApartment(payload);
        await App.request("/admin/apartment/saveOrUpdate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return payload.id || null;
    }

    async function removeApartment(id) {
        if (App.isDemoMode()) {
            deleteMockApartment(id);
            return;
        }
        await App.request(`/admin/apartment/removeById?id=${id}`, { method: "DELETE" });
    }

    async function updateApartmentStatus(id, status) {
        if (App.isDemoMode()) {
            toggleMockApartment(id, status);
            return;
        }
        await App.request(`/admin/apartment/updateReleaseStatusById?id=${id}&status=${status}`, { method: "POST" });
    }

    async function openApartmentDrawer(id = null) {
        const detail = id
            ? await resolveData(async () => App.request(`/admin/apartment/getDetailById?id=${id}`), async () => getMockApartmentDetail(id))
            : { id: "", name: "", phone: "", introduction: "", provinceId: "", cityId: "", districtId: "", addressDetail: "", latitude: "", longitude: "", facilityInfoList: [], labelInfoList: [], feeValueVoList: [], graphVoList: [] };
        const feeOptions = flattenFeeOptions();

        App.openDrawer({
            eyebrow: id ? "编辑公寓" : "新增公寓",
            title: id ? `修改 ${detail.name}` : "创建公寓记录",
            html: `
                <form id="apartmentForm">
                    <div class="form-grid">
                        <input type="hidden" name="id" value="${App.escapeHtml(detail.id || "")}">
                        <label><span>公寓名称</span><input name="name" type="text" value="${App.escapeHtml(detail.name || "")}" required></label>
                        <label><span>联系电话</span><input name="phone" type="text" value="${App.escapeHtml(detail.phone || "")}" required></label>
                        <label><span>省份</span><select name="provinceId" required></select></label>
                        <label><span>城市</span><select name="cityId" required></select></label>
                        <label><span>区域</span><select name="districtId" required></select></label>
                        <label><span>详细地址</span><input name="addressDetail" type="text" value="${App.escapeHtml(detail.addressDetail || "")}" required></label>
                        <label><span>纬度</span><input name="latitude" type="text" value="${App.escapeHtml(detail.latitude || "")}"></label>
                        <label><span>经度</span><input name="longitude" type="text" value="${App.escapeHtml(detail.longitude || "")}"></label>
                        <label class="full"><span>公寓简介</span><textarea name="introduction">${App.escapeHtml(detail.introduction || "")}</textarea></label>
                        <label class="full"><span>图片地址</span><textarea name="imageUrls" placeholder="每行填写一个图片地址">${App.escapeHtml((detail.graphVoList || []).map((item) => item.url).join("\n"))}</textarea></label>
                    </div>
                    <div class="section-block">
                        <p class="eyebrow">公寓配套</p>
                        ${choiceHtml("facilityInfoIds", App.state.refs.apartmentFacilities, (detail.facilityInfoList || []).map((item) => item.id), (item) => ({ title: item.name, meta: "保存后会关联到该公寓" }))}
                    </div>
                    <div class="section-block">
                        <p class="eyebrow">公寓标签</p>
                        ${choiceHtml("labelIds", App.state.refs.apartmentLabels, (detail.labelInfoList || []).map((item) => item.id), (item) => ({ title: item.name, meta: "用于房源标签展示" }))}
                    </div>
                    <div class="section-block">
                        <p class="eyebrow">费用方案</p>
                        ${choiceHtml("feeValueIds", feeOptions, (detail.feeValueVoList || []).map((item) => item.id), (item) => ({ title: item.name, meta: `${item.feeKeyName || "费用"}${item.unit ? ` / ${item.unit}` : ""}` }))}
                    </div>
                    <div class="form-actions">
                        <button class="primary-btn" type="submit">保存公寓</button>
                        <button class="ghost-btn" type="button" data-action="cancel">取消</button>
                    </div>
                    <p class="form-message" data-role="form-message"></p>
                </form>
            `,
            onReady: async (root) => {
                const form = $("#apartmentForm", root);
                const provinceSelect = $('[name="provinceId"]', form);
                const citySelect = $('[name="cityId"]', form);
                const districtSelect = $('[name="districtId"]', form);
                const messageNode = $('[data-role="form-message"]', form);

                const syncRegionSelects = async () => {
                    App.fillSelect(provinceSelect, App.state.refs.provinces, "选择省份", detail.provinceId);
                    const cities = detail.provinceId ? await App.ensureCities(detail.provinceId) : [];
                    App.fillSelect(citySelect, cities, "选择城市", detail.cityId);
                    const districts = detail.cityId ? await App.ensureDistricts(detail.cityId) : [];
                    App.fillSelect(districtSelect, districts, "选择区域", detail.districtId);
                };

                await syncRegionSelects();
                provinceSelect.addEventListener("change", async () => {
                    detail.provinceId = provinceSelect.value;
                    detail.cityId = "";
                    detail.districtId = "";
                    const cities = provinceSelect.value ? await App.ensureCities(provinceSelect.value) : [];
                    App.fillSelect(citySelect, cities, "选择城市");
                    App.fillSelect(districtSelect, [], "选择区域");
                });
                citySelect.addEventListener("change", async () => {
                    detail.cityId = citySelect.value;
                    detail.districtId = "";
                    const districts = citySelect.value ? await App.ensureDistricts(citySelect.value) : [];
                    App.fillSelect(districtSelect, districts, "选择区域");
                });
                form.addEventListener("click", (event) => {
                    if (event.target.closest('[data-action="cancel"]')) App.closeDrawer();
                });
                form.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    messageNode.textContent = "正在保存公寓...";
                    try {
                        const formData = new FormData(form);
                        const provinceId = toNullableNumber(formData.get("provinceId"));
                        const cityId = toNullableNumber(formData.get("cityId"));
                        const districtId = toNullableNumber(formData.get("districtId"));
                        const province = findById(App.state.refs.provinces, provinceId);
                        const cities = provinceId ? await App.ensureCities(provinceId) : [];
                        const city = findById(cities, cityId);
                        const districts = cityId ? await App.ensureDistricts(cityId) : [];
                        const district = findById(districts, districtId);
                        if (!province || !city || !district) throw new Error("请完整选择公寓所在省、市、区。");

                        const payload = {
                            id: toNullableNumber(formData.get("id")),
                            name: String(formData.get("name") || "").trim(),
                            phone: String(formData.get("phone") || "").trim(),
                            introduction: String(formData.get("introduction") || "").trim(),
                            provinceId,
                            provinceName: province.name,
                            cityId,
                            cityName: city.name,
                            districtId,
                            districtName: district.name,
                            addressDetail: String(formData.get("addressDetail") || "").trim(),
                            latitude: String(formData.get("latitude") || "").trim(),
                            longitude: String(formData.get("longitude") || "").trim(),
                            facilityInfoIds: collectCheckedNumbers(form, "facilityInfoIds"),
                            labelIds: collectCheckedNumbers(form, "labelIds"),
                            feeValueIds: collectCheckedNumbers(form, "feeValueIds"),
                            graphVoList: parseImageUrls(formData.get("imageUrls"))
                        };

                        const savedId = await saveApartment(payload);
                        App.closeDrawer();
                        await App.loadSummary();
                        await loadApartments(savedId || payload.id || state.apartments.selectedId);
                    } catch (error) {
                        messageNode.textContent = App.normalizeReason(error.message);
                    }
                });
            }
        });
    }

    function renderRoomList() {
        const container = $("#roomList");
        if (!state.rooms.records.length) {
            container.innerHTML = `<div class="empty-state">当前没有符合条件的房间记录。</div>`;
            return;
        }
        container.innerHTML = state.rooms.records.map((item) => {
            const selected = String(item.id) === String(state.rooms.selectedId);
            return `
                <article class="list-card ${selected ? "is-selected" : ""}" data-id="${item.id}">
                    <div class="list-card-head">
                        <div><p class="eyebrow">房间 #${App.escapeHtml(item.id)}</p><h3>${App.escapeHtml(item.roomNumber || "未命名房间")}</h3></div>
                        ${App.statusPill(App.enums.release[releaseCode(item.isRelease)])}
                    </div>
                    <div class="meta-line">
                        <div class="soft-box">月租：${App.fmtMoney(item.rent)}</div>
                        <div class="soft-box">入住：${item.isCheckIn ? "已入住" : "空闲中"}</div>
                    </div>
                    <p class="muted-text">${App.escapeHtml(item.apartmentInfo?.name || "未关联公寓")}</p>
                    <div class="list-actions">
                        <button class="ghost-btn" data-action="view" data-id="${item.id}" type="button">查看详情</button>
                        <button class="ghost-btn" data-action="edit" data-id="${item.id}" type="button">编辑</button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderRoomDetail(detail) {
        const container = $("#roomDetail");
        if (!detail) {
            container.innerHTML = `<div class="empty-state">选择左侧房间查看详情，或点击上方按钮新增房间。</div>`;
            return;
        }

        container.innerHTML = `
            <div>
                <div class="list-card-head">
                    <div><p class="eyebrow">房间详情</p><h3>${App.escapeHtml(detail.roomNumber || "未命名房间")}</h3></div>
                    ${App.statusPill(App.enums.release[releaseCode(detail.isRelease)])}
                </div>
                <div class="toolbar">
                    <span class="count-chip">所属公寓 ${App.escapeHtml(detail.apartmentInfo?.name || "-")}</span>
                    <span class="count-chip">月租 ${App.fmtMoney(detail.rent)}</span>
                    <span class="count-chip">${detail.isCheckIn ? "已入住" : "空闲中"}</span>
                </div>
                <div class="kv-list">
                    <div class="kv-item"><strong>所属位置</strong><p>${App.escapeHtml([detail.apartmentInfo?.provinceName, detail.apartmentInfo?.cityName, detail.apartmentInfo?.districtName, detail.apartmentInfo?.addressDetail].filter(Boolean).join(" / ") || "暂无位置")}</p></div>
                    <div class="kv-item"><strong>支付方式</strong><div class="pill-wrap">${renderTagList(detail.paymentTypeList, (item) => `${item.name}${item.payMonthCount ? ` / ${item.payMonthCount}个月` : ""}`)}</div></div>
                    <div class="kv-item"><strong>租期</strong><div class="pill-wrap">${renderTagList(detail.leaseTermList, (item) => `${item.monthCount}${item.unit || "月"}`)}</div></div>
                </div>
                <div class="detail-grid">
                    <section class="detail-section"><h4>房间属性</h4><div class="pill-wrap">${renderTagList(detail.attrValueVoList, (item) => `${item.attrKeyName || "属性"}：${item.name}`)}</div></section>
                    <section class="detail-section"><h4>房间配套</h4><div class="pill-wrap">${renderTagList(detail.facilityInfoList, (item) => item.name)}</div></section>
                    <section class="detail-section"><h4>房间标签</h4><div class="pill-wrap">${renderTagList(detail.labelInfoList, (item) => item.name)}</div></section>
                </div>
                <section class="detail-section" style="margin-top: 18px;">
                    <h4>图片资料</h4>
                    ${(detail.graphVoList || []).length ? `<div class="gallery-grid">${(detail.graphVoList || []).map((item) => `<div class="gallery-card"><img src="${item.url}" alt="${App.escapeHtml(item.name || "房间图片")}"><p>${App.escapeHtml(item.name || item.url)}</p></div>`).join("")}</div>` : `<p class="muted-text">暂无图片资料</p>`}
                </section>
                <div class="toolbar">
                    <button class="primary-btn" data-action="edit" data-id="${detail.id}" type="button">编辑房间</button>
                    <button class="ghost-btn" data-action="toggle" data-id="${detail.id}" data-status="${releaseStatusName(detail.isRelease) === "RELEASED" ? "NOT_RELEASED" : "RELEASED"}" type="button">${releaseStatusName(detail.isRelease) === "RELEASED" ? "下架房间" : "发布房间"}</button>
                    <button class="danger-btn" data-action="delete" data-id="${detail.id}" type="button">删除房间</button>
                </div>
            </div>
        `;
    }

    async function fetchRoomList() {
        const query = App.toQueryString({ current: 1, size: 50, provinceId: state.rooms.filters.provinceId, cityId: state.rooms.filters.cityId, districtId: state.rooms.filters.districtId, apartmentId: state.rooms.filters.apartmentId });
        const data = await App.request(`/admin/room/pageItem?${query}`);
        return data.records || [];
    }

    async function loadRooms(preferredId = state.rooms.selectedId) {
        state.rooms.records = await resolveData(fetchRoomList, async () => getMockRoomList());
        renderRoomList();
        if (!state.rooms.records.length) {
            state.rooms.selectedId = null;
            state.rooms.detail = null;
            renderRoomDetail(null);
            return;
        }
        const nextId = state.rooms.records.some((item) => String(item.id) === String(preferredId)) ? preferredId : state.rooms.records[0].id;
        await showRoom(nextId);
    }

    async function showRoom(id) {
        state.rooms.selectedId = id;
        renderRoomList();
        state.rooms.detail = await resolveData(
            async () => App.request(`/admin/room/getDetailById?id=${id}`),
            async () => getMockRoomDetail(id)
        );
        renderRoomDetail(state.rooms.detail);
    }

    function saveMockRoom(payload) {
        if (payload.id) {
            const target = findById(App.mock.rooms, payload.id);
            if (target) Object.assign(target, payload);
            return payload.id;
        }
        const nextIdValue = nextMockId(App.mock.rooms);
        App.mock.rooms.unshift({ ...payload, id: nextIdValue, isRelease: 0, isCheckIn: false });
        return nextIdValue;
    }

    function deleteMockRoom(id) {
        const next = App.mock.rooms.filter((item) => Number(item.id) !== Number(id));
        App.mock.rooms.length = 0;
        App.mock.rooms.push(...next);
    }

    function toggleMockRoom(id, status) {
        const target = findById(App.mock.rooms, id);
        if (target) target.isRelease = status === "RELEASED" ? 1 : 0;
    }

    async function saveRoom(payload) {
        if (App.isDemoMode()) return saveMockRoom(payload);
        await App.request("/admin/room/saveOrUpdate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return payload.id || null;
    }

    async function removeRoom(id) {
        if (App.isDemoMode()) {
            deleteMockRoom(id);
            return;
        }
        await App.request(`/admin/room/removeById?id=${id}`, { method: "DELETE" });
    }

    async function updateRoomStatus(id, status) {
        if (App.isDemoMode()) {
            toggleMockRoom(id, status);
            return;
        }
        await App.request(`/admin/room/updateReleaseStatusById?id=${id}&status=${status}`, { method: "POST" });
    }

    async function openRoomDrawer(id = null) {
        const detail = id
            ? await resolveData(async () => App.request(`/admin/room/getDetailById?id=${id}`), async () => getMockRoomDetail(id))
            : { id: "", roomNumber: "", rent: "", apartmentInfo: null, attrValueVoList: [], facilityInfoList: [], labelInfoList: [], paymentTypeList: [], leaseTermList: [], graphVoList: [] };
        const apartmentInfo = detail.apartmentInfo || {};
        const initialProvinceId = apartmentInfo.provinceId || "";
        const initialCityId = apartmentInfo.cityId || "";
        const initialDistrictId = apartmentInfo.districtId || "";
        const initialApartmentId = apartmentInfo.id || detail.apartmentId || "";

        App.openDrawer({
            eyebrow: id ? "编辑房间" : "新增房间",
            title: id ? `修改 ${detail.roomNumber}` : "创建房间记录",
            html: `
                <form id="roomForm">
                    <div class="form-grid">
                        <input type="hidden" name="id" value="${App.escapeHtml(detail.id || "")}">
                        <label><span>房间号</span><input name="roomNumber" type="text" value="${App.escapeHtml(detail.roomNumber || "")}" required></label>
                        <label><span>月租</span><input name="rent" type="number" min="0" step="0.01" value="${App.escapeHtml(detail.rent || "")}" required></label>
                        <label><span>省份</span><select name="provinceId" required></select></label>
                        <label><span>城市</span><select name="cityId" required></select></label>
                        <label><span>区域</span><select name="districtId" required></select></label>
                        <label><span>所属公寓</span><select name="apartmentId" required></select></label>
                        <label class="full"><span>图片地址</span><textarea name="imageUrls" placeholder="每行填写一个图片地址">${App.escapeHtml((detail.graphVoList || []).map((item) => item.url).join("\n"))}</textarea></label>
                    </div>
                    <div class="section-block"><p class="eyebrow">房间属性</p>${choiceHtml("attrValueIds", flattenAttrOptions(), (detail.attrValueVoList || []).map((item) => item.id), (item) => ({ title: item.name, meta: item.attrKeyName || "房间属性" }))}</div>
                    <div class="section-block"><p class="eyebrow">房间配套</p>${choiceHtml("facilityInfoIds", App.state.refs.roomFacilities, (detail.facilityInfoList || []).map((item) => item.id), (item) => ({ title: item.name, meta: "保存后会关联到该房间" }))}</div>
                    <div class="section-block"><p class="eyebrow">房间标签</p>${choiceHtml("labelInfoIds", App.state.refs.roomLabels, (detail.labelInfoList || []).map((item) => item.id), (item) => ({ title: item.name, meta: "用于房间详情展示" }))}</div>
                    <div class="section-block"><p class="eyebrow">支付方式</p>${choiceHtml("paymentTypeIds", App.state.refs.paymentTypes, (detail.paymentTypeList || []).map((item) => item.id), (item) => ({ title: item.name, meta: item.additionalInfo || `${item.payMonthCount || "-"} 个月支付一次` }))}</div>
                    <div class="section-block"><p class="eyebrow">可选租期</p>${choiceHtml("leaseTermIds", App.state.refs.leaseTerms, (detail.leaseTermList || []).map((item) => item.id), (item) => ({ title: `${item.monthCount}${item.unit || "月"}`, meta: "租赁期限配置" }))}</div>
                    <div class="form-actions">
                        <button class="primary-btn" type="submit">保存房间</button>
                        <button class="ghost-btn" type="button" data-action="cancel">取消</button>
                    </div>
                    <p class="form-message" data-role="form-message"></p>
                </form>
            `,
            onReady: async (root) => {
                const form = $("#roomForm", root);
                const provinceSelect = $('[name="provinceId"]', form);
                const citySelect = $('[name="cityId"]', form);
                const districtSelect = $('[name="districtId"]', form);
                const apartmentSelect = $('[name="apartmentId"]', form);
                const messageNode = $('[data-role="form-message"]', form);

                const fillApartmentSelect = async (districtId, selectedApartmentId) => {
                    let options = [];
                    if (App.isDemoMode()) {
                        options = App.mock.apartments.filter((item) => !districtId || String(item.districtId) === String(districtId));
                    } else if (districtId) {
                        options = await App.request(`/admin/apartment/listInfoByDistrictId?id=${districtId}`);
                    } else {
                        const query = App.toQueryString({ current: 1, size: 100 });
                        const page = await App.request(`/admin/apartment/pageItem?${query}`);
                        options = page.records || [];
                    }
                    App.fillSelect(apartmentSelect, options, "选择所属公寓", selectedApartmentId);
                };

                const syncRoomRegions = async () => {
                    App.fillSelect(provinceSelect, App.state.refs.provinces, "选择省份", initialProvinceId);
                    const cities = initialProvinceId ? await App.ensureCities(initialProvinceId) : [];
                    App.fillSelect(citySelect, cities, "选择城市", initialCityId);
                    const districts = initialCityId ? await App.ensureDistricts(initialCityId) : [];
                    App.fillSelect(districtSelect, districts, "选择区域", initialDistrictId);
                    await fillApartmentSelect(initialDistrictId, initialApartmentId);
                };

                await syncRoomRegions();
                provinceSelect.addEventListener("change", async () => {
                    const cities = provinceSelect.value ? await App.ensureCities(provinceSelect.value) : [];
                    App.fillSelect(citySelect, cities, "选择城市");
                    App.fillSelect(districtSelect, [], "选择区域");
                    App.fillSelect(apartmentSelect, [], "选择所属公寓");
                });
                citySelect.addEventListener("change", async () => {
                    const districts = citySelect.value ? await App.ensureDistricts(citySelect.value) : [];
                    App.fillSelect(districtSelect, districts, "选择区域");
                    App.fillSelect(apartmentSelect, [], "选择所属公寓");
                });
                districtSelect.addEventListener("change", async () => {
                    await fillApartmentSelect(districtSelect.value, "");
                });
                form.addEventListener("click", (event) => {
                    if (event.target.closest('[data-action="cancel"]')) App.closeDrawer();
                });
                form.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    messageNode.textContent = "正在保存房间...";
                    try {
                        const formData = new FormData(form);
                        const apartmentId = toNullableNumber(formData.get("apartmentId"));
                        if (!apartmentId) throw new Error("请先选择房间所属公寓。");
                        const payload = {
                            id: toNullableNumber(formData.get("id")),
                            roomNumber: String(formData.get("roomNumber") || "").trim(),
                            rent: toNullableNumber(formData.get("rent")),
                            apartmentId,
                            attrValueIds: collectCheckedNumbers(form, "attrValueIds"),
                            facilityInfoIds: collectCheckedNumbers(form, "facilityInfoIds"),
                            labelInfoIds: collectCheckedNumbers(form, "labelInfoIds"),
                            paymentTypeIds: collectCheckedNumbers(form, "paymentTypeIds"),
                            leaseTermIds: collectCheckedNumbers(form, "leaseTermIds"),
                            graphVoList: parseImageUrls(formData.get("imageUrls"))
                        };
                        const savedId = await saveRoom(payload);
                        App.closeDrawer();
                        await App.loadSummary();
                        await loadRooms(savedId || payload.id || state.rooms.selectedId);
                    } catch (error) {
                        messageNode.textContent = App.normalizeReason(error.message);
                    }
                });
            }
        });
    }

    function renderUserList() {
        const container = $("#systemUserList");
        if (!state.users.records.length) {
            container.innerHTML = `<div class="empty-state">当前没有符合条件的后台账号记录。</div>`;
            return;
        }
        container.innerHTML = state.users.records.map((item) => {
            const selected = String(item.id) === String(state.users.selectedId);
            const status = userStatusCode(item.status);
            const type = userTypeName(item.type);
            return `
                <article class="list-card ${selected ? "is-selected" : ""}" data-id="${item.id}">
                    <div class="list-card-head">
                        <div><p class="eyebrow">账号 #${App.escapeHtml(item.id)}</p><h3>${App.escapeHtml(item.username || "未命名账号")}</h3></div>
                        ${App.statusPill(App.enums.userStatus[status])}
                    </div>
                    <div class="meta-line">
                        <div class="soft-box">姓名：${App.escapeHtml(item.name || "-")}</div>
                        <div class="soft-box">类型：${App.escapeHtml(App.enums.userTypeLabel[type])}</div>
                        <div class="soft-box">岗位：${App.escapeHtml(item.postName || "未设置")}</div>
                    </div>
                    <p class="muted-text">${App.escapeHtml(item.phone || "-")}</p>
                    <div class="list-actions">
                        <button class="ghost-btn" data-action="view" data-id="${item.id}" type="button">查看详情</button>
                        <button class="ghost-btn" data-action="edit" data-id="${item.id}" type="button">编辑</button>
                    </div>
                </article>
            `;
        }).join("");
    }

    function renderUserDetail(detail) {
        const container = $("#systemUserDetail");
        if (!detail) {
            container.innerHTML = `<div class="empty-state">选择左侧账号查看详情，或点击上方按钮新增后台账号。</div>`;
            return;
        }
        const status = userStatusCode(detail.status);
        const type = userTypeName(detail.type);
        container.innerHTML = `
            <div>
                <div class="list-card-head">
                    <div><p class="eyebrow">账号详情</p><h3>${App.escapeHtml(detail.username || "未命名账号")}</h3></div>
                    ${App.statusPill(App.enums.userStatus[status])}
                </div>
                <div class="toolbar">
                    <span class="count-chip">姓名 ${App.escapeHtml(detail.name || "-")}</span>
                    <span class="count-chip">类型 ${App.escapeHtml(App.enums.userTypeLabel[type])}</span>
                    <span class="count-chip">岗位 ${App.escapeHtml(detail.postName || "未设置")}</span>
                </div>
                <div class="kv-list">
                    <div class="kv-item"><strong>手机号</strong><p>${App.escapeHtml(detail.phone || "-")}</p></div>
                    <div class="kv-item"><strong>头像地址</strong><p>${App.escapeHtml(detail.avatarUrl || "未设置")}</p></div>
                    <div class="kv-item"><strong>备注信息</strong><p>${App.escapeHtml(detail.additionalInfo || "暂无备注")}</p></div>
                </div>
                <div class="toolbar">
                    <button class="primary-btn" data-action="edit" data-id="${detail.id}" type="button">编辑账号</button>
                    <button class="ghost-btn" data-action="toggle" data-id="${detail.id}" data-status="${userStatusName(detail.status) === "ENABLE" ? "DISABLE" : "ENABLE"}" type="button">${userStatusName(detail.status) === "ENABLE" ? "停用账号" : "启用账号"}</button>
                    <button class="danger-btn" data-action="delete" data-id="${detail.id}" type="button">删除账号</button>
                </div>
            </div>
        `;
    }

    async function fetchSystemUserList() {
        const query = App.toQueryString({ current: 1, size: 50, name: state.users.filters.name, phone: state.users.filters.phone });
        const data = await App.request(`/admin/system/user/page?${query}`);
        return data.records || [];
    }

    async function loadSystemUsers(preferredId = state.users.selectedId) {
        state.users.records = await resolveData(fetchSystemUserList, async () => getMockUserList());
        renderUserList();
        if (!state.users.records.length) {
            state.users.selectedId = null;
            state.users.detail = null;
            renderUserDetail(null);
            return;
        }
        const nextId = state.users.records.some((item) => String(item.id) === String(preferredId)) ? preferredId : state.users.records[0].id;
        await showSystemUser(nextId);
    }

    async function showSystemUser(id) {
        state.users.selectedId = id;
        renderUserList();
        state.users.detail = await resolveData(
            async () => App.request(`/admin/system/user/getById?id=${id}`),
            async () => getMockUserDetail(id)
        );
        renderUserDetail(state.users.detail);
    }

    function saveMockSystemUser(payload) {
        if (payload.id) {
            const target = findById(App.mock.systemUsers, payload.id);
            if (target) Object.assign(target, payload);
            return payload.id;
        }
        const nextIdValue = nextMockId(App.mock.systemUsers);
        App.mock.systemUsers.unshift({ ...payload, id: nextIdValue });
        return nextIdValue;
    }

    function deleteMockSystemUser(id) {
        const next = App.mock.systemUsers.filter((item) => Number(item.id) !== Number(id));
        App.mock.systemUsers.length = 0;
        App.mock.systemUsers.push(...next);
    }

    function toggleMockSystemUser(id, status) {
        const target = findById(App.mock.systemUsers, id);
        if (target) target.status = status;
    }

    async function saveSystemUser(payload) {
        if (App.isDemoMode()) return saveMockSystemUser(payload);
        await App.request("/admin/system/user/saveOrUpdate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });
        return payload.id || null;
    }

    async function removeSystemUser(id) {
        if (App.isDemoMode()) {
            deleteMockSystemUser(id);
            return;
        }
        await App.request(`/admin/system/user/deleteById?id=${id}`, { method: "DELETE" });
    }

    async function updateSystemUserStatus(id, status) {
        if (App.isDemoMode()) {
            toggleMockSystemUser(id, status);
            return;
        }
        await App.request(`/admin/system/user/updateStatusByUserId?id=${id}&status=${status}`, { method: "POST" });
    }

    async function openSystemUserDrawer(id = null) {
        const detail = id
            ? await resolveData(async () => App.request(`/admin/system/user/getById?id=${id}`), async () => getMockUserDetail(id))
            : { id: "", username: "", name: "", phone: "", type: "ADMIN", postId: App.state.refs.posts[0]?.id || "", avatarUrl: "", additionalInfo: "", status: "ENABLE" };

        App.openDrawer({
            eyebrow: id ? "编辑账号" : "新增账号",
            title: id ? `修改 ${detail.username}` : "创建后台账号",
            html: `
                <form id="systemUserForm">
                    <div class="form-grid">
                        <input type="hidden" name="id" value="${App.escapeHtml(detail.id || "")}">
                        <label><span>用户名</span><input name="username" type="text" value="${App.escapeHtml(detail.username || "")}" ${id ? "readonly" : ""} required></label>
                        <label><span>姓名</span><input name="name" type="text" value="${App.escapeHtml(detail.name || "")}" required></label>
                        <label><span>手机号</span><input name="phone" type="text" value="${App.escapeHtml(detail.phone || "")}" required></label>
                        <label><span>账号类型</span><select name="type"><option value="ADMIN" ${userTypeName(detail.type) === "ADMIN" ? "selected" : ""}>管理员</option><option value="COMMON" ${userTypeName(detail.type) === "COMMON" ? "selected" : ""}>普通员工</option></select></label>
                        <label><span>岗位</span><select name="postId" ${App.state.refs.posts.length ? "required" : ""}></select></label>
                        <label><span>账号状态</span><select name="status"><option value="ENABLE" ${userStatusName(detail.status) === "ENABLE" ? "selected" : ""}>启用</option><option value="DISABLE" ${userStatusName(detail.status) === "DISABLE" ? "selected" : ""}>停用</option></select></label>
                        <label class="full"><span>${id ? "重置密码（留空则不修改）" : "登录密码"}</span><input name="password" type="password" ${id ? "" : "required"}></label>
                        <label class="full"><span>头像地址</span><input name="avatarUrl" type="text" value="${App.escapeHtml(detail.avatarUrl || "")}"></label>
                        <label class="full"><span>备注信息</span><textarea name="additionalInfo">${App.escapeHtml(detail.additionalInfo || "")}</textarea></label>
                    </div>
                    <div class="form-actions">
                        <button class="primary-btn" type="submit">保存账号</button>
                        <button class="ghost-btn" type="button" data-action="cancel">取消</button>
                    </div>
                    <p class="form-message" data-role="form-message"></p>
                </form>
            `,
            onReady: (root) => {
                const form = $("#systemUserForm", root);
                const postSelect = $('[name="postId"]', form);
                const messageNode = $('[data-role="form-message"]', form);
                App.fillSelect(postSelect, App.state.refs.posts, "选择岗位", detail.postId);
                form.addEventListener("click", (event) => {
                    if (event.target.closest('[data-action="cancel"]')) App.closeDrawer();
                });
                form.addEventListener("submit", async (event) => {
                    event.preventDefault();
                    messageNode.textContent = "正在保存账号...";
                    try {
                        const formData = new FormData(form);
                        const payload = {
                            id: toNullableNumber(formData.get("id")),
                            username: String(formData.get("username") || "").trim(),
                            name: String(formData.get("name") || "").trim(),
                            phone: String(formData.get("phone") || "").trim(),
                            type: userTypeName(formData.get("type")),
                            postId: toNullableNumber(formData.get("postId")),
                            status: userStatusName(formData.get("status")),
                            avatarUrl: String(formData.get("avatarUrl") || "").trim(),
                            additionalInfo: String(formData.get("additionalInfo") || "").trim()
                        };
                        const password = String(formData.get("password") || "").trim();
                        if (password) payload.password = password;
                        if (!payload.id && !payload.password) throw new Error("新增账号时必须填写登录密码。");
                        if (!payload.id && !App.isDemoMode()) {
                            const available = await App.request(`/admin/system/user/isUserNameAvailable?username=${encodeURIComponent(payload.username)}`);
                            if (!available) throw new Error("该用户名已存在，请更换后再保存。");
                        }
                        const savedId = await saveSystemUser(payload);
                        App.closeDrawer();
                        await App.loadSummary();
                        await loadSystemUsers(savedId || payload.id || state.users.selectedId);
                    } catch (error) {
                        messageNode.textContent = App.normalizeReason(error.message);
                    }
                });
            }
        });
    }

    async function handleApartmentAction(event) {
        const actionButton = event.target.closest("[data-action]");
        const card = event.target.closest(".list-card[data-id]");
        if (card && !actionButton) return showApartment(card.dataset.id);
        if (!actionButton) return;
        const { action, id, status } = actionButton.dataset;
        try {
            if (action === "view") await showApartment(id);
            if (action === "edit") await openApartmentDrawer(id);
            if (action === "delete") {
                if (!window.confirm("确定删除该公寓吗？")) return;
                await removeApartment(id);
                state.apartments.selectedId = null;
                state.apartments.detail = null;
                renderApartmentDetail(null);
                await App.loadSummary();
                await loadApartments(null);
            }
            if (action === "toggle") {
                await updateApartmentStatus(id, status);
                await App.loadSummary();
                await loadApartments(id);
            }
        } catch (error) {
            showError(error);
        }
    }

    async function handleRoomAction(event) {
        const actionButton = event.target.closest("[data-action]");
        const card = event.target.closest(".list-card[data-id]");
        if (card && !actionButton) return showRoom(card.dataset.id);
        if (!actionButton) return;
        const { action, id, status } = actionButton.dataset;
        try {
            if (action === "view") await showRoom(id);
            if (action === "edit") await openRoomDrawer(id);
            if (action === "delete") {
                if (!window.confirm("确定删除该房间吗？")) return;
                await removeRoom(id);
                state.rooms.selectedId = null;
                state.rooms.detail = null;
                renderRoomDetail(null);
                await App.loadSummary();
                await loadRooms(null);
            }
            if (action === "toggle") {
                await updateRoomStatus(id, status);
                await App.loadSummary();
                await loadRooms(id);
            }
        } catch (error) {
            showError(error);
        }
    }

    async function handleUserAction(event) {
        const actionButton = event.target.closest("[data-action]");
        const card = event.target.closest(".list-card[data-id]");
        if (card && !actionButton) return showSystemUser(card.dataset.id);
        if (!actionButton) return;
        const { action, id, status } = actionButton.dataset;
        try {
            if (action === "view") await showSystemUser(id);
            if (action === "edit") await openSystemUserDrawer(id);
            if (action === "delete") {
                if (!window.confirm("确定删除该账号吗？")) return;
                await removeSystemUser(id);
                await App.loadSummary();
                await loadSystemUsers();
            }
            if (action === "toggle") {
                await updateSystemUserStatus(id, status);
                await App.loadSummary();
                await loadSystemUsers(id);
            }
        } catch (error) {
            showError(error);
        }
    }

    function bindOnce() {
        $("#apartmentCreateBtn").addEventListener("click", () => openApartmentDrawer());
        $("#roomCreateBtn").addEventListener("click", () => openRoomDrawer());
        $("#systemUserCreateBtn").addEventListener("click", () => openSystemUserDrawer());

        $("#apartmentFilterBtn").addEventListener("click", () => loadApartments());
        $("#roomFilterBtn").addEventListener("click", () => loadRooms());
        $("#systemUserFilterBtn").addEventListener("click", () => {
            state.users.filters.name = $("#systemUserNameFilter").value.trim();
            state.users.filters.phone = $("#systemUserPhoneFilter").value.trim();
            loadSystemUsers();
        });

        $("#apartmentResetBtn").addEventListener("click", async () => {
            state.apartments.filters = { provinceId: "", cityId: "", districtId: "" };
            await syncApartmentFilterSelects();
            await loadApartments();
        });

        $("#roomResetBtn").addEventListener("click", async () => {
            state.rooms.filters = { provinceId: "", cityId: "", districtId: "", apartmentId: "" };
            await syncRoomFilterSelects();
            await loadRooms();
        });

        $("#systemUserResetBtn").addEventListener("click", async () => {
            state.users.filters = { name: "", phone: "" };
            $("#systemUserNameFilter").value = "";
            $("#systemUserPhoneFilter").value = "";
            await loadSystemUsers();
        });

        $("#apartmentProvinceFilter").addEventListener("change", async (event) => {
            state.apartments.filters.provinceId = event.target.value;
            state.apartments.filters.cityId = "";
            state.apartments.filters.districtId = "";
            await syncApartmentFilterSelects();
        });
        $("#apartmentCityFilter").addEventListener("change", async (event) => {
            state.apartments.filters.cityId = event.target.value;
            state.apartments.filters.districtId = "";
            await syncApartmentFilterSelects();
        });
        $("#apartmentDistrictFilter").addEventListener("change", (event) => {
            state.apartments.filters.districtId = event.target.value;
        });

        $("#roomProvinceFilter").addEventListener("change", async (event) => {
            state.rooms.filters.provinceId = event.target.value;
            state.rooms.filters.cityId = "";
            state.rooms.filters.districtId = "";
            state.rooms.filters.apartmentId = "";
            await syncRoomFilterSelects();
        });
        $("#roomCityFilter").addEventListener("change", async (event) => {
            state.rooms.filters.cityId = event.target.value;
            state.rooms.filters.districtId = "";
            state.rooms.filters.apartmentId = "";
            await syncRoomFilterSelects();
        });
        $("#roomDistrictFilter").addEventListener("change", async (event) => {
            state.rooms.filters.districtId = event.target.value;
            state.rooms.filters.apartmentId = "";
            await loadRoomApartmentOptions();
        });
        $("#roomApartmentFilter").addEventListener("change", (event) => {
            state.rooms.filters.apartmentId = event.target.value;
        });

        $("#systemUserNameFilter").addEventListener("input", (event) => {
            state.users.filters.name = event.target.value.trim();
        });
        $("#systemUserPhoneFilter").addEventListener("input", (event) => {
            state.users.filters.phone = event.target.value.trim();
        });

        $("#apartmentList").addEventListener("click", handleApartmentAction);
        $("#apartmentDetail").addEventListener("click", handleApartmentAction);
        $("#roomList").addEventListener("click", handleRoomAction);
        $("#roomDetail").addEventListener("click", handleRoomAction);
        $("#systemUserList").addEventListener("click", handleUserAction);
        $("#systemUserDetail").addEventListener("click", handleUserAction);
    }

    async function bootstrap() {
        if (!state.bootstrapped) {
            bindOnce();
            state.bootstrapped = true;
        }
        return activatePage(App.state.currentPage);
    }

    async function activatePage(page) {
        if (page === "apartments") {
            await syncApartmentFilterSelects();
            return loadApartments();
        }
        if (page === "rooms") {
            await syncRoomFilterSelects();
            return loadRooms();
        }
        if (page === "users") return loadSystemUsers();
        if (page === "summary") return App.loadSummary();
        return null;
    }

    async function refreshCurrentPage() {
        return activatePage(App.state.currentPage);
    }

    window.AdminCrud = {
        bootstrap,
        activatePage,
        refreshCurrentPage
    };
})();
