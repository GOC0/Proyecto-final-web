package db;

import com.mongodb.client.model.Filters;
import dev.morphia.Datastore;
import dev.morphia.query.filters.Filter;
import logic.Usuario;
import org.bson.types.ObjectId;

import java.util.List;

public class usuarioD {

    public static void crearU (Usuario u){
        Datastore d = Conexion.getInstance();
        d.save(u);
    }
    public static void eliminarU(ObjectId id) {
        Datastore datastore = Conexion.getInstance();

        Usuario usuario = datastore.find(Usuario.class)
                .filter((Filter) Filters.eq("_id", id))
                .first();

        if (usuario != null) {
            datastore.delete(usuario);
        }
    }
    public static void updateU(ObjectId id, String nuevoRol) {

        Datastore datastore = Conexion.getInstance();

        Usuario usuario = datastore.find(Usuario.class)
                .filter((Filter) Filters.eq("_id", id))
                .first();

        if (usuario != null) {
            usuario.setRol(nuevoRol);
            datastore.save(usuario);
        }
    }

    public static Usuario buscarU(String name) {
        Datastore datastore = Conexion.getInstance();

        return datastore.find(Usuario.class)
                .filter((Filter) Filters.eq("nombre", name))
                .first();
    }

    public static List<Usuario> listarU() {
        Datastore datastore = Conexion.getInstance();

        return datastore.find(Usuario.class)
                .stream()
                .toList();
    }

}
