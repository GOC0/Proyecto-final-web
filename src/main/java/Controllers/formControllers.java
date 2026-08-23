package Controllers;

import io.javalin.http.Context;
import logic.Formulario;
import logic.Foto;

public class formControllers {

    public static void registrarForm (Context ctx){

        String nombre= ctx.formParam("nombre");
        String apellido= ctx.formParam("apellido");
        String sector =ctx.formParam("sector");
        String nivelEscolar= ctx.formParam("nivel");
        String foto = ctx.formParam("foto");
        String latitude = ctx.formParam("latitude");
        String longitude= ctx.formParam("longitude");

        String usuario= ctx.sessionAttribute("usuario");

        Foto f = new Foto(nombre,foto);
        Formulario form= new Formulario(nombre,apellido,sector,nivelEscolar,f,latitude,longitude,usuario);

        //save ect...

    }

    public static void eliminarForm(Context ctx){
        String id = ctx.formParam("id");

        //buscar form

    }

}
