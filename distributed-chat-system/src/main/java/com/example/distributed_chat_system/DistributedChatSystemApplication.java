package com.example.distributed_chat_system;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;

import java.net.ServerSocket;
import java.io.IOException;

@SpringBootApplication
public class DistributedChatSystemApplication {

	@Value("${port1}")
	static int PORT1;
	@Value("${port2}")
	static int PORT2;
	public static void main(String[] args) {
		java.util.Properties properties = new java.util.Properties();
		try (java.io.InputStream input = DistributedChatSystemApplication.class.getClassLoader().getResourceAsStream("application.properties")) {
			if (input != null) {
				properties.load(input);
				String p1 = properties.getProperty("port1");
				String p2 = properties.getProperty("port2");
				if (p1 != null) {
					PORT1 = Integer.parseInt(p1.trim());
				}
				if (p2 != null) {
					PORT2 = Integer.parseInt(p2.trim());
				}
			}
		} catch (Exception e) {	
			
		}

		int port = PORT1;
		try (ServerSocket socket = new ServerSocket(PORT1)) {
			port = PORT1;
		} catch (IOException e) {
			try (ServerSocket socket = new ServerSocket(PORT2)) {
				port = PORT2;
			} catch (IOException ex	) {
				port = 0;
			}
		}
		System.setProperty("server.port", String.valueOf(port));
		System.out.println("Starting application on port: " + port);
		SpringApplication.run(DistributedChatSystemApplication.class, args);
	}
}
