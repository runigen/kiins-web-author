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
    private String uploadPath;

    @Value("${file.player-path}")
    private String playerPath;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedMethods("*")
                .allowCredentials(false)
                .maxAge(3000);
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String _rootPath = System.getProperty("user.dir");
        String _uploadPath = "file://" + _rootPath + File.separator + uploadPath + File.separator;
        String _jsPath = "file://" + _rootPath + File.separator + playerPath + File.separator;

        System.out.println("jsPath : " + _jsPath);

        registry.addResourceHandler("/**", "/viewer/**")
                .addResourceLocations(_uploadPath, _jsPath)
                .setCacheControl(CacheControl.maxAge(10, TimeUnit.MINUTES));
    }

}