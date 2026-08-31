import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MemoryRouter } from "react-router";
import { useAuth } from "../context/authContext";
import Login from "../pages/Login";

// Mock del hook useAuth
vi.mock("../context/authContext", () => ({
  useAuth: vi.fn(),
}));

describe("Login Component Integration Test", () => {
  it("debe permitir rellenar el formulario de login y hacer click en Iniciar Sesión llamando a la API", async () => {
    const mockLogin = vi.fn().mockResolvedValue(undefined);

    // Mock de los valores de retorno para useAuth en esta prueba
    vi.mocked(useAuth).mockReturnValue({
      user: null,
      loading: false,
      login: mockLogin,
      register: vi.fn(),
      logout: vi.fn(),
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>
    );

    // Localizar inputs por placeholder y botón de submit
    const emailInput = screen.getByPlaceholderText("ejemplo@correo.com");
    const passwordInput = screen.getByPlaceholderText("••••••••");
    const submitButton = screen.getByRole("button", { name: "Iniciar Sesión" });

    // Simular escritura del usuario
    fireEvent.change(emailInput, { target: { value: "sebas@example.com" } });
    fireEvent.change(passwordInput, { target: { value: "password123" } });

    // Simular clic en enviar formulario
    fireEvent.click(submitButton);

    // Esperar y verificar que la función de login fuera llamada con los parámetros correctos
    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: "sebas@example.com",
        password: "password123",
      });
    });
  });
});
