package grpc;

import db.formuD;
import io.grpc.stub.StreamObserver;
import logic.Formulario;

import java.util.List;

public class FormularioGrpcService extends FormularioServiceGrpc.FormularioServiceImplBase {

    @Override
    public void crearFormulario(
            FormularioRequest request,
            StreamObserver<FormularioResponse> responseObserver) {

        try {
            Formulario formulario = new Formulario(
                    request.getNombre(),
                    request.getSector(),
                    request.getNivelEscolar(),
                    request.getFoto(),
                    request.getLatitude(),
                    request.getLongitude(),
                    request.getUsuarioRegis()
            );

            formuD.guardarFormulario(formulario);

            FormularioResponse respuesta = FormularioResponse.newBuilder()
                    .setExitoso(true)
                    .setMensaje("Formulario creado correctamente en la base de datos")
                    .build();

            responseObserver.onNext(respuesta);
            responseObserver.onCompleted();

        } catch (Exception e) {
            e.printStackTrace();
            FormularioResponse respuesta = FormularioResponse.newBuilder()
                    .setExitoso(false)
                    .setMensaje("Error al guardar formulario: " + e.getMessage())
                    .build();

            responseObserver.onNext(respuesta);
            responseObserver.onCompleted();
        }
    }

    @Override
    public void listarFormulariosPorUsuario(
            UsuarioRequest request,
            StreamObserver<ListaFormularios> responseObserver) {

        try {
            String usuario = request.getUsuario();
            List<Formulario> formulariosBD = formuD.buscarPorUsuario(usuario);

            ListaFormularios.Builder listaBuilder = ListaFormularios.newBuilder();

            for (Formulario f : formulariosBD) {
                grpc.Formulario protoForm = grpc.Formulario.newBuilder()
                        .setId(f.getId() != null ? f.getId().toHexString() : "")
                        .setNombre(f.getNombre() != null ? f.getNombre() : "")
                        .setSector(f.getSector() != null ? f.getSector() : "")
                        .setNivelEscolar(f.getNivelEscolar() != null ? f.getNivelEscolar() : "")
                        .setUsuarioRegis(f.getUsuarioRegis() != null ? f.getUsuarioRegis() : "")
                        .setFoto(f.getFoto() != null ? f.getFoto() : "")
                        .setLatitude(f.getLatitude() != null ? f.getLatitude() : "")
                        .setLongitude(f.getLongitude() != null ? f.getLongitude() : "")
                        .build();

                listaBuilder.addFormulario(protoForm);
            }

            responseObserver.onNext(listaBuilder.build());
            responseObserver.onCompleted();

        } catch (Exception e) {
            e.printStackTrace();
            responseObserver.onError(e);
        }
    }
}