package db;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import dev.morphia.Datastore;
import dev.morphia.Morphia;

public class Conexion {

    private static final String CONNECTION_STRING =
            "mongodb+srv://cxce0001_db_user:cxce0001_db_user@cluster0.1ekpkae.mongodb.net/?appName=Cluster0";

    private static final String DATABASE_NAME = "miBaseDeDatos";

    private static Datastore datastore;
    private static MongoClient mongoClient;

    private Conexion() {
    }

    public static synchronized Datastore getInstance() {

        if (datastore == null) {

            mongoClient = MongoClients.create(CONNECTION_STRING);

            datastore = Morphia.createDatastore(
                    mongoClient,
                    DATABASE_NAME
            );
        }

        return datastore;
    }

    public static void close() {
        if (mongoClient != null) {
            mongoClient.close();
            mongoClient = null;
            datastore = null;
        }
    }



}
