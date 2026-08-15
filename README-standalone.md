# Anima RAG standalone server

This wrapper lets the original SillyTavern server plugin run as an independent HTTP service.

## Routes

- Health: `GET /health`
- Plugin-compatible API: `/api/plugins/anima-rag/*`

The original plugin router is mounted unchanged, so existing frontend requests such as `/insert`, `/query`, `/list`, `/bm25/list`, `/import_collection`, and `/proxy/forward` keep the same relative paths under `/api/plugins/anima-rag`.

## Environment variables

- `PORT`: listen port. Default: `8787`
- `HOST`: listen host. Default: `0.0.0.0`
- `API_PREFIX`: plugin API prefix. Default: `/api/plugins/anima-rag`
- `ANIMA_RAG_TOKEN`: optional bearer token required for business APIs
- `CORS_ORIGIN`: comma-separated allowed origins, or `*`. Default: `*`
- `JSON_LIMIT`: Express body limit. Default: `100mb`

## Docker

```bash
docker build -t anima-rag:latest .
docker run -d \
  --name anima-rag \
  -p 8787:8787 \
  -e ANIMA_RAG_TOKEN=change-me \
  -v anima-rag-vectors:/app/vectors \
  -v anima-rag-data:/app/data \
  anima-rag:latest
```
