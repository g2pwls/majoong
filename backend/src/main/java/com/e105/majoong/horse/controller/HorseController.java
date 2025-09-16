package com.e105.majoong.horse.controller;

import com.e105.majoong.common.entity.BaseResponse;
import com.e105.majoong.horse.dto.out.HorseSearchResponseDto;
import com.e105.majoong.horse.service.HorseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/farms/horses")
@RequiredArgsConstructor
@Tag(name = "Horse Manage API", description = "말 관리 관련 API")
public class HorseController {

    private final HorseService horseService;

    @GetMapping
    @Operation(summary = "말 키워드로 조회", description = "말 이름 키워드로 검색해서 말 정보를 조회합니다. 키워드가 없으면 전체 조회합니다.")
    public BaseResponse<Page<HorseSearchResponseDto>> searchHorses(
            @RequestParam(required = false) String horseName,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        Page<HorseSearchResponseDto> result = horseService.searchHorses(horseName, page, size);
        return new BaseResponse<>(result);
    }
}
