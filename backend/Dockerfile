FROM maven:3.9.9-eclipse-temurin-21 AS build

WORKDIR /workspace
COPY pom.xml .
COPY src ./src
# Resolve apenas as dependências usadas pelo empacotamento. `dependency:go-offline`
# baixaria plugins e artefatos não utilizados no primeiro deploy.
RUN mvn --batch-mode --no-transfer-progress -DskipTests package

FROM eclipse-temurin:21-jre-jammy

WORKDIR /app
RUN useradd --system --uid 10001 edulead

COPY --from=build /workspace/target/*.jar /app/edulead.jar
USER edulead

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/edulead.jar"]
