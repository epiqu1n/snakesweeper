FROM node:16
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
# or
# RUN npm ci --only=production

COPY . .
EXPOSE 8080
# or
# EXPOSE 3000

CMD ["npm", "run", "dev"]