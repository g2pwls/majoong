package com.e105.majoong.report.batch;

public interface OpenAiService {
    String analyzeReport(String farmName, int year, int month, String content);
}
