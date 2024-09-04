## BOOK APP

### requirements
- docker
- docker-compose
- express
- mongoose,
- ejs,
- multer,
- uuid

### app functions:
- add book
- edit book
- remove book
- upload book image
- download book image

### repo:
- https://github.com/ShulaevIvan/book_api
- https://github.com/ShulaevIvan/books_counter_node

### req docker images:
- [book_api](https://hub.docker.com/repository/docker/shulaevivan/book_api/general)
- [book_api_counter](https://hub.docker.com/repository/docker/shulaevivan/book_api_counter/general)
- [mongodb-community-server](https://hub.docker.com/r/mongodb/mongodb-community-server)

### BOOK API METHODS

| Method | URL| Action | Comment |
|----------|----------|----------| ---------- |
| GET    | /api/books   | Получить все книги   | Получаем массив всех книг |
| GET    | /api/books/:id   | Получить книгу по ID   | Получаем объект книги, если запись не найдена, вернём Code: 404 |
| POST    | /api/books   | Создать книгу   | Создаём книгу и возвращаем её же вместе с присвоенным ID |
| PUT    | /api/books/:id   | Редактировать книгу по ID   | Редактируем объект книги, если запись не найдена, вернём Code: 404 |
| DELETE    | /api/books/:id   | Удалить книгу по ID  | Удаляем книгу и возвращаем ответ: 'ok' |

### run

docker-compose up
