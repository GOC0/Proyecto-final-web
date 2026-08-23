package db;

import com.mongodb.client.model.Filters;
import dev.morphia.Datastore;
import dev.morphia.query.filters.Filter;
import logic.Formulario;
import org.bson.types.ObjectId;

import java.text.Normalizer;
import java.util.List;

public class formuD {

    public static void guardarFormulario(Formulario form){

        Datastore datastore = Conexion.getInstance();

        datastore.save(form);
    }

    public static void eliminarForm(ObjectId id) {
        Datastore datastore = Conexion.getInstance();

        datastore.delete(
                datastore.find(Formulario.class)
                        .filter((Filter) Filters.eq("_id", id))
                        .first()
        );
    }

    public static Formulario buscarForm (ObjectId id){
        return null;
    }


    public static List<Formulario> buscarTodoForm(){

        return null;
    }




}
