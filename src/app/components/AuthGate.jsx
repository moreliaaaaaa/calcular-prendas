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
      />
      <Toast toast={toast} />
    </>
  );
}
