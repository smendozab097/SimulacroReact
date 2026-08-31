import { useState } from "react";
import { useNavigate, Link } from "react-router";
import { useAuth } from "../context/authContext";
import Card from "../components/Card";

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  // Estados del formulario
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [confirmPassword, setConfirmPassword] = useState<string>("");

  // Estados de control
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Enviar formulario de registro
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setValidationErrors([]);

    // Validación de seguridad local: confirmar contraseña
    if (password !== confirmPassword) {
      setErrorMsg("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }

    try {
      await register({ name, email, password });
      navigate("/"); // Redireccionar al catálogo
    } catch (err: any) {
      console.error("Register error:", err);
      // Extraer mensaje amigable de AppError
      setErrorMsg(err.friendlyMessage || "Ocurrió un error al registrar la cuenta.");
      if (err.validationErrors) {
        setValidationErrors(err.validationErrors);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-60px)] w-full bg-slate-50 flex items-center justify-center py-12 px-4">
      <Card
        title="Crear una cuenta"
        subtitle="Completa el formulario para registrarte en el sistema."
      >
        {/* Renderizado de errores generales */}
        {errorMsg && (
          <div className="mb-5 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="flex-grow">
              <p className="text-red-700 text-sm font-semibold leading-relaxed">{errorMsg}</p>
              {validationErrors.length > 0 && (
                <ul className="list-disc pl-4 mt-1 text-xs text-red-600 space-y-1">
                  {validationErrors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Campo Nombre */}
          <div className="space-y-1.5">
            <label htmlFor="reg-name-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Nombre completo
            </label>
            <input
              id="reg-name-input"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Sebastián Pérez"
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-800 px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none"
            />
          </div>

          {/* Campo Correo */}
          <div className="space-y-1.5">
            <label htmlFor="reg-email-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Correo electrónico
            </label>
            <input
              id="reg-email-input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ejemplo@correo.com"
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-800 px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none"
            />
          </div>

          {/* Campo Contraseña */}
          <div className="space-y-1.5">
            <label htmlFor="reg-password-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Contraseña
            </label>
            <input
              id="reg-password-input"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-800 px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none"
            />
          </div>

          {/* Campo Confirmar Contraseña */}
          <div className="space-y-1.5">
            <label htmlFor="reg-confirm-password-input" className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmar contraseña
            </label>
            <input
              id="reg-confirm-password-input"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repite tu contraseña"
              className="w-full bg-slate-50 border border-slate-200/80 focus:border-blue-500 focus:bg-white text-slate-800 px-4 py-3 rounded-2xl text-sm font-medium transition-all outline-none"
            />
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3.5 px-6 rounded-2xl tracking-wide transition-all shadow-md shadow-indigo-600/10 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none mt-2 cursor-pointer"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Creando cuenta...</span>
              </div>
            ) : (
              "Crear Cuenta"
            )}
          </button>
        </form>

        {/* Enlace para cambiar a Login */}
        <div className="text-center mt-6 pt-5 border-t border-slate-100">
          <p className="text-sm text-slate-500">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-blue-600 font-bold hover:underline">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Register;
