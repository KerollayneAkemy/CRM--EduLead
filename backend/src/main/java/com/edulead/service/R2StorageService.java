package com.edulead.service;

import com.edulead.config.R2Properties;
import com.edulead.exception.ApiException;
import java.net.URI;
import java.time.Duration;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.core.exception.SdkException;

@Service
public class R2StorageService {
    private final R2Properties properties;
    private final S3Client client;
    private final S3Presigner presigner;

    public R2StorageService(R2Properties properties) {
        this.properties = properties;
        if (!properties.isEnabled()) {
            client = null;
            presigner = null;
            return;
        }
        if (blank(properties.getEndpoint()) || blank(properties.getBucket())
                || blank(properties.getAccessKeyId()) || blank(properties.getSecretAccessKey())) {
            throw new IllegalStateException("R2 está habilitado, mas as variáveis de configuração estão incompletas");
        }
        var credentials = StaticCredentialsProvider.create(
                AwsBasicCredentials.create(properties.getAccessKeyId(), properties.getSecretAccessKey()));
        client = S3Client.builder().endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of("auto")).credentialsProvider(credentials).forcePathStyle(true).build();
        presigner = S3Presigner.builder().endpointOverride(URI.create(properties.getEndpoint()))
                .region(Region.of("auto")).credentialsProvider(credentials).build();
    }

    public void upload(String key, String contentType, byte[] content) {
        configured();
        try {
            client.putObject(PutObjectRequest.builder().bucket(properties.getBucket()).key(key)
                    .contentType(contentType).build(), RequestBody.fromBytes(content));
        } catch (SdkException exception) {
            throw ApiException.serviceUnavailable("Não foi possível armazenar o arquivo agora");
        }
    }

    public String signedDownloadUrl(String key) {
        configured();
        try {
            var request = GetObjectPresignRequest.builder()
                    .signatureDuration(Duration.ofMinutes(validSignedUrlMinutes()))
                    .getObjectRequest(GetObjectRequest.builder().bucket(properties.getBucket()).key(key).build())
                    .build();
            return presigner.presignGetObject(request).url().toString();
        } catch (SdkException exception) {
            throw ApiException.serviceUnavailable("Não foi possível preparar o download agora");
        }
    }

    public void delete(String key) {
        configured();
        try {
            client.deleteObject(DeleteObjectRequest.builder().bucket(properties.getBucket()).key(key).build());
        } catch (SdkException exception) {
            throw ApiException.serviceUnavailable("Não foi possível excluir o arquivo agora");
        }
    }

    private void configured() {
        if (!properties.isEnabled()) {
            throw ApiException.serviceUnavailable("Armazenamento de arquivos ainda não está configurado");
        }
    }

    private boolean blank(String value) {
        return value == null || value.isBlank();
    }

    private int validSignedUrlMinutes() {
        return Math.min(60, Math.max(1, properties.getSignedUrlMinutes()));
    }
}
