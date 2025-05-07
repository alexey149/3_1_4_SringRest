package web.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class MvcConfig implements WebMvcConfigurer {

    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // Мы будем использовать наши контроллеры для всех маршрутов
        // Этот метод оставлен пустым, поскольку все маршрутизации будут обрабатываться в контроллерах
    }
}