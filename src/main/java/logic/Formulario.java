package logic;

import dev.morphia.annotations.Entity;
import dev.morphia.annotations.Id;
import org.bson.types.ObjectId;

import java.text.Normalizer;

@Entity
public class Formulario {
    @Id
    private ObjectId id;

    private String nombre;
    private String apellido;
    private String sector;
    private String nivelEscolar;
    private String usuarioRegis;

    private String foto;
    private String latitude;
    private String longitude;

    public Formulario(){}
    public Formulario(String nombre, String apellido, String sector, String nivelEscolar,String foto, String latidude, String longitude,String usuarioRegis){
        this.nombre=nombre;
        this.apellido= apellido;
        this.nivelEscolar= nivelEscolar;
        this.foto=foto;
        this.latitude= latidude;
        this.longitude= longitude;
        this.usuarioRegis= usuarioRegis;

    }
    public Formulario(String nombre, String apellido, String sector, String nivelEscolar,String foto, String latidude, String longitude){
        this.nombre=nombre;
        this.apellido= apellido;
        this.nivelEscolar= nivelEscolar;
        this.foto=foto;
        this.latitude= latidude;
        this.longitude= longitude;

    }

    public ObjectId getId() {
        return id;
    }

    public void setId(ObjectId id) {
        this.id = id;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }

    public String getApellido() {
        return apellido;
    }

    public void setApellido(String apellido) {
        this.apellido = apellido;
    }

    public String getSector() {
        return sector;
    }

    public void setSector(String sector) {
        this.sector = sector;
    }

    public String getNivelEscolar() {
        return nivelEscolar;
    }

    public void setNivelEscolar(String nivelEscolar) {
        this.nivelEscolar = nivelEscolar;
    }

    public String getUsuarioRegis() {
        return usuarioRegis;
    }

    public void setUsuarioRegis(String usuarioRegis) {
        this.usuarioRegis = usuarioRegis;
    }


    public String getFoto() {
        return foto;
    }

    public void setFoto(String foto) {
        this.foto = foto;
    }

    public String getLatitude() {
        return latitude;
    }

    public void setLatitude(String latitude) {
        this.latitude = latitude;
    }

    public String getLongitude() {
        return longitude;
    }

    public void setLongitude(String longitude) {
        this.longitude = longitude;
    }
}
