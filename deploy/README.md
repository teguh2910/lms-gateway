# LMS Deployment

Orchestration files for running the full LMS microservices stack with Docker Compose.

## Layout

These files expect all service repositories to be checked out as siblings in a
single parent directory:

```
lms/
├── docker-compose.yml        # copied from deploy/docker-compose.yml
├── Makefile                  # copied from deploy/Makefile
├── docker/postgres/init.sql  # copied from deploy/docker/postgres/init.sql
├── lms-gateway/
├── lms-class-services/
├── lms-conference-services/
├── lms-material-services/
├── lms-quiz-services/
├── lms-task-services/
├── lms-post-services/
├── lms-storage-service/
└── user-services/
```

Copy the contents of this `deploy/` folder into that parent directory before running.

## Services & ports

| Service                  | Host port | Container port |
|--------------------------|-----------|----------------|
| lms-gateway (+frontend)  | 8080      | 8080           |
| lms-class-services       | 8001      | 8000           |
| lms-conference-services  | 8002      | 8000           |
| lms-material-services    | 8003      | 8000           |
| lms-quiz-services        | 8004      | 8000           |
| lms-task-services        | 8005      | 8000           |
| lms-post-services        | 8006      | 8000           |
| lms-storage-service      | 8007      | 8000           |
| user-services            | 8008      | 8000           |
| postgres                 | 5432      | 5432           |
| redis                    | 6379      | 6379           |

## Usage

```bash
make build     # build all images
make up        # start all containers
make migrate   # run database migrations for every service
make seed      # seed initial data (creates default admin user)
make logs      # tail logs
make ps        # list containers
make down      # stop containers
make clean     # stop and remove volumes
```

## Default credentials

After `make seed`, log in to the frontend at http://localhost:8080 with:

- **Email:** admin@lms.com
- **Password:** admin123

## Environment

Each service reads its own `.env` file (see each repo's `env.example`).
For Docker the relevant values point at the `postgres` and `redis` service
names on the shared `lms-network`. The user service requires a `JWT_SECRET`.
