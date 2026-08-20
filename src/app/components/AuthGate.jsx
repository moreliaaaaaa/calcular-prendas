import { AuthScreen } from "@/features";
import { Toast } from "@/shared";

export function AuthGate({
  visible,
  message,
  messageType,
  loading,
  onLogin,
  onSignup,
  onRecover,
  onPasswordUpdate,
  passwordResetMode,
  initialCountry,
  toast,
}) {
  return (
    <>
      <AuthScreen
        visible={visible}
        message={message}
        messageType={messageType}
        loading={loading}
        onLogin={onLogin}
        onSignup={onSignup}
        onRecover={onRecover}
        onPasswordUpdate={onPasswordUpdate}
        passwordResetMode={passwordResetMode}
        initialCountry={initialCountry}
      />
      <Toast toast={toast} />
    </>
  );
}
