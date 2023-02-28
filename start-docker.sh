docker run -d --rm --name influxdb-dev -p 8086:8086 \
      -e DOCKER_INFLUXDB_INIT_MODE=setup \
      -e DOCKER_INFLUXDB_INIT_USERNAME=fvanwijk \
      -e DOCKER_INFLUXDB_INIT_PASSWORD=Esgff3uxXPMB3X \
      -e DOCKER_INFLUXDB_INIT_ORG=Home \
      -e DOCKER_INFLUXDB_INIT_BUCKET=weather \
      -e DOCKER_INFLUXDB_INIT_ADMIN_TOKEN="FbYesKdKDn9VHelD4aQw9o7rrnxtKeC8jDiOrn9sF1i23Ucnm9JREd-YPvkH94N7DnHz1M6gNXS4nA1VN0qorA==" \
		influxdb:2.6.1