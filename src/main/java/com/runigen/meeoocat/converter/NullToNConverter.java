package com.runigen.meeoocat.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
    public class NullToNConverter implements AttributeConverter<String, String> {

    @Override
    public String convertToDatabaseColumn(String data) {
        // Use defaultIfEmpty to preserve Strings consisting only of whitespaces
        return data == null ? "N" : data;
    }

    @Override
    public String convertToEntityAttribute(String dbData) {
        //If you want to keep it null otherwise transform to empty String
        return dbData == null ? "N" : dbData;
    }
}