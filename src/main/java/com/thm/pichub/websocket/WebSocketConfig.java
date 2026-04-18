package com.thm.pichub.websocket;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

/**
 * WebSocket 配置类
 */
@Configuration
@EnableWebSocket
public class WebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private ChannelManager channelManager;

    @Autowired
    private EditLockManager editLockManager;

    @Bean
    public WebSocketHandler webSocketHandler() {
        WebSocketHandler handler = new WebSocketHandler();
        handler.setChannelManager(channelManager);
        handler.setEditLockManager(editLockManager);
        return handler;
    }

    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(webSocketHandler(), "/ws/image-edit")
                .setAllowedOrigins("*");
    }
}
