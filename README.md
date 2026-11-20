# Room Booking System (RBS)

A custom-tailored web application designed for an educational institution to manage classroom assignments, synchronize teacher schedules from Google Calendar, and render real-time schedule boards on individual room tablets and a central 4K overview monitor.

Because this system is purpose-built around the client's internal ERP/calendar workflow, it only processes Google Calendar events that follow a strict naming and metadata convention described below.

## Tech Stack
- **Backend:** Python 3.11, Django 5.2, Django REST Framework, `drf-spectacular` (OpenAPI 3 / Swagger), Gunicorn, WhiteNoise, Google Calendar API and People API (OAuth2 + Service Account).
- **Frontend:** React 19, Vite 6, Ant Design 5, TailwindCSS 4, FullCalendar 6, Axios, Nginx.
- **Database:** PostgreSQL 16.
- **Infrastructure:** Docker, Docker Compose.

---

## Google Calendar Event Format Requirements

The synchronization engine (`POST /api/v1/refresh-events`) queries the Google Calendars of all registered teachers and parses only events that conform to the client's specific schema. Events missing required delimiters or identifiers are skipped or cannot be rendered properly on the display monitors.

### 1. Event Title (`Summary`)
The event title must consist of **four segments** separated by `' - '` (space, hyphen, space):

```text
<Trainer Full Name> - <Course Title> - <Participant / Subtitle> - <Count> PERSON
```

**Example:**
```text
John Doe - Web Development Course -  - 1 PERSON
```

**How each segment is used:**
1. `<Trainer Full Name>` (`split(' - ')[0]`): Must contain at least a first name and last name separated by a space (e.g., `John Doe`). The room monitor displays the full name, while the central overview monitor formats it as `<First Name> <Last Initial>.` (e.g., `John D.`).
2. `<Course Title>` (`split(' - ')[1]`): Main course or lesson name (e.g., `Web Development Course`).
3. `<Participant / Subtitle>` (`split(' - ')[2]`): Optional subtitle or participant info (can be empty between delimiters, e.g., `-  -`). Appended to the course title on individual room monitors.
4. `<Count> PERSON` (`split(' - ')[3]`): Starts with an integer representing participant count followed by a space (e.g., `1 PERSON` or `5 PERSON`). The central overview monitor uses this number to classify the session as `Einzelkurs` (1 person) or `Gruppenkurs` (>1 person).

### 2. Event Description (`Description`)
The event description must contain the substring `ID:` followed by a unique event identifier. The backend extracts the substring after `ID:` (`description.split('ID:')[-1]`) and uses it as the primary key in the database.

**Template:**
```text
Kursname: <Course Title> - Teilnehmer: <Participants> - Trainer: <Trainer Full Name> - ID:<UniqueEventID>
```

**Example:**
```text
Kursname: Web Development Course - Teilnehmer: - Trainer: John Doe - ID:1234567890
```

### 3. Sample Import File (`event.example.ics`)
Google Calendar uses the standard iCalendar (`.ics`) format for importing and exporting events. A ready-to-import example file is provided in the repository root at `event.example.ics`.

To import `event.example.ics` into Google Calendar:
1. Open Google Calendar in a browser.
2. Click the gear icon (Settings) -> **Import & export**.
3. Under **Import**, select `event.example.ics` from the repository root and choose the target teacher calendar.
4. Click **Import**, then click **Refresh** in the RBS Calendar UI to synchronize the event.

---

## Production Deployment (Docker Compose)

### 1. Environment Configuration
Copy `.env.example` to `.env` in the repository root and configure the variables (this single `.env` file is used by the backend, frontend build, and PostgreSQL container):
```bash
cp .env.example .env
```
Ensure that the Google Service Account credentials file (`key.json`) is placed at `backend/key.json`.

### 2. Build and Start Containers
Run the following command from the repository root:
```bash
docker compose up --build -d
```

Services will be available at:
- **Frontend (Nginx / React production build):** http://localhost:5180
- **Backend API (Django / Gunicorn, `DEBUG=False`):** http://localhost:8005
- **Swagger UI (OpenAPI documentation):** http://localhost:8005/api/docs/swagger/
- **OpenAPI Schema:** http://localhost:8005/api/schema/
- **PostgreSQL:** `localhost:5455` (persisted in Docker volume `postgres_data`)

### 3. Database Migration from an Existing PostgreSQL Instance
To migrate existing users (`user_user`) and events (`event_event`) from a host PostgreSQL database into the Docker PostgreSQL container:

1. Export data from the existing database:
```bash
pg_dump -U <OLD_DB_USER> -h localhost -d <OLD_DB_NAME> --data-only -t user_user -t event_event > prod_data.sql
```

2. Import the dump into the running `rbs_postgres` container:
```bash
cat prod_data.sql | docker exec -i rbs_postgres psql -U <DB_USER> -d <DB_NAME>
```

### 4. Stop Containers
```bash
docker compose down
```
To stop containers and remove the database volume:
```bash
docker compose down -v
```

---

## Local Development (Without Docker)

### Backend
```bash
python3.11 -m venv backend/.venv
source backend/.venv/bin/activate
pip install -r backend/requirements.txt
python backend/manage.py migrate
python backend/manage.py runserver 127.0.0.1:8000
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### Regenerating OpenAPI Specifications
To update `backend/openapi.yaml` and `frontend/src/api/openapi.json` from the backend schema:
```bash
backend/.venv/bin/python backend/manage.py spectacular --format openapi --file backend/openapi.yaml
backend/.venv/bin/python backend/manage.py spectacular --format openapi-json --file frontend/src/api/openapi.json
```
