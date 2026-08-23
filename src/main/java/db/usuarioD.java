package db;

import com.mongodb.client.model.Filters;
import dev.morphia.Datastore;
import dev.morphia.query.filters.Filter;
import logic.Formulario;
import logic.Usuario;
import org.bson.types.ObjectId;

public class usuarioD {

    public static void crearU (Usuario u){
        Datastore d = Conexion.getInstance();

        d.save(u);
    }

    public static void eliminarU (ObjectId id){
        Datastore datastore = Conexion.getInstance();

        datastore.delete(
                datastore.find(Usuario.class)
                        .filter((Filter) Filters.eq("_id", id))
                        .first()
        );
    }

    public static void buscarU (String name){

    }

}
