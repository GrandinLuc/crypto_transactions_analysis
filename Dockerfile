# FROM node:16

# WORKDIR /usr

# COPY package.json ./
# COPY tsconfig.json ./
# COPY src ./src
# COPY transactions-1.json ./
# COPY transactions-2.json ./

# RUN npm install
# RUN npm run build

# COPY build ./build

# CMD ["npm","run","start"]

FROM node:16 AS builder

WORKDIR /usr/src/app

COPY package.json ./
COPY tsconfig.json ./
COPY ./src ./src
RUN npm install
RUN npm run build

FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
COPY transactions-1.json ./
COPY transactions-2.json ./
COPY --from=builder /usr/src/app/build ./build

CMD ["npm","run","start"]