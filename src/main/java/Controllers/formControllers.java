package Controllers;

import io.javalin.http.Context;
import logic.Formulario;

import java.text.Normalizer;
import java.util.List;

import static db.formuD.buscarTodoForm;

public class formControllers {

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




}
