import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { LoginPage } from "./login-page";

const navigateMock = vi.fn();
const loginMock = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual<typeof import("react-router-dom")>(
    "react-router-dom",
  );
  return { ...actual, useNavigate: () => navigateMock };
});

vi.mock("@/providers/auth-provider", () => ({
  useAuth: () => ({ login: loginMock, logout: vi.fn(), user: null, loading: false }),
}));

function renderLoginPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  );
}

describe("LoginPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
  });

  it("renderiza o form com os campos de email e senha vazios", () => {
    renderLoginPage();

    expect(screen.getByLabelText("E-mail")).toHaveValue("");
    expect(screen.getByLabelText("Senha")).toHaveValue("");
  });

  it("faz login com sucesso e navega para a home", async () => {
    loginMock.mockResolvedValueOnce(undefined);
    renderLoginPage();

    await userEvent.type(screen.getByLabelText("E-mail"), "usuario@teste.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-do-usuario");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith(
        "usuario@teste.com",
        "senha-do-usuario",
        undefined,
      );
    });
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
    });
  });

  it("exibe a mensagem de erro quando o login falha", async () => {
    loginMock.mockRejectedValueOnce({
      response: { data: { detail: "E-mail ou senha invalidos" } },
    });
    renderLoginPage();

    await userEvent.type(screen.getByLabelText("E-mail"), "usuario@teste.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-errada");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByText("E-mail ou senha invalidos")).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("exibe o campo de codigo 2FA quando o erro menciona 2FA", async () => {
    loginMock.mockRejectedValueOnce({
      response: { data: { detail: "Codigo 2FA obrigatorio" } },
    });
    renderLoginPage();

    await userEvent.type(screen.getByLabelText("E-mail"), "usuario@teste.com");
    await userEvent.type(screen.getByLabelText("Senha"), "senha-do-usuario");
    await userEvent.click(screen.getByRole("button", { name: /entrar/i }));

    expect(await screen.findByLabelText("Código 2FA")).toBeInTheDocument();
  });
});
