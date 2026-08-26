package grpc;


import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;

public class ClienteGrpcTest {

    public static void main(String[] args) {
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 50051)
                .usePlaintext()
                .build();

        FormularioServiceGrpc.FormularioServiceBlockingStub stub =
                FormularioServiceGrpc.newBlockingStub(channel);

        // Probar crear formulario
        FormularioRequest request = FormularioRequest.newBuilder()
                .setNombre("Carlos Santana")
                .setSector("Los Jardines")
                .setNivelEscolar("Grado Universitario")
                .setUsuarioRegis("admin")
                .setFoto("")
                .setLatitude("19.4517")
                .setLongitude("-70.6970")
                .build();

        FormularioResponse response = stub.crearFormulario(request);
        System.out.println("Respuesta creacion: " + response.getMensaje());

        // Probar listar formularios
        UsuarioRequest userReq = UsuarioRequest.newBuilder()
                .setUsuario("admin")
                .build();

        ListaFormularios lista = stub.listarFormulariosPorUsuario(userReq);
        System.out.println("Formularios encontrados para admin: " + lista.getFormularioCount());

        for (Formulario f : lista.getFormularioList()) {
            System.out.println(" -> " + f.getNombre() + " (" + f.getSector() + ")");
        }

        channel.shutdown();
    }
}
