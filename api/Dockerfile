FROM "golang:1.25-alpine"

WORKDIR /app

COPY api/go.mod api/go.sum ./
RUN go mod download

COPY api/ .
RUN CGO_ENABLED=0 GOOS=linux go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates

WORKDIR /root/
COPY --from=0 /app/main .
RUN chmod +x ./main

EXPOSE 8080
CMD ["./main"]



