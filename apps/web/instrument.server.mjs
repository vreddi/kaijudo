// Lazy import Sentry to avoid ESM/CommonJS conflicts during config loading
const sentryDsn = process.env.VITE_SENTRY_DSN;

if (sentryDsn) {
  import("@sentry/tanstackstart-react")
    .then((Sentry) => {
      Sentry.init({
        dsn: sentryDsn,
        // Adds request headers and IP for users, for more info visit:
        // https://docs.sentry.io/platforms/javascript/guides/tanstackstart-react/configuration/options/#sendDefaultPii
        sendDefaultPii: true,
      });
    })
    .catch(() => {
      // Sentry initialization failed, continue without it
    });
}
