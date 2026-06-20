import { verifySignedRemoteRuleBundle } from "@ai-mae-check/core";
import { describe, expect, it } from "vitest";
import { onRequest } from "../../../functions/api/rules/latest";

const keyId = "pages-function-test-key";

async function createKeyPair() {
  const pair = await crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  const privateJwk = await crypto.subtle.exportKey("jwk", pair.privateKey);
  const publicJwk = await crypto.subtle.exportKey("jwk", pair.publicKey);

  return { privateJwk, publicJwk };
}

describe("Pages Functions rule delivery route", () => {
  it("returns a signed rule bundle through the Pages route adapter", async () => {
    const { privateJwk, publicJwk } = await createKeyPair();
    const response = await onRequest({
      request: new Request("https://ai-mae-check.pages.dev/api/rules/latest"),
      env: {
        RULE_KEY_ID: keyId,
        RULE_SIGNING_PRIVATE_JWK: JSON.stringify(privateJwk)
      }
    });

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body: unknown = await response.json();
    const verification = await verifySignedRemoteRuleBundle(body, publicJwk, { expectedKeyId: keyId });

    expect(verification.ok).toBe(true);
    if (verification.ok) {
      expect(verification.payload.rules).toHaveLength(1);
    }
  });
});
