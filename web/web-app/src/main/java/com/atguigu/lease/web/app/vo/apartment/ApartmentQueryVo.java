package com.atguigu.lease.web.app.vo.apartment;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

@Data
@Schema(description = "App 端公寓查询实体")
public class ApartmentQueryVo {

    @Schema(description = "省份 ID")
    private Long provinceId;

    @Schema(description = "城市 ID")
    private Long cityId;

    @Schema(description = "区域 ID")
    private Long districtId;
}
