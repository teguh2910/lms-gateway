up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose build

logs:
	docker compose logs -f

restart:
	docker compose restart

migrate:
	docker compose exec lms-class-services ./cli migrate
	docker compose exec lms-conference-services ./cli migrate
	docker compose exec lms-material-services ./cli migrate
	docker compose exec lms-quiz-services ./cli migrate
	docker compose exec lms-task-services ./cli migrate
	docker compose exec lms-post-services ./cli migrate
	docker compose exec lms-storage-service ./cli migrate

seed:
	docker compose exec lms-class-services ./cli seed
	docker compose exec lms-conference-services ./cli seed
	docker compose exec lms-material-services ./cli seed
	docker compose exec lms-quiz-services ./cli seed
	docker compose exec lms-task-services ./cli seed
	docker compose exec lms-post-services ./cli seed
	docker compose exec lms-storage-service ./cli seed

ps:
	docker compose ps

clean:
	docker compose down -v

.PHONY: up down build logs restart migrate seed ps clean
