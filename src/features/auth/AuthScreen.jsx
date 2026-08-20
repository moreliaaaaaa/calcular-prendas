import { useEffect, useState } from "react";
import { COUNTRY_OPTIONS, getUiText } from "@/app/lib/auth.js";
import { icon } from "@/shared/assets/icons.js";
import "@/styles/modules/auth.css";

const createEmptyForm = (country = "CL") => ({
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
  country,
});

export function AuthScreen({
  visible,
  message,
  messageType,
  loading,
  onLogin,
  onSignup,
  onRecover,
  onPasswordUpdate,
  passwordResetMode = false,
  initialCountry = "CL",
}) {
  const [form, setForm] = useState(() => createEmptyForm(initialCountry));
  const [showPassword, setShowPassword] = useState(false);

  const t = (key) => getUiText(key, form.country);

  useEffect(() => {
    setForm((current) => ({
      ...current,
      country: initialCountry || "CL",
    }));
  }, [initialCountry]);

  const updateField = (field, value) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const resetForm = () => {
    setForm(createEmptyForm(initialCountry));
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

  const handlePasswordUpdate = () => {
    onPasswordUpdate?.(form, resetForm);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (passwordResetMode) {
      handlePasswordUpdate();
      return;
    }
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
        <h2>{passwordResetMode ? t("authResetTitle") : t("authWelcomeBack")}</h2>
        <p className="auth-copy">
          {passwordResetMode ? t("authResetCopy") : t("authContinueCopy")}
        </p>
      </div>

      <form
        id="auth-form"
        className="auth-form"
        noValidate
        onSubmit={handleSubmit}
      >
        {!passwordResetMode && (
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
        )}

        {!passwordResetMode && (
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
        )}

        {!passwordResetMode && (
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
        )}

        <label className="auth-field">
          <span>{t("authPassword")}</span>

          <div className="password-wrapper">
            <input
              id="auth-password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete={passwordResetMode ? "new-password" : "current-password"}
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

        {passwordResetMode && (
          <label className="auth-field">
            <span>{t("authConfirmPassword")}</span>

            <input
              id="auth-confirm-password"
              name="confirmPassword"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              minLength={6}
              maxLength={128}
              spellCheck={false}
              required
              value={form.confirmPassword}
              onChange={(event) =>
                updateField("confirmPassword", event.target.value)
              }
            />
          </label>
        )}

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
          {passwordResetMode ? t("authResetSubmit") : t("authLogin")}
        </button>

        {!passwordResetMode && (
        <button
          id="recover-password-btn"
          className="auth-recover-btn"
          type="button"
          disabled={loading}
          onClick={handleRecover}
        >
          {t("authRecover")}
        </button>
        )}

        {!passwordResetMode && (
        <>
        <div className="auth-divider">
          <span>{t("authOr")}</span>
        </div>

        <div className="auth-signup-section">
          <p>{t("authNoAccount")}</p>

          <button
            id="signup-btn"
            className="auth-btn auth-btn-secondary"
            type="button"
            disabled={loading}
            onClick={handleSignup}
          >
            {t("authSignupAction")}
          </button>
        </div>
        </>
        )}
      </form>
    </div>
  </div>
);}
