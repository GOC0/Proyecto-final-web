package Routes;

import Controllers.formControllers;
import Controllers.loginControllers;
import Controllers.usuarioControllers;
import io.javalin.config.RoutesConfig;

public class Rutas {

    public static void Registrar (RoutesConfig routes){



        routes.post("/login", loginControllers::Login );
        routes.post("/registrarFormulario", formControllers::registrarForm);
        routes.post("/crearUsuario", usuarioControllers::crearUsuario);
        routes.post("/cerrarSession",loginControllers::cerraSession);

        routes.patch("/cambiarRol", usuarioControllers::cambiarRol);


        routes.delete("/eliminarForm",formControllers::eliminarForm);
        routes.delete("/eliminarUsuario",usuarioControllers::eliminarUsuario);




    }
}
