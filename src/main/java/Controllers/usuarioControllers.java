package Controllers;

import io.javalin.http.Context;
import logic.Usuario;

import static db.usuarioD.*;

public class usuarioControllers {

    public static void crearUsuario(Context ctx){
        String usuario= ctx.formParam("usuario");
        String password= ctx.formParam("password");
        Usuario u= buscarU(usuario);

        if (u == null) {

            Usuario nuevoUsuario = new Usuario();

            nuevoUsuario.setUsuario(usuario);
            nuevoUsuario.setContrasenia(password);

            crearU(nuevoUsuario);

            ctx.status(201).redirect("/login");

        } else {

            ctx.status(409).result("El usuario ya existe");
        }



    }

    public static void cambiarRol(Context ctx) {

        String usuario = ctx.formParam("usuario");
        String rol = ctx.formParam("rol");

        Usuario u = buscarU(usuario);
        Usuario a = ctx.sessionAttribute("usuario");

        if (a == null) {
            ctx.status(401).result("No has iniciado sesión");
            return;
        }

        if (a.getRol() != "Administrador") {
            ctx.status(403).result("No tienes permisos");
            return;
        }

        if (u == null) {
            ctx.status(404).result("Usuario no encontrado");
            return;
        }

        try {

            updateU(u.getId(), rol);

            ctx.status(200).result("Rol cambiado correctamente");

        } catch (IllegalArgumentException e) {

            ctx.status(400).result("Rol inválido");
        }
    }
    public static void eliminarUsuario(Context ctx) {

        String usuario = ctx.formParam("usuario");

        Usuario u = buscarU(usuario);
        Usuario a = ctx.sessionAttribute("usuario");

        if (a == null) {
            ctx.status(401).result("No has iniciado sesión");
            return;
        }

        if (a.getRol() != "Administrator") {
            ctx.status(403).result("No tienes permisos");
            return;
        }

        if (u == null) {
            ctx.status(404).result("El usuario no existe");
            return;
        }

        eliminarU(u.getId());

        ctx.status(200).result("Usuario eliminado correctamente");
    }
}
