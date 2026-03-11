export default function LoadingButton({ loading, disabled, className = "", children, loadingText = "Saving…", ...props }) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`${className} ${(disabled || loading) ? "opacity-60" : ""}`}
    >
      {loading ? loadingText : children}
    </button>
  );
}
