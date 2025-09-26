package com.e105.majoong.kakaoPay.util;

import org.springframework.web.context.request.RequestAttributes;
import org.springframework.web.context.request.RequestContextHolder;

import java.util.Objects;

public class SessionProvider {

    public static void addAttribute(String key, Object value) {
        Objects.requireNonNull(RequestContextHolder.getRequestAttributes())
                .setAttribute(key, value, RequestAttributes.SCOPE_SESSION);
    }

    public static Object getAttribute(String key) {
        return Objects.requireNonNull(RequestContextHolder.getRequestAttributes())
                .getAttribute(key, RequestAttributes.SCOPE_SESSION);
    }

    public static String getStringAttribute(String key) {
        return (String) getAttribute(key);
    }
}