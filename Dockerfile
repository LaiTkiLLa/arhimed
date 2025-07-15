FROM node:21-alpine

WORKDIR /app

# Копируем package.json и package-lock.json в рабочую директорию
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

#Копируем все в рабочую директорию
COPY . .

# Компилируем TypeScript
RUN npm run build

CMD ["npm", "run", "start:prod"]