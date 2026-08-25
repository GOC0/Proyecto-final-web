package Controllers;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.javalin.http.Context;
import logic.Formulario;
import logic.JWTUtil;
import org.jetbrains.annotations.NotNull;

import java.text.Normalizer;
import java.util.List;

import static db.formuD.*;

public class formControllers {
    private static final ObjectMapper mapper = new ObjectMapper();

    public static void registrarForm (Context ctx){

        String nombre= ctx.formParam("nombre");
        String apellido= ctx.formParam("apellido");
        String sector =ctx.formParam("sector");
        String nivelEscolar= ctx.formParam("nivel");
        String foto = ctx.formParam("foto");
        String latitude = ctx.formParam("latitude");
        String longitude= ctx.formParam("longitude");


        //save ect...

    }

    public static void eliminarForm(Context ctx){
        String id = ctx.formParam("id");

        //buscar form

    }

    public static void listaForm(Context ctx){
        List<Formulario> f = buscarTodoForm();

    }


    public static void crearFormularioAPI(@NotNull Context ctx) {
        try {

            String token = ctx.header("Authorization");

            if (token == null || !token.startsWith("Bearer ")) {
                ctx.status(401).result("Token requerido");
                return;
            }

            token = token.substring(7);

            String usuario =
                    JWTUtil.validarToken(token);

            if (usuario == null) {
                ctx.status(401).result("Token inválido");
                return;
            }

            Formulario formulario =
                    mapper.readValue(
                            ctx.body(),
                            Formulario.class
                    );

            formulario.setUsuarioRegis(usuario);

            guardarFormulario(formulario);

            ctx.status(201).json(formulario);

        } catch (Exception e) {

            e.printStackTrace();

            ctx.status(500)
                    .result("Error creando formulario");
        }
    }
    public static void listarPorUsuario(Context ctx) {

        String token = ctx.header("Authorization");

        if (token == null || !token.startsWith("Bearer ")) {
            ctx.status(401).result("Token requerido");
            return;
        }

        token = token.substring(7);

        String usuario = JWTUtil.validarToken(token);

        if (usuario == null) {
            ctx.status(401).result("Token inválido");
            return;
        }

        List<Formulario> formularios =
                buscarPorUsuario(usuario);

        ctx.json(formularios);
    }
}
