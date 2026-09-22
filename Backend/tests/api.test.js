import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import { getCache, setCache, clearCachePattern, flushAllCache, getCacheStats } from "../utils/cache.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { resolveUserId } from "../controller/user.controller.js";

describe("Backend API & Utility Unit Tests", () => {
  beforeEach(() => {
    flushAllCache();
  });

  describe("In-Memory Cache Utility", () => {
    it("should set and retrieve values from cache", () => {
      setCache("test_key", { name: "E-System Product" }, 60);
      const cached = getCache("test_key");
      expect(cached).toEqual({ name: "E-System Product" });
    });

    it("should clear cache matching specific pattern", () => {
      setCache("/product/123", { id: "123" });
      setCache("/product/456", { id: "456" });
      setCache("/user/789", { id: "789" });

      clearCachePattern("/product");

      expect(getCache("/product/123")).toBeUndefined();
      expect(getCache("/product/456")).toBeUndefined();
      expect(getCache("/user/789")).toEqual({ id: "789" });
    });

    it("should flush all cache items", () => {
      setCache("key1", "val1");
      setCache("key2", "val2");
      flushAllCache();

      expect(getCache("key1")).toBeUndefined();
      expect(getCache("key2")).toBeUndefined();
    });

    it("should return valid cache statistics", () => {
      const stats = getCacheStats();
      expect(stats).toBeDefined();
      expect(typeof stats.keys).toBe("number");
    });
  });

  describe("Express Server Endpoints", () => {
    it("GET / should return server running status", async () => {
      const res = await request(app).get("/");
      expect(res.statusCode).toBe(200);
      expect(res.text).toBe("server is running");
    });

    it("GET /api/v1/cache/stats should return cache statistics", async () => {
      const res = await request(app).get("/api/v1/cache/stats");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Cache statistics");
      expect(res.body.stats).toBeDefined();
    });

    it("POST /api/v1/cache/flush should flush backend cache", async () => {
      setCache("sample_key", "sample_val");
      const res = await request(app).post("/api/v1/cache/flush");
      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Cache flushed successfully");
      expect(getCache("sample_key")).toBeUndefined();
    });
  });

  describe("Auth Middleware Verification", () => {
    it("should reject request without Authorization header", () => {
      const req = { headers: {} };
      let statusCode = null;
      let jsonBody = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (body) => {
              jsonBody = body;
            },
          };
        },
      };

      AuthMiddleware(req, res, () => {});

      expect(statusCode).toBe(401);
      expect(jsonBody.message).toBe("Authorization header missing");
    });

    it("should reject request with invalid JWT token", () => {
      const req = { headers: { authorization: "Bearer invalid_token_xyz" } };
      let statusCode = null;
      let jsonBody = null;

      const res = {
        status: (code) => {
          statusCode = code;
          return {
            json: (body) => {
              jsonBody = body;
            },
          };
        },
      };

      AuthMiddleware(req, res, () => {});

      expect(statusCode).toBe(401);
      expect(jsonBody.message).toBe("Invalid or expired token");
    });
  });

  describe("User Controller & Route Fixes", () => {
    const validObjectId = "507f1f77bcf86cd799439011";

    it("resolveUserId should extract user id from Bearer token", () => {
      const token = jwt.sign({ id: validObjectId }, process.env.SECRET_ONE || "test_secret_1");
      const req = { headers: { authorization: `Bearer ${token}` } };
      const userId = resolveUserId(req);
      expect(userId).toBe(validObjectId);
    });

    it("resolveUserId should extract user id from cookies", () => {
      const token = jwt.sign({ id: validObjectId }, process.env.SECRET_TWO || "test_secret_2");
      const req = { cookies: { token } };
      const userId = resolveUserId(req);
      expect(userId).toBe(validObjectId);
    });

    it("resolveUserId should fallback to body userId", () => {
      const req = { body: { userId: validObjectId } };
      const userId = resolveUserId(req);
      expect(userId).toBe(validObjectId);
    });

    it("resolveUserId should return null if no token or id provided", () => {
      const req = { headers: {}, body: {} };
      const userId = resolveUserId(req);
      expect(userId).toBeNull();
    });

    it("POST /api/v1/userdata/changepassword should validate short password", async () => {
      const res = await request(app)
        .post("/api/v1/userdata/changepassword")
        .send({ oldPassword: "currentpassword", newPassword: "123" });
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toContain("at least 6 characters");
    });

    it("POST /api/v1/changepassword should reject when user not found / not logged in", async () => {
      const res = await request(app)
        .post("/api/v1/changepassword")
        .send({ oldPassword: "oldpassword123", newPassword: "newpassword123" });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("User not found");
    });

    it("PUT /api/v1/userdata/updateprofile should reject when user not found / not logged in", async () => {
      const res = await request(app)
        .put("/api/v1/userdata/updateprofile")
        .send({ name: "Updated Name" });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("User not found");
    });

    it("PUT /api/v1/edituser should route properly to editUser controller", async () => {
      const res = await request(app)
        .put("/api/v1/edituser")
        .send({ name: "Updated Name" });
      expect(res.statusCode).toBe(404);
      expect(res.body.message).toContain("User not found");
    });

    it("POST /api/v1/logout should clear cookies and return success", async () => {
      const res = await request(app)
        .post("/api/v1/logout")
        .set("Cookie", ["token=fake_token", "adminToken=fake_admin_token"]);
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("Logged out successfully");
    });
  });
});
