# ==============================================================================
# Build stage
# ==============================================================================
FROM eclipse-temurin:17-jdk-alpine AS builder
WORKDIR /workspace

# Cache Maven wrapper and dependencies
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw dependency:go-offline -B

# Build application
COPY src/ src/
RUN ./mvnw clean package -DskipTests -B

# ==============================================================================
# Runtime stage
# ==============================================================================
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Create non-root user for security
RUN addgroup -S rentflow && adduser -S rentflow -G rentflow
USER rentflow:rentflow

COPY --from=builder /workspace/target/*.jar app.jar

ENV SERVER_PORT=8080
ENV SPRING_PROFILES_ACTIVE=prod

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=5s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/v1/health/live || exit 1

ENTRYPOINT ["java", "-XX:+UseContainerSupport", "-XX:MaxRAMPercentage=75.0", "-jar", "app.jar"]
