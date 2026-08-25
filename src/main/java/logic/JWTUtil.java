package logic;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import java.nio.charset.StandardCharsets;
import java.util.Date;

public class JWTUtil {

    private static final String SECRET =
            "una-clave-secreta";

    public static String generarToken(Usuario usuario) {

        return Jwts.builder()
                .subject(usuario.getUsuario())
                .claim("rol", usuario.getRol())
                .issuedAt(new Date())
                .expiration(
                        new Date(
                                System.currentTimeMillis()
                                        + 1000 * 60 * 60
                        )
                )
                .signWith(Keys.hmacShaKeyFor(
                        SECRET.getBytes()
                ))
                .compact();
    }

    public static String validarToken(String token) {

        try {

            Claims claims = Jwts.parser()
                    .verifyWith(
                            Keys.hmacShaKeyFor(
                                    SECRET.getBytes(StandardCharsets.UTF_8)
                            )
                    )
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            return claims.getSubject();

        } catch (JwtException | IllegalArgumentException e) {

            return null;
        }
    }
}
