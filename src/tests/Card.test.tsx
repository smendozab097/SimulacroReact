import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Card from "../components/Card";

describe("Card Component", () => {
  it("debe renderizar el título, subtítulo y contenido hijo correctamente", () => {
    render(
      <Card title="Título de Prueba" subtitle="Subtítulo de Prueba">
        <div>Contenido Hijo de Prueba</div>
      </Card>
    );

    // Verificar que el título y subtítulo se encuentren en el documento
    expect(screen.getByText("Título de Prueba")).toBeInTheDocument();
    expect(screen.getByText("Subtítulo de Prueba")).toBeInTheDocument();
    
    // Verificar que el contenido interno (children) se renderice
    expect(screen.getByText("Contenido Hijo de Prueba")).toBeInTheDocument();
  });
});
