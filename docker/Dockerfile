FROM node:lts-alpine

WORKDIR /app

COPY package.json .
COPY auth/package.json auth/
COPY common/package.json common/

# prod
# RUN npm i --only=prod -w customer -w common

# dev
RUN npm i -w auth -w common

COPY auth auth
COPY common common

CMD npm start -w auth