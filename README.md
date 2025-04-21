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