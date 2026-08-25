package Routes;

import Controllers.formControllers;
import Controllers.loginControllers;
import Controllers.usuarioControllers;
import io.javalin.config.RoutesConfig;
import logic.Formulario;
import com.fasterxml.jackson.databind.ObjectMapper;
import static db.formuD.guardarFormulario;

public class Rutas {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void Registrar(RoutesConfig routes) {


        routes.get("/", ctx -> {
            ctx.render("/public/index.html");
        });

        routes.post("/login",loginControllers::Conectarse);

        routes.post("/registrarFormulario", formControllers::registrarForm);
        routes.post("/crearUsuario", usuarioControllers::crearUsuario);
        routes.post("/cerrarSession", loginControllers::cerraSession);

        routes.patch("/cambiarRol", usuarioControllers::cambiarRol);
        routes.post(
                "/api/formularios",
                formControllers::crearFormularioAPI
        );
        routes.get(
                "/api/formularios/mis-formularios",
                formControllers::listarPorUsuario
        );
        routes.delete("/eliminarForm", formControllers::eliminarForm);
        routes.delete("/eliminarUsuario", usuarioControllers::eliminarUsuario);


        routes.ws("/ws/formularios", ws -> {

            ws.onConnect(ctx -> {
                System.out.println("Cliente conectado");
            });

            ws.onMessage(ctx -> {

                try {

                    String mensaje = ctx.message();

                    System.out.println("JSON recibido:");
                    System.out.println(mensaje);

                    Formulario formulario =
                            mapper.readValue(
                                    mensaje,
                                    Formulario.class
                            );

                    guardarFormulario(formulario);

                    ctx.send("OK");

                } catch (Exception e) {

                    e.printStackTrace();

                    ctx.send("ERROR");
                }
            });

            ws.onClose(ctx -> {
                System.out.println("Cliente desconectado");
            });
        });
    }

}
