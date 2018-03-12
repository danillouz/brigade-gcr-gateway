FROM golang:1.10 AS build
WORKDIR /go/src/github.com/danillouz/app/
RUN go get github.com/gin-gonic/gin
COPY server.go .
RUN CGO_ENABLED=0 GOOS=linux go build .

FROM scratch
COPY --from=build /go/src/github.com/danillouz/app .
ENTRYPOINT [ "/app" ]