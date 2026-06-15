import { useState } from "react";
import { icon } from "@/shared/assets/icons.js";
import "@/styles/modules/auth.css";

export function AuthScreen({
  visible,
  message,
  messageType,
  loading,
  onLogin,
  onSignup,
  onRecover,
}) {
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const submitLogin = () =>
    onLogin(form, () => setForm({ name: "", email: "", password: "" }));
  const submitSignup = () =>
    onSignup(form, () => setForm({ name: "", email: "", password: "" }));
  const submitRecover = () =>
    onRecover(form, () => setForm({ name: "", email: "", password: "" }));

  return (
    <div
      id="auth-screen"
      className={`auth-screen ${visible ? "" : "hidden"}`}
      aria-hidden={!visible}
    >
      <div className="auth-card">
        <div className="auth-brand">
          <div className="auth-brand-row" aria-label="Morelia">
            <img
              className="auth-logo"
              src="/marca/logo-morelia.svg"
              alt=""
              aria-hidden="true"
            />
            <span className="auth-brand-name" aria-hidden="true">
              ORELIA
            </span>
          </div>
          
          <h2>Bienvenido</h2>
        </div>

        <p className="auth-copy">Crea tu cuenta o inicia sesión.</p>

        <form
          id="auth-form"
          className="auth-form"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            submitLogin();
          }}
        >
          <label className="auth-field">
            <span>Nombre</span>
            <input
              id="auth-name"
              name="name"
              type="text"
              autoComplete="name"
              maxLength="100"
              value={form.name}
              onChange={(event) => update("name", event.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Correo electrónico</span>
            <input
              id="auth-email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck="false"
              required
              value={form.email}
              onChange={(event) => update("email", event.target.value)}
            />
          </label>

          <label className="auth-field">
            <span>Contraseña</span>
            <div className="password-wrapper">
              <input
                id="auth-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                minLength="6"
                maxLength="128"
                spellCheck="false"
                required
                value={form.password}
                onChange={(event) => update("password", event.target.value)}
              />
              <button
                id="toggle-password-btn"
                className="toggle-password-btn"
                type="button"
                aria-label={
                  showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                }
                aria-pressed={showPassword}
                onClick={() => setShowPassword((value) => !value)}
              >
                <img
                  id="password-icon"
                  src={showPassword ? icon("visibility") : icon("eye_close")}
                  alt=""
                  width="24"
                  height="24"
                />
              </button>
            </div>
          </label>

          <p
            id="auth-message"
            className={`auth-message ${messageType ? `is-${messageType}` : ""}`}
            role="status"
            aria-live="polite"
          >
            {message}
          </p>

          <div className="auth-actions">
            <button
              id="login-btn"
              className="auth-btn auth-btn-primary"
              type="button"
              disabled={loading}
              onClick={submitLogin}
            >
              Iniciar sesión
            </button>
            <button
              id="signup-btn"
              className="auth-btn auth-btn-secondary"
              type="button"
              disabled={loading}
              onClick={submitSignup}
              >
                Registrarse
              </button>
          </div>

          <button
            id="recover-password-btn"
            className="auth-recover-btn"
            type="button"
            disabled={loading}
            onClick={submitRecover}
          >
            ¿Olvidaste tu contraseña?
          </button>
        </form>
      </div>
    </div>
  );
}
