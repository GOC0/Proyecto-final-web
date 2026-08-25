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

        Formulario form = datastore.find(Formulario.class)
                .filter((Filter) Filters.eq("_id", id))
                .first();

        if (form != null) {
            datastore.delete(form);
        }
    }

    public static Formulario buscarForm(ObjectId id) {
        Datastore datastore = Conexion.getInstance();

        return datastore.find(Formulario.class)
                .filter((Filter) Filters.eq("_id", id))
                .first();
    }

    public static List<Formulario> buscarTodoForm() {
        Datastore datastore = Conexion.getInstance();

        return datastore.find(Formulario.class)
                .stream()
                .toList();
    }
    public static List<Formulario> buscarPorUsuario(
            String usuario) {

        Datastore datastore =
                Conexion.getInstance();

        return datastore.find(Formulario.class)
                .filter(
                        (Filter) Filters.eq(
                                "usuarioRegis",
                                usuario
                        )
                )
                .stream()
                .toList();
    }



}
