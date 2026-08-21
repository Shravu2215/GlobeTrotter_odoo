export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent border-t-transparent" />
    </div>
  );
}