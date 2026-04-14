package com.atguigu.lease.web.admin.vo.dashboard;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.math.BigDecimal;

@Data
@Schema(description = "后台首页统计概览")
public class DashboardSummaryVo {

    @Schema(description = "公寓总数")
    private Long apartmentCount;

    @Schema(description = "已发布公寓数")
    private Long releasedApartmentCount;

    @Schema(description = "房间总数")
    private Long roomCount;

    @Schema(description = "已发布房间数")
    private Long releasedRoomCount;

    @Schema(description = "平台用户数")
    private Long userCount;

    @Schema(description = "正常用户数")
    private Long enabledUserCount;

    @Schema(description = "租约总数")
    private Long agreementCount;

    @Schema(description = "活跃租约数")
    private Long activeAgreementCount;

    @Schema(description = "预约总数")
    private Long appointmentCount;

    @Schema(description = "待处理预约数")
    private Long waitingAppointmentCount;

    @Schema(description = "估算月租收入")
    private BigDecimal estimatedMonthlyRent;

    @Schema(description = "房间签约率")
    private Integer occupancyRate;
}
