FROM nginx:latest

COPY dist/urna_magica /usr/share/nginx/html

COPY /src/config/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
