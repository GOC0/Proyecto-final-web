package logic;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import org.bson.types.ObjectId;

@Entity
public class Usuario {

    @Id
    private ObjectId id;
    private String usuario;
    private String contrasenia;
    private Rol rol;

    public Usuario() {}
    public Usuario(String usuario,String contrasenia){
        this.usuario=usuario;
        this.contrasenia=contrasenia;
    }
    public Usuario(String usuario,String contrasenia,Rol rol) {
        this.usuario=usuario;
        this.contrasenia=contrasenia;
        this.rol=rol;
    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getUsuario() {
        return usuario;
    }

    public void setUsuario(String usuario) {
        this.usuario = usuario;
    }

    public String getContrasenia() {
        return contrasenia;
    }

    public void setContrasenia(String contrasenia) {
        this.contrasenia = contrasenia;
    }

    public Rol getRol() {
        return rol;
    }

    public void setRol(Rol rol) {
        this.rol = rol;
    }
}
