import com.google.protobuf.gradle.id

plugins {
    id("java")
    id("application")
    id ("com.google.protobuf") version "0.9.5"
}

group = "frame"
version = "1.0-SNAPSHOT"

repositories {
    mavenCentral()
}

application{
    mainClass.set("Main")
}

dependencies {
    testImplementation(platform("org.junit:junit-bom:5.10.0"))
    testImplementation("org.junit.jupiter:junit-jupiter")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher")

    implementation("io.javalin:javalin:7.2.2")
    implementation("com.fasterxml.jackson.core:jackson-core:2.21.1")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.15.2")
    implementation("com.fasterxml.jackson.core:jackson-annotations:2.15.2")
    implementation("com.fasterxml.jackson.datatype:jackson-datatype-jsr310:2.17.0")
    implementation("io.javalin:javalin-rendering-thymeleaf:7.2.2")
    implementation("org.slf4j:slf4j-simple:2.0.10")
    implementation("com.fasterxml.jackson.core:jackson-databind:2.16.1")

    implementation("io.jsonwebtoken:jjwt-api:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-impl:0.12.6")
    runtimeOnly("io.jsonwebtoken:jjwt-jackson:0.12.6")

    implementation("dev.morphia.morphia:morphia-core:2.4.11")

    implementation("org.jsoup:jsoup:1.15.3")

    implementation("io.grpc:grpc-netty-shaded:1.75.0")
    implementation("io.grpc:grpc-protobuf:1.66.0")
    implementation("io.grpc:grpc-stub:1.66.0")
    compileOnly("org.apache.tomcat:annotations-api:6.0.53")
}
protobuf {
    protoc {
        artifact = "com.google.protobuf:protoc:3.25.5"
    }

    plugins {
        id("grpc") {
            artifact = "io.grpc:protoc-gen-grpc-java:1.66.0"
        }
    }

    generateProtoTasks {
        all().configureEach {
            plugins {
                id("grpc")
            }
        }
    }
}

tasks.test {
    useJUnitPlatform()
}