package Routes;

import Controllers.formControllers;
import Controllers.loginControllers;
import Controllers.usuarioControllers;
import com.fasterxml.jackson.databind.JsonNode;
import io.javalin.config.RoutesConfig;
import logic.Formulario;
import com.fasterxml.jackson.databind.ObjectMapper;
import logic.JWTUtil;

import static db.formuD.guardarFormulario;

public class Rutas {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void Registrar(RoutesConfig routes) {


        routes.get("/", ctx -> {
            ctx.render("/public/index.html");
        });

        routes.post("/login", loginControllers::Conectarse);

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
                    JsonNode raiz = mapper.readTree(ctx.message());
                    String id = raiz.has("id") ? raiz.get("id").asText() : null;
                    String token = raiz.has("token") ? raiz.get("token").asText(null) : null;
                    String usuario = JWTUtil.validarToken(token);

                    if (usuario == null) {
                        ctx.send("{\"status\":\"ERROR\",\"id\":\"" + id + "\",\"motivo\":\"token invalido o expirado\"}");
                        return;
                    }

                    Formulario formulario = mapper.treeToValue(raiz.get("data"), Formulario.class);
                    guardarFormulario(formulario);
                    ctx.send("{\"status\":\"OK\",\"id\":\"" + id + "\"}");

                } catch (Exception e) {
                    e.printStackTrace();
                    ctx.send("{\"status\":\"ERROR\"}");
                }
            });

            ws.onClose(ctx -> {
                System.out.println("Cliente desconectado");
            });
        });
    }

}
