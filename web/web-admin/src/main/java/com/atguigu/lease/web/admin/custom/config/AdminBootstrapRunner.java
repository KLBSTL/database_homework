package com.atguigu.lease.web.admin.custom.config;

import com.atguigu.lease.model.entity.SystemUser;
import com.atguigu.lease.model.enums.BaseStatus;
import com.atguigu.lease.model.enums.SystemUserType;
import com.atguigu.lease.web.admin.service.SystemUserService;
import com.baomidou.mybatisplus.core.conditions.query.LambdaQueryWrapper;
import org.apache.commons.codec.digest.DigestUtils;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class AdminBootstrapRunner implements CommandLineRunner {

    private final SystemUserService systemUserService;

    public AdminBootstrapRunner(SystemUserService systemUserService) {
        this.systemUserService = systemUserService;
    }

    @Override
    public void run(String... args) {
        LambdaQueryWrapper<SystemUser> queryWrapper = new LambdaQueryWrapper<>();
        queryWrapper.eq(SystemUser::getUsername, "admin");
        long count = systemUserService.count(queryWrapper);
        if (count > 0) {
            return;
        }

        SystemUser systemUser = new SystemUser();
        systemUser.setUsername("admin");
        systemUser.setPassword(DigestUtils.md5Hex("123456"));
        systemUser.setName("管理员");
        systemUser.setType(SystemUserType.ADMIN);
        systemUser.setPhone("18888888888");
        systemUser.setStatus(BaseStatus.ENABLE);
        systemUserService.save(systemUser);
    }
}
