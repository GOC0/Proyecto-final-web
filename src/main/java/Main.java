import Routes.Rutas;
import io.javalin.Javalin;
import io.javalin.http.staticfiles.Location;
import io.javalin.rendering.template.JavalinThymeleaf;

public class Main {


    static void main(String[] args){


        var app = Javalin.create(config->{
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
