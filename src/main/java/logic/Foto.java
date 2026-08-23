package logic;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import org.bson.types.ObjectId;

@Entity
public class Foto {

    @Id
    private ObjectId id;

    private String nombre;
    private String fotoBase64;

    public Foto(){}
    public Foto(String nombre,String fotoBase64){
        this.nombre=nombre;
        this.fotoBase64=fotoBase64;
    }


    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getFotoBase64() {
        return fotoBase64;
    }

    public void setFotoBase64(String fotoBase64) {
        this.fotoBase64 = fotoBase64;
    }
}
