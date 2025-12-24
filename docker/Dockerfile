FROM node:18-alpine

WORKDIR /app

# install dependencis
COPY package*.json ./
RUN npm ci --only=production

# copy app code
COPY . .

# create logs directory
RUN mkdir -p logs

EXPOSE 3000

CMD ["node", "src/app.js"]