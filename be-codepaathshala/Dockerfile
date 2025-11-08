FROM python:3.11-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install build dependencies for packages like numpy, pandas and postgres client
RUN apt-get update && apt-get install -y --no-install-recommends \
	build-essential \
	gcc \
	g++ \
	gfortran \
	libatlas-base-dev \
	libopenblas-dev \
	liblapack-dev \
	libpq-dev \
	curl \
	&& rm -rf /var/lib/apt/lists/*

COPY pyproject.toml ./ || true
COPY requirements.txt ./

RUN pip install --upgrade pip setuptools wheel --no-cache-dir
RUN pip install -r requirements.txt --no-cache-dir

# Copy project
COPY . .

RUN chmod +x /app/entrypoint.sh || true

EXPOSE 8000

ENTRYPOINT ["/app/entrypoint.sh"]