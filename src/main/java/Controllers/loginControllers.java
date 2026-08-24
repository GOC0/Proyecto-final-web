package Controllers;

import io.javalin.http.Context;
import logic.Usuario;

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

}
