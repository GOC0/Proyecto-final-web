package Controllers;

import com.mongodb.client.model.Filters;
import db.Conexion;
import dev.morphia.Datastore;
import dev.morphia.query.filters.Filter;
import io.javalin.http.Context;
import logic.Usuario;
import org.jetbrains.annotations.NotNull;

import java.util.HashMap;
import java.util.Map;

import static db.usuarioD.buscarU;

public class loginControllers {

    public static void Login(Context ctx) {

        String usuario = ctx.formParam("usuario");
        String password = ctx.formParam("password");

        Usuario u = buscarU(usuario);

        if (u != null && u.getContrasenia().equals(password)) {

            ctx.sessionAttribute("usuario", u);
            ctx.redirect("/dashboard");

        } else {
            ctx.status(401);
            ctx.redirect("/login");
        }
    }

    public static void cerraSession(Context ctx) {

        ctx.sessionAttribute("usuario", null);
        ctx.redirect("/login");
    }

    public static void Conectarse(@NotNull Context context) {
        String usuario = context.formParam("usuario");
        String password = context.formParam("password");

        if (usuario == null || password == null || usuario.isBlank() || password.isBlank()) {
            context.status(400).result("usuario y password son requeridos");
            return;
        }

        Datastore datastore = Conexion.getInstance();

        Usuario usuarioEncontrado = datastore.find(Usuario.class)
                .filter((Filter) Filters.eq("usuario", usuario))
                .first();

        if (usuarioEncontrado == null) {
            context.status(401).result("usuario no encontrado");
            return;
        }

        if (!usuarioEncontrado.getContrasenia().equals(password)) {
            context.status(401).result("credenciales invalidas");
            return;
        }

        // devolvemos el rol real desde la BD, no dejar que el cliente lo infiera
        Map<String, String> respuesta = new HashMap<>();
        respuesta.put("usuario", usuarioEncontrado.getUsuario());
        respuesta.put("rol", usuarioEncontrado.getRol());

        context.status(200).json(respuesta);
    }
}
