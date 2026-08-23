import Routes.Rutas;
import db.Conexion;
import dev.morphia.Datastore;
import io.javalin.Javalin;
import io.javalin.config.RoutesConfig;
import io.javalin.http.staticfiles.Location;
import io.javalin.rendering.template.JavalinThymeleaf;
import logic.Rol;
import logic.Usuario;

import java.lang.module.Configuration;

import static db.usuarioD.crearU;

public class Main {

    static void main(String[] args){


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
