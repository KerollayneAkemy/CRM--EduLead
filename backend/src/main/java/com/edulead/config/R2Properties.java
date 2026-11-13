package com.edulead.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "edulead.r2")
public class R2Properties {
    private boolean enabled;
    private String endpoint;
    private String bucket;
    private String accessKeyId;
    private String secretAccessKey;
    private long maxFileSizeBytes = 10 * 1024 * 1024;
    private int signedUrlMinutes = 10;

    public boolean isEnabled() { return enabled; }
    public void setEnabled(boolean enabled) { this.enabled = enabled; }
    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }
    public String getBucket() { return bucket; }
    public void setBucket(String bucket) { this.bucket = bucket; }
    public String getAccessKeyId() { return accessKeyId; }
    public void setAccessKeyId(String accessKeyId) { this.accessKeyId = accessKeyId; }
    public String getSecretAccessKey() { return secretAccessKey; }
    public void setSecretAccessKey(String secretAccessKey) { this.secretAccessKey = secretAccessKey; }
    public long getMaxFileSizeBytes() { return maxFileSizeBytes; }
    public void setMaxFileSizeBytes(long maxFileSizeBytes) { this.maxFileSizeBytes = maxFileSizeBytes; }
    public int getSignedUrlMinutes() { return signedUrlMinutes; }
    public void setSignedUrlMinutes(int signedUrlMinutes) { this.signedUrlMinutes = signedUrlMinutes; }
}
