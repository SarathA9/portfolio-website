/**
 * Static CSS glow + grid layer. Renders behind the WebGL particle field
 * and acts as a graceful fallback if WebGL is unavailable.
 */
export default function Aurora() {
  return (
    <div className="aurora" aria-hidden>
      <div className="aurora-grid" />
    </div>
  );
}
