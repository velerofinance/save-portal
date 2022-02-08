FROM node:14.14.0

RUN apt update && apt install -y nginx
#RUN apt install -y uwf
#RUN uwf allow 'Nginx HTTP'
#RUN uwf allow 'Nginx HTTPS'

WORKDIR ./

COPY . .
#RUN npm install -g yarn
RUN yarn && yarn build


RUN mkdir -p /www/public_html/
RUN mv build/* /www/public_html/

COPY conf.d/ /etc/nginx/conf.d/
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80
