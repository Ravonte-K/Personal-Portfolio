FROM node:20-alpine

WORKDIR /app

ARG NEXT_PUBLIC_API_URL=https://ml-project-api.fly.dev
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV PORT=3000

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

CMD ["sh", "-c", "npm run start -- -H 0.0.0.0 -p ${PORT}"]
