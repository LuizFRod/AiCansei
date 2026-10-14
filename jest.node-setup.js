// Polyfill Web APIs that jsdom does not provide but Next.js server code needs.
// This file is loaded via setupFiles (before the test framework).

if (typeof globalThis.Request === "undefined") {
  globalThis.Request = class Request {
    constructor(input, init) {
      this._url = typeof input === "string" ? input : input?.url ?? "";
      this.method = init?.method ?? "GET";

      // Build a proper Headers-like object
      const hdrs = init?.headers;
      if (hdrs instanceof Map || hdrs instanceof globalThis.Headers) {
        this.headers = new Map(hdrs);
      } else if (hdrs && typeof hdrs === "object") {
        this.headers = new Map(Object.entries(hdrs));
      } else {
        this.headers = new Map();
      }

      this._body = init?.body ?? null;
      this._cachedJson = null;

      // Build nextUrl as a URL so NextRequest.nextUrl.searchParams works
      try {
        this.nextUrl = new URL(this._url || "http://localhost");
      } catch {
        this.nextUrl = new URL("http://localhost");
      }
    }
    get url() { return this._url; }
    async json() {
      if (this._cachedJson) return this._cachedJson;
      if (typeof this._body === "string") {
        this._cachedJson = JSON.parse(this._body);
        return this._cachedJson;
      }
      return {};
    }
  };
}

if (typeof globalThis.Response === "undefined") {
  globalThis.Response = class Response {
    constructor(body, init) {
      this._body = body;
      this.status = init?.status ?? 200;
      this.statusText = init?.statusText ?? "OK";
      this.ok = this.status >= 200 && this.status < 300;
      this.bodyUsed = false;
      this.redirected = false;
      this.type = "basic";

      const hdrs = init?.headers;
      if (hdrs instanceof Map || hdrs instanceof globalThis.Headers) {
        this.headers = new Map(hdrs);
      } else if (hdrs && typeof hdrs === "object") {
        this.headers = new Map(Object.entries(hdrs));
      } else {
        this.headers = new Map();
      }
    }
    get body() { return this._body; }
    static json(body, init) {
      const hdrs = new Map([["content-type", "application/json"]]);
      const initHeaders = init?.headers;
      if (initHeaders instanceof Map) {
        for (const [k, v] of initHeaders) hdrs.set(k, v);
      } else if (initHeaders && typeof initHeaders === "object") {
        for (const [k, v] of Object.entries(initHeaders)) hdrs.set(k, v);
      }
      return new Response(typeof body === "string" ? body : JSON.stringify(body), {
        status: init?.status ?? 200,
        headers: hdrs,
      });
    }
    async json() {
      if (typeof this._body === "string") return JSON.parse(this._body);
      return this._body;
    }
    async text() {
      if (typeof this._body === "string") return this._body;
      return JSON.stringify(this._body);
    }
  };
}

if (typeof globalThis.Headers === "undefined") {
  globalThis.Headers = class Headers extends Map {};
}
