package com.atguigu.lease.web.app.custom.config;

import com.atguigu.lease.model.entity.ApartmentInfo;
import com.atguigu.lease.model.entity.RoomInfo;
import com.atguigu.lease.model.enums.ReleaseStatus;
import com.atguigu.lease.web.app.mapper.ApartmentInfoMapper;
import com.atguigu.lease.web.app.mapper.RoomInfoMapper;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
public class AppDemoDataBootstrapRunner implements CommandLineRunner {

    private final ApartmentInfoMapper apartmentInfoMapper;
    private final RoomInfoMapper roomInfoMapper;

    public AppDemoDataBootstrapRunner(ApartmentInfoMapper apartmentInfoMapper, RoomInfoMapper roomInfoMapper) {
        this.apartmentInfoMapper = apartmentInfoMapper;
        this.roomInfoMapper = roomInfoMapper;
    }

    @Override
    public void run(String... args) {
        ApartmentInfo apartment = ensureApartment();
        ensureRooms(apartment.getId());
    }

    private ApartmentInfo ensureApartment() {
        ApartmentInfo existing = apartmentInfoMapper.selectOne(
                new LambdaQueryWrapper<ApartmentInfo>()
                        .orderByAsc(ApartmentInfo::getId)
                        .last("limit 1")
        );
        if (existing != null) {
            return existing;
        }

        ApartmentInfo apartment = new ApartmentInfo();
        apartment.setName("课程演示公寓");
        apartment.setIntroduction("系统自动生成的演示公寓，用于展示后台 CRUD 与用户端联动。");
        apartment.setProvinceId(11L);
        apartment.setProvinceName("北京市");
        apartment.setCityId(1101L);
        apartment.setCityName("北京市");
        apartment.setDistrictId(110105L);
        apartment.setDistrictName("朝阳区");
        apartment.setAddressDetail("课程演示路 100 号");
        apartment.setLatitude("39.908823");
        apartment.setLongitude("116.397470");
        apartment.setPhone("13800000000");
        apartment.setIsRelease(ReleaseStatus.RELEASED);
        apartmentInfoMapper.insert(apartment);
        return apartment;
    }

    private void ensureRooms(Long apartmentId) {
        Long roomCount = roomInfoMapper.selectCount(new LambdaQueryWrapper<>());
        if (roomCount != null && roomCount > 0) {
            return;
        }

        RoomInfo roomOne = new RoomInfo();
        roomOne.setRoomNumber("DEMO-101");
        roomOne.setRent(new BigDecimal("3200"));
        roomOne.setApartmentId(apartmentId);
        roomOne.setIsRelease(ReleaseStatus.RELEASED);
        roomInfoMapper.insert(roomOne);

        RoomInfo roomTwo = new RoomInfo();
        roomTwo.setRoomNumber("DEMO-102");
        roomTwo.setRent(new BigDecimal("3600"));
        roomTwo.setApartmentId(apartmentId);
        roomTwo.setIsRelease(ReleaseStatus.RELEASED);
        roomInfoMapper.insert(roomTwo);
    }
}
