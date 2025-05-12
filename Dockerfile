FROM nginx:latest

COPY dist/votup /usr/share/nginx/html

COPY /src/config/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
