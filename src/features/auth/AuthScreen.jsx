import { useState } from "react";
import { COUNTRY_OPTIONS, getUiText } from "@/app/lib/auth.js";
import { icon } from "@/shared/assets/icons.js";
import "@/styles/modules/auth.css";

const createEmptyForm = () => ({
  name: "",
  email: "",
  password: "",
  country: "CL",
});

export function AuthScreen({
  visible,
  message,
  messageType,
  loading,
  onLogin,
  onSignup,
  onRecover,
}) {
  const [form, setForm] = useState(createEmptyForm);
  const [showPassword, setShowPassword] = useState(false);

  const t = (key) => getUiText(key, form.country);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm());
    setShowPassword(false);
  };

  const handleLogin = () => {
    onLogin(form, resetForm);
  };

  const handleSignup = () => {
    onSignup(form, resetForm);
  };

  const handleRecover = () => {
    onRecover(form, resetForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    handleLogin();
  };

return (
  <div
    id="auth-screen"
    className={`auth-screen ${visible ? "" : "hidden"}`}
    aria-hidden={!visible}
  >
    <div className="auth-card">
      <div className="auth-hero">
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
      </div>

      <div className="auth-heading">
        <h2>Bienvenido de nuevo</h2>
        <p className="auth-copy">
          Ingresa a tu cuenta para continuar
        </p>
      </div>

      <form
        id="auth-form"
        className="auth-form"
        noValidate
        onSubmit={handleSubmit}
      >
        <label className="auth-field">
          <span>{t("authName")}</span>

          <input
            id="auth-name"
            name="name"
            type="text"
            autoComplete="name"
            maxLength={100}
            value={form.name}
            onChange={(event) =>
              updateField("name", event.target.value)
            }
          />
        </label>

        <label className="auth-field">
          <span>{t("authEmail")}</span>

          <input
            id="auth-email"
            name="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            required
            value={form.email}
            onChange={(event) =>
              updateField("email", event.target.value)
            }
          />
        </label>

        <label className="auth-field">
          <span>{t("authCountry")}</span>

          <select
            id="auth-country"
            name="country"
            value={form.country}
            onChange={(event) =>
              updateField("country", event.target.value)
            }
          >
            {COUNTRY_OPTIONS.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <label className="auth-field">
          <span>{t("authPassword")}</span>

          <div className="password-wrapper">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              minLength={6}
              maxLength={128}
              spellCheck={false}
              required
              value={form.password}
              onChange={(event) =>
                updateField("password", event.target.value)
              }
            />

            <button
              id="toggle-password-btn"
              className="toggle-password-btn"
              type="button"
              aria-label={
                showPassword
                  ? t("authPasswordHide")
                  : t("authPasswordShow")
              }
              aria-pressed={showPassword}
              onClick={() =>
                setShowPassword((current) => !current)
              }
            >
              <img
                id="password-icon"
                src={
                  showPassword
                    ? icon("visibility")
                    : icon("eye_close")
                }
                alt=""
                width={24}
                height={24}
                aria-hidden="true"
              />
            </button>
          </div>
        </label>

        <p
          id="auth-message"
          className={`auth-message ${
            messageType ? `is-${messageType}` : ""
          }`}
          role="status"
          aria-live="polite"
        >
          {message}
        </p>

        <button
          id="login-btn"
          className="auth-btn auth-btn-primary"
          type="submit"
          disabled={loading}
        >
          {t("authLogin")}
        </button>

        <button
          id="recover-password-btn"
          className="auth-recover-btn"
          type="button"
          disabled={loading}
          onClick={handleRecover}
        >
          {t("authRecover")}
        </button>

        <div className="auth-divider">
          <span>o</span>
        </div>

        <div className="auth-signup-section">
          <p>¿No tienes una cuenta?</p>

          <button
            id="signup-btn"
            className="auth-btn auth-btn-secondary"
            type="button"
            disabled={loading}
            onClick={handleSignup}
          >
            Crear cuenta
          </button>
        </div>
      </form>
    </div>
  </div>
);}
