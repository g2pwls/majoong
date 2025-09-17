package com.e105.majoong.mamageFarm.controller;

import com.e105.majoong.mamageFarm.service.GeoCoding;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RequiredArgsConstructor
@RestController
@Slf4j
@RequestMapping("/api/v1/farms")
@Tag(name = "Farm Manage API", description = "농장 관리 관련 API")
public class ManageFarmController {
//    @GetMapping("/comments/{commentUuid}")
//    @Operation(summary = "피드 댓글 단건 조회", tags = {"Feed Comment Service"})

}
