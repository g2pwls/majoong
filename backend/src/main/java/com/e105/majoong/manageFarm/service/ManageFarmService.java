package com.e105.majoong.manageFarm.service;

import com.e105.majoong.auth.security.CustomUserDetails;
import com.e105.majoong.manageFarm.dto.in.FarmInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.HorseInfoUpdateDto;
import com.e105.majoong.manageFarm.dto.in.ReportHorseStatusDto;
import com.e105.majoong.manageFarm.dto.out.GeoDto;
import com.e105.majoong.manageFarm.dto.out.HorseListResponseDto;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

public interface ManageFarmService {
    //농장 테이블에 boolean 값을 넣 어서 true일 때만 농장 목록에 뜨도록
    //농장 정보 수정
    //말 정보 수정
    String updateFarm(String memberUuid, FarmInfoUpdateDto updateDto);

    void updateHorse(String memberUuid, HorseInfoUpdateDto updateDto);

    List<HorseListResponseDto> getHorseList(String memberUuid, String farmUuid);

    //영수증 카테고리 조회
    //영수증 텍스트, 인증사진, 특이사항 등록
    GeoDto getGeo(String farmUuid);

    void reportHorseState(String memberUuid, String farmUuid, Long horseNumber, ReportHorseStatusDto dto);

}
