package com.atguigu.lease.web.admin.controller.dashboard;

import com.atguigu.lease.common.result.Result;
import com.atguigu.lease.model.entity.ApartmentInfo;
import com.atguigu.lease.model.entity.LeaseAgreement;
import com.atguigu.lease.model.entity.RoomInfo;
import com.atguigu.lease.model.entity.UserInfo;
import com.atguigu.lease.model.entity.ViewAppointment;
import com.atguigu.lease.model.enums.AppointmentStatus;
import com.atguigu.lease.model.enums.BaseStatus;
import com.atguigu.lease.model.enums.LeaseStatus;
import com.atguigu.lease.model.enums.ReleaseStatus;
import com.atguigu.lease.web.admin.service.ApartmentInfoService;
import com.atguigu.lease.web.admin.service.LeaseAgreementService;
import com.atguigu.lease.web.admin.service.RoomInfoService;
import com.atguigu.lease.web.admin.service.UserInfoService;
import com.atguigu.lease.web.admin.service.ViewAppointmentService;
import com.atguigu.lease.web.admin.vo.dashboard.DashboardSummaryVo;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "首页统计")
@RestController
@RequestMapping("/admin/dashboard")
public class DashboardController {

    @Autowired
    private ApartmentInfoService apartmentInfoService;

    @Autowired
    private RoomInfoService roomInfoService;

    @Autowired
    private UserInfoService userInfoService;

    @Autowired
    private LeaseAgreementService leaseAgreementService;

    @Autowired
    private ViewAppointmentService viewAppointmentService;

    @GetMapping("summary")
    @Operation(summary = "获取后台首页统计概览")
    public Result<DashboardSummaryVo> summary() {
        DashboardSummaryVo summaryVo = new DashboardSummaryVo();

        long apartmentCount = apartmentInfoService.count();
        long releasedApartmentCount = apartmentInfoService.lambdaQuery()
                .eq(ApartmentInfo::getIsRelease, ReleaseStatus.RELEASED)
                .count();

        long roomCount = roomInfoService.count();
        long releasedRoomCount = roomInfoService.lambdaQuery()
                .eq(RoomInfo::getIsRelease, ReleaseStatus.RELEASED)
                .count();

        long userCount = userInfoService.count();
        long enabledUserCount = userInfoService.lambdaQuery()
                .eq(UserInfo::getStatus, BaseStatus.ENABLE)
                .count();

        long agreementCount = leaseAgreementService.count();
        long activeAgreementCount = leaseAgreementService.lambdaQuery()
                .in(LeaseAgreement::getStatus,
                        LeaseStatus.SIGNING,
                        LeaseStatus.SIGNED,
                        LeaseStatus.RENEWING,
                        LeaseStatus.WITHDRAWING)
                .count();

        List<LeaseAgreement> activeAgreements = leaseAgreementService.lambdaQuery()
                .in(LeaseAgreement::getStatus,
                        LeaseStatus.SIGNING,
                        LeaseStatus.SIGNED,
                        LeaseStatus.RENEWING,
                        LeaseStatus.WITHDRAWING)
                .list();

        BigDecimal estimatedMonthlyRent = activeAgreements.stream()
                .map(LeaseAgreement::getRent)
                .filter(rent -> rent != null)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long appointmentCount = viewAppointmentService.count();
        long waitingAppointmentCount = viewAppointmentService.lambdaQuery()
                .eq(ViewAppointment::getAppointmentStatus, AppointmentStatus.WAITING)
                .count();

        int occupancyRate = roomCount == 0
                ? 0
                : (int) Math.round(activeAgreementCount * 100.0 / roomCount);

        summaryVo.setApartmentCount(apartmentCount);
        summaryVo.setReleasedApartmentCount(releasedApartmentCount);
        summaryVo.setRoomCount(roomCount);
        summaryVo.setReleasedRoomCount(releasedRoomCount);
        summaryVo.setUserCount(userCount);
        summaryVo.setEnabledUserCount(enabledUserCount);
        summaryVo.setAgreementCount(agreementCount);
        summaryVo.setActiveAgreementCount(activeAgreementCount);
        summaryVo.setAppointmentCount(appointmentCount);
        summaryVo.setWaitingAppointmentCount(waitingAppointmentCount);
        summaryVo.setEstimatedMonthlyRent(estimatedMonthlyRent);
        summaryVo.setOccupancyRate(occupancyRate);

        return Result.ok(summaryVo);
    }
}
