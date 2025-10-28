package com.runigen.meeoocat.converter;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
    public class NullToZeroConverter implements AttributeConverter<Long, Long> {

    @Override
    public Long convertToDatabaseColumn(Long data) {
        // Use defaultIfEmpty to preserve Strings consisting only of whitespaces
        return data == null ? 0 : data;
    }

    @Override
    public Long convertToEntityAttribute(Long dbData) {
        //If you want to keep it null otherwise transform to empty String
        return dbData == null ? 0 : dbData;
    }
}