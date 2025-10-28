package com.runigen.meeoocat.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.CacheControl;
import org.springframework.web.servlet.config.annotation.*;

import java.io.File;
import java.util.concurrent.TimeUnit;

@Configuration
//@EnableWebMvc
public class WebConfig implements WebMvcConfigurer {

    @Value("${file.upload-path}")
    private String fileUploadPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedMethods("*")
                .allowCredentials(false)
                .maxAge(3000);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String rootPath = System.getProperty("user.dir");
        String uploadPath = "file://" + rootPath + File.separator + fileUploadPath + File.separator;
        String jsPath = "file://" + rootPath + File.separator + "meeoocat-player" + File.separator;

        System.out.println("jsPath : " + jsPath);

        registry.addResourceHandler("/**", "/viewer/**")
                .addResourceLocations(uploadPath, jsPath)
                .setCacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES));
    }

}