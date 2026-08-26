FROM gradle:9.2-jdk25 AS builder
WORKDIR /app

COPY build.gradle.kts settings.gradle.kts ./
COPY gradle ./gradle
RUN gradle --no-daemon dependencies || true

COPY . .
RUN gradle clean shadowJar --no-daemon

FROM eclipse-temurin:25-jre
WORKDIR /app

COPY --from=builder /app/build/libs/*.jar app.jar

EXPOSE 7000
EXPOSE 50051

ENTRYPOINT ["java", "-jar", "app.jar"]