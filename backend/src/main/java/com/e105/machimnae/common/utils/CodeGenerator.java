package com.e105.machimnae.common.utils;

import java.util.UUID;

public class CodeGenerator {
  
    public static String generateCode(int length) {    
        return UUID.randomUUID().toString().substring(0, length).toUpperCase();
    }
   
}    