import Routes.Rutas;
import grpc.FormularioGrpcService;
import io.grpc.Server;
import io.grpc.ServerBuilder;
import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import io.javalin.rendering.template.JavalinThymeleaf;

import java.io.IOException;

public class Main {

    public static void main(String[] args) throws IOException {

        // 1. Inicializar servidor gRPC en el puerto 50051
        int grpcPort = 50051;
        Server grpcServer = ServerBuilder.forPort(grpcPort)
                .addService(new FormularioGrpcService())
                .build()
                .start();

        System.out.println("Servidor gRPC iniciado en el puerto: " + grpcPort);

        // Hook para cerrar el servidor gRPC al detener la app
        Runtime.getRuntime().addShutdownHook(new Thread(() -> {
            System.out.println("Cerrando servidor gRPC...");
            if (grpcServer != null) {
                grpcServer.shutdown();
            }
        }));

        // 2. Inicializar servidor Javalin
        var app = Javalin.create(config -> {
            config.staticFiles.add(staticFileConfig -> {
                staticFileConfig.hostedPath = "/";
                staticFileConfig.directory = "/public";
                staticFileConfig.location = Location.CLASSPATH;
                staticFileConfig.aliasCheck = null;
            });

            config.fileRenderer(new JavalinThymeleaf());
            Rutas.Registrar(config.routes);

        }).start(7000);
    }
}