const express = require("express");
const cors = require("cors");
const { init, info } = require("./index");

const app = express();
const router = express.Router();

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || "0.0.0.0";
const API_PREFIX = process.env.API_PREFIX || "/api/plugins/anima-rag";
const AUTH_TOKEN = String(process.env.ANIMA_RAG_TOKEN || "").trim();
const JSON_LIMIT = process.env.JSON_LIMIT || "100mb";

function parseCorsOrigin() {
    const raw = String(process.env.CORS_ORIGIN || "*").trim();
    if (!raw || raw === "*") return true;
    return raw
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

const corsOptions = {
    origin: parseCorsOrigin(),
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Anima-Rag-Token", "X-Requested-With"],
    credentials: false,
};

function isAuthorized(req) {
    if (!AUTH_TOKEN) return true;

    const authHeader = String(req.headers.authorization || "").trim();
    const bearerToken = authHeader.replace(/^Bearer\s+/i, "").trim();
    const headerToken = String(req.headers["x-anima-rag-token"] || "").trim();

    return bearerToken === AUTH_TOKEN || headerToken === AUTH_TOKEN;
}

function healthPayload() {
    return {
        ok: true,
        service: info?.id || "anima-rag",
        name: info?.name || "Anima RAG",
        mode: "standalone",
        api_prefix: API_PREFIX,
        auth_enabled: Boolean(AUTH_TOKEN),
    };
}

app.disable("x-powered-by");
app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
app.use(express.json({ limit: JSON_LIMIT }));
app.use(express.urlencoded({ extended: true, limit: JSON_LIMIT }));

app.get("/", (_req, res) => {
    res.json(healthPayload());
});

app.get("/health", (_req, res) => {
    res.json(healthPayload());
});

router.get("/health", (_req, res) => {
    res.json(healthPayload());
});

router.use((req, res, next) => {
    if (req.method === "OPTIONS" || req.path === "/health") {
        return next();
    }

    if (isAuthorized(req)) {
        return next();
    }

    return res.status(401).json({
        error: "unauthorized",
        message: "Missing or invalid Anima RAG token",
    });
});

async function main() {
    await init(router);
    app.use(API_PREFIX, router);

    app.use((err, _req, res, _next) => {
        console.error("[Anima RAG] Unhandled server error:", err);
        res.status(500).json({
            error: "internal_server_error",
            message: err?.message || "Unknown server error",
        });
    });

    app.listen(PORT, HOST, () => {
        console.log(
            `[Anima RAG] Standalone server listening on http://${HOST}:${PORT}${API_PREFIX}`,
        );
    });
}

main().catch((error) => {
    console.error("[Anima RAG] Failed to start standalone server:", error);
    process.exit(1);
});
