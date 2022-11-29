FROM node:16

WORKDIR /tmp/
COPY package*.json ./
RUN npm install

WORKDIR /usr/src/app/
COPY . .
RUN cp -a /tmp/node_modules/ ./
RUN npm run webpack-build

CMD ["npm", "server-start"]
EXPOSE 3000