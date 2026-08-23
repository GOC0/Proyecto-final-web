package Controllers;

import io.javalin.http.Context;

public class loginControllers {

    public static void Login (Context ctx){
        String usuario= ctx.formParam("usuario");
        String password= ctx.formParam("password");


    }

    public static void cerraSession(Context ctx){

    }



}
