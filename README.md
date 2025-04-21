# Скрипт для запуска postgres контейнера
docker-compose up

# Скрипт для удаления postgres контейнера
docker-compose down

# Создание новой миграции
npx sequelize-cli model:generate --name User --attributes name:string,email:string

# Накатить миграцию
npx sequelize-cli db:migrate

# Откат миграции
npx sequelize-cli db:migrate:undo

## Запуск приложения 
1) переименовать .env.example в .env
2) npm i
3) docker-compose up
4) npx sequelize-cli db:migrate
5) npm run start:dev