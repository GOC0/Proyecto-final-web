package Controllers;

import io.javalin.http.Context;
import logic.Rol;
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

        if (a.getRol() != Rol.Administrador) {
            ctx.status(403).result("No tienes permisos");
            return;
        }

        if (u == null) {
            ctx.status(404).result("Usuario no encontrado");
            return;
        }

        try {

            Rol nuevoRol = Rol.valueOf(rol);

            updateU(u.getId(), nuevoRol);

            ctx.status(200).result("Rol cambiado correctamente");

        } catch (IllegalArgumentException e) {

            ctx.status(400).result("Rol inválido");
        }
    }

    public static void eliminarUsuario (Context ctx){
        String usuario= ctx.formParam("usuario");
        Usuario u= buscarU(usuario);
        Usuario a = ctx.sessionAttribute("usuario");

        if (a.getRol() != Rol.Administrador) {
            ctx.status(403).result("No tienes permisos");
            return;
        }
        if (u != null) {
            eliminarU(u.getId());
        }else{
            ctx.status(409).result("El usuario no existe");
            return;
        }

    }

}
