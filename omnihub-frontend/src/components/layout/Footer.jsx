/**
 * Shared site footer for the public (unauthenticated) shells.
 */
export default function Footer() {
  return (
    <footer className="auth-footer">
      <span>© 2026 OmniHub, Inc.</span>
      <div>
        <a href="mailto:hello@omnihub.app">Help center</a>
        <span className="footer-dot">·</span>
        <a href="mailto:hello@omnihub.app">Privacy</a>
      </div>
    </footer>
  );
}