FROM alpine:latest

RUN apk add --no-cache php7

COPY src/ /app

WORKDIR "/app"

RUN chmod +x hello.php

CMD ["php", "hello.php"];