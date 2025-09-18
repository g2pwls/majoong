package com.e105.majoong.common.utils;

import java.io.IOException;
import java.net.URI;
import java.net.URISyntaxException;
import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Uploader {
    private final S3Client s3Client;
    private final S3Presigner s3Presigner;
    @Value("${cloud.aws.s3.bucket}")
    private String bucket;

    public String upload(MultipartFile file, String dirName) throws IOException {
        String originalName = Optional.ofNullable(file.getOriginalFilename()).orElse("unknown").replaceAll("\\s", "_");
        String uuid = UUID.randomUUID().toString();
        String uniqueFileName = uuid + "_" + originalName;

        String fileName = dirName + "/" + uniqueFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .contentType(Optional.ofNullable(file.getContentType()).orElse("application/octet-stream"))
                .build();
        log.info("Content-Type: {}", file.getContentType());
        s3Client.putObject(putObjectRequest, RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
        return getFileUrl(fileName);
    }

    public String uploadByBytes(byte[] bytes, String originalName, String dirName, String contentType) {
        String safeName = Optional.ofNullable(originalName).orElse("unknown").replaceAll("\\s", "_");
        String uuid = UUID.randomUUID().toString();
        String uniqueFileName = uuid + "_" + safeName;
        String fileName = dirName + "/" + uniqueFileName;

        PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .contentType(Optional.ofNullable(contentType).orElse("application/octet-stream"))
                .build();

        s3Client.putObject(putObjectRequest, RequestBody.fromBytes(bytes));
        return getFileUrl(fileName);
    }

    public void delete(String fileUrl) {
        log.info("delete {}", fileUrl);
        String fileName = extractFileNameFromUrl(fileUrl);
        DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                .bucket(bucket)
                .key(fileName)
                .build();
        s3Client.deleteObject(deleteObjectRequest);
    }

    public String update(String oldFileUrl, MultipartFile newFile, String dirName) throws IOException {
        delete(oldFileUrl);
        return upload(newFile, dirName);
    }

    private String getFileUrl(String fileName) {
        return s3Client.utilities().getUrl(b -> b.bucket(bucket).key(fileName)).toString();
    }

    public String extractFileNameFromUrl(String fileUrl) {
        try {
            URI uri = new URI(fileUrl);
            return uri.getPath().substring(1);
        } catch (URISyntaxException e) {
            throw new IllegalArgumentException("Invalid file URL: " + fileUrl, e);
        }
    }

}