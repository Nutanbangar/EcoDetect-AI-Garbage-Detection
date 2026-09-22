FROM eclipse-temurin:25-jdk
ENV TZ=Asia/Kolkata
WORKDIR /app

COPY pom.xml .
COPY mvnw .
COPY .mvn .mvn
COPY src ./src

RUN chmod +x mvnw && ./mvnw clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/garbage-detection-0.0.1-SNAPSHOT.jar"]