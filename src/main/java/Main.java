import Routes.Rutas;
import db.Conexion;
import io.javalin.Javalin;
import io.javalin.config.RoutesConfig;
import io.javalin.http.staticfiles.Location;
import io.javalin.rendering.template.JavalinThymeleaf;

import java.lang.module.Configuration;

public class Main {

    static void main(String[] args){

        try{
            Conexion.getInstance();
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
        Conexion.close();

        var app = Javalin.create(config->{
            config.staticFiles.add(staticFileConfig -> {
                staticFileConfig.hostedPath = "/";
                staticFileConfig.directory = "/publico";
                staticFileConfig.location = Location.CLASSPATH;
                staticFileConfig.aliasCheck = null;
            });

            config.fileRenderer(new JavalinThymeleaf());
            Rutas.Registrar(config.routes);

        }).start(7000);
   }
}
