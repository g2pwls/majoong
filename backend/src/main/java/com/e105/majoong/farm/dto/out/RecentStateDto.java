package com.e105.majoong.farm.dto.out;

import lombok.Builder;
import lombok.Getter;

@Builder
@Getter
public class RecentStateDto {
    private int recentShows;
    private long lastShownAt;

    public static RecentStateDto toDto(int recentShows, long lastShownAt) {
        return RecentStateDto.builder()
                .recentShows(recentShows)
                .lastShownAt(lastShownAt)
                .build();
    }
}
