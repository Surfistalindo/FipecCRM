import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it } from "vitest";

import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, apiErrorMessage, tokenStore } from "./api";

function makeAxiosError(data: unknown): AxiosError {
  return new AxiosError(
    "Request failed",
    "ERR_BAD_REQUEST",
    undefined,
    undefined,
    {
      status: 422,
      statusText: "Unprocessable Entity",
      headers: new AxiosHeaders(),
      config: { headers: new AxiosHeaders() },
      data,
    } as never,
  );
}

describe("apiErrorMessage", () => {
  it("extrai o detail quando e' uma string", () => {
    const err = makeAxiosError({ detail: "E-mail ou senha invalidos" });
    expect(apiErrorMessage(err)).toBe("E-mail ou senha invalidos");
  });

  it("extrai a primeira mensagem quando detail e' uma lista de validacao", () => {
    const err = makeAxiosError({ detail: [{ msg: "campo obrigatorio" }] });
    expect(apiErrorMessage(err)).toBe("campo obrigatorio");
  });

  it("retorna o fallback quando nao ha detail reconhecivel", () => {
    const err = makeAxiosError({});
    expect(apiErrorMessage(err, "Falha no login")).toBe("Falha no login");
  });

  it("usa o fallback padrao quando nenhum e' informado", () => {
    const err = makeAxiosError({});
    expect(apiErrorMessage(err)).toBe("Ocorreu um erro");
  });
});

describe("tokenStore", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("set/get/clear funcionam com localStorage", () => {
    expect(tokenStore.access).toBeNull();
    expect(tokenStore.refresh).toBeNull();

    tokenStore.set("access-token-123", "refresh-token-456");

    expect(tokenStore.access).toBe("access-token-123");
    expect(tokenStore.refresh).toBe("refresh-token-456");
    expect(localStorage.getItem(ACCESS_TOKEN_KEY)).toBe("access-token-123");
    expect(localStorage.getItem(REFRESH_TOKEN_KEY)).toBe("refresh-token-456");

    tokenStore.clear();

    expect(tokenStore.access).toBeNull();
    expect(tokenStore.refresh).toBeNull();
  });
});
