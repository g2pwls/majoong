FROM openjdk:17-alpine
RUN apk add --no-cache ca-certificates tzdata && update-ca-certificates

WORKDIR /app
COPY build/libs/*.jar ./app.jar
ENTRYPOINT ["java","-jar","-Duser.timezone=Asia/Seoul","app.jar"]
 