FROM mysql/mysql-server:8.0

ENV MYSQL_DATABASE=laravel \
  MYSQL_USER=mysql \
  MYSQL_PASSWORD=BLfgjxdm68 \
  MYSQL_ROOT_PASSWORD=BLfgjxdm68 \
  TZ=Asia/Tokyo

COPY ./my.cnf /etc/my.cnf
COPY ./init.sql /docker-entrypoint-initdb.d/init.sql
RUN chmod 644 /etc/my.cnf