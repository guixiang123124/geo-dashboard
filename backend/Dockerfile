FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir google-genai python-dotenv

COPY . .

# Copy database if exists (for demo data)
COPY geo_dashboard.db /app/geo_dashboard.db

EXPOSE 8000

CMD ["uvicorn", "src.api.main:app", "--host", "0.0.0.0", "--port", "8000"]
