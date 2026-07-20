import { useState } from "react";
import { COUNTRY_OPTIONS, getUiText } from "@/app/lib/auth.js";
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
  const buildEmptyForm = () => ({
    name: "",
    email: "",
    password: "",
    country: "CL",
  });
  const [form, setForm] = useState(buildEmptyForm);
  const [showPassword, setShowPassword] = useState(false);
  const language = getUiText("authWelcome", form.country) === "Bem-vindo" ? "pt" : "es";
  const t = (key) => getUiText(key, form.country);

  const update = (field, value) =>
    setForm((current) => ({ ...current, [field]: value }));
  const resetForm = () => setForm(buildEmptyForm());
  const submitLogin = () => onLogin(form, resetForm);
  const submitSignup = () => onSignup(form, resetForm);
  const submitRecover = () => onRecover(form, resetForm);

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

        <p className="auth-copy">{t("authCopy")}</p>

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
            <span>{t("authName")}</span>
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
            <span>{t("authEmail")}</span>
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
            <span>{t("authCountry")}</span>
            <select
              id="auth-country"
              name="country"
              value={form.country}
              onChange={(event) => update("country", event.target.value)}
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
                  showPassword ? t("authPasswordHide") : t("authPasswordShow")
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
              {t("authLogin")}
            </button>
            <button
              id="signup-btn"
              className="auth-btn auth-btn-secondary"
              type="button"
              disabled={loading}
              onClick={submitSignup}
              >
                {t("authSignup")}
              </button>
          </div>

          <button
            id="recover-password-btn"
            className="auth-recover-btn"
            type="button"
            disabled={loading}
            onClick={submitRecover}
          >
            {t("authRecover")}
          </button>
        </form>
      </div>
    </div>
  );
}
