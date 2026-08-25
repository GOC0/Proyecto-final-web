package grpc;

import io.grpc.stub.StreamObserver;

public class FormularioGrpcService
        extends FormularioServiceGrpc.FormularioServiceImplBase {

    @Override
    public void crearFormulario(
            FormularioRequest request,
            StreamObserver<FormularioResponse> responseObserver) {

        System.out.println(
                "Formulario recibido:"
        );

        System.out.println(
                "Nombre: " + request.getNombre()
        );

        System.out.println(
                "Sector: " + request.getSector()
        );

        System.out.println(
                "Nivel: " + request.getNivelEscolar()
        );

        System.out.println(
                "Usuario: " + request.getUsuarioRegis()
        );

        // Aquí posteriormente guardarás en MongoDB

        FormularioResponse respuesta =
                FormularioResponse.newBuilder()
                        .setExitoso(true)
                        .setMensaje(
                                "Formulario creado correctamente"
                        )
                        .build();

        responseObserver.onNext(respuesta);
        responseObserver.onCompleted();
    }


    @Override
    public void listarFormulariosPorUsuario(
            UsuarioRequest request,
            StreamObserver<ListaFormularios> responseObserver) {

        String usuario = request.getUsuario();

        System.out.println(
                "Buscando formularios de: " + usuario
        );


        ListaFormularios respuesta =
                ListaFormularios.newBuilder()
                        .build();

        responseObserver.onNext(respuesta);
        responseObserver.onCompleted();
    }
}