# Performance Testing Automation in Kubernetes

Этот проект демонстрирует автоматизацию нагрузочного тестирования микросервисов в Kubernetes с использованием k6, сбор метрик в InfluxDB, визуализацию в Grafana и интеграцию с CI/CD (GitHub Actions).

## Цель

Обеспечить непрерывный контроль производительности приложения при каждом изменении кода, предотвращая деплой версий, ухудшающих производительность.

## Технологии

- Kubernetes (kind для локального тестирования)
- k6 – нагрузочное тестирование
- InfluxDB – хранение метрик тестов
- Prometheus – мониторинг кластера
- Grafana – визуализация
- GitHub Actions – CI/CD

## Как это работает

1. При пуше в main (или создании PR) запускается GitHub Actions workflow.
2. Workflow создаёт временный кластер kind, разворачивает тестовое приложение и InfluxDB.
3. Запускается нагрузочный тест k6, который отправляет метрики в InfluxDB.
4. k6 проверяет пороговые значения (latency, error rate) – если они превышены, пайплайн завершается с ошибкой.
5. Визуализация трендов производительности доступна в Grafana (дашборд импортируется через configmap).

## Запуск локально

### Предварительные требования

- Docker, kind, kubectl, helm, k6 (опционально)
- Git

### Шаги

1. Клонируйте репозиторий:

   ```bash
   git clone <url>
   cd performance-testing-project
   ```
2. Создайте кластер kind:

   ```kind
   kind create cluster
   ```
3. Установите мониторинг (Prometheus/Grafana) через Helm:

```
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm install prometheus prometheus-community/kube-prometheus-stack -f monitoring/prometheus/values.yaml
```

4. Разверните тестовое приложение и InfluxDB:

```
kubectl apply -f app/namespace.yaml
kubectl apply -f app/deployment.yaml
kubectl apply -f app/service.yaml
kubectl apply -f monitoring/influxdb/deployment.yaml
```

5. Запустите тест вручную:

```
kubectl port-forward -n performance-test svc/influxdb 8086:8086 &
k6 run --out influxdb=http://localhost:8086/k6?token=mytoken&org=myorg&bucket=k6 k6-tests/script.js
```

6. Импортируйте дашборд в Grafana
