export default function DetailEnv() {
  return (
    <div>
      <h3>Preview do .env</h3>
      <pre>
{`DB_HOST=localhost
DB_PORT=5432
…`}
      </pre>
    </div>
  );
}
