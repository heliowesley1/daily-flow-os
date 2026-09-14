import { useEffect, useState, type ReactNode } from "react";
import { ArrowRight, LockKeyhole, Sparkles, Loader2 } from "lucide-react";
import { api, remoteEnabled, type Session } from "@/services/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/workspace/shared";

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  useEffect(() => {
    if (remoteEnabled)
      api<Session>("session")
        .then(setSession)
        .catch((e) => setError(e.message));
  }, []);
  if (!remoteEnabled || session?.authenticated) return <>{children}</>;
  return (
    <div className="auth-screen">
      <aside className="auth-brand-panel">
        <div className="flex items-center gap-3 text-xl font-semibold">
          <Sparkles size={26} />
          daily flow <span className="text-xs opacity-60">OS</span>
        </div>
        <div>
          <h1>
            Sua vida merece
            <br />
            um pouco mais
            <br />
            de espaço.
          </h1>
          <p>Rotina, ideias e planos. Juntos em um lugar que é só seu, no seu ritmo.</p>
        </div>
        <footer className="text-xs opacity-60">MENOS RUÍDO. MAIS VIDA ACONTECENDO.</footer>
      </aside>
      <main className="auth-form-panel">
        <section className="auth-form">
          <span className="flow-logo mb-6">
            <LockKeyhole size={20} />
          </span>
          <h2>{session?.setupRequired ? "Vamos criar seu espaço." : "Bom ter você de volta."}</h2>
          <p>
            {session?.setupRequired
              ? "Configure a conta administradora da sua instalação."
              : "Entre para continuar de onde parou."}
          </p>
          {!session && !error ? (
            <p className="flex gap-2">
              <Loader2 className="animate-spin" size={17} />
              Conectando ao seu espaço…
            </p>
          ) : (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!session) return;
                setBusy(true);
                setError("");
                try {
                  const result = await api<Session>(session.setupRequired ? "setup" : "login", {
                    method: "POST",
                    body: { email, password, name, setupKey: key },
                  });
                  setSession(result);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Não foi possível entrar.");
                } finally {
                  setBusy(false);
                }
              }}
            >
              {session?.setupRequired && (
                <>
                  <Field label="Seu nome">
                    <Input
                      autoComplete="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      maxLength={100}
                    />
                  </Field>
                  <Field label="Chave de instalação">
                    <Input
                      type="password"
                      value={key}
                      onChange={(e) => setKey(e.target.value)}
                      required
                      placeholder="Definida no config.php"
                    />
                  </Field>
                </>
              )}
              <Field label="E-mail">
                <Input
                  type="email"
                  autoComplete="username"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  maxLength={190}
                />
              </Field>
              <Field label="Senha">
                <Input
                  type="password"
                  autoComplete={session?.setupRequired ? "new-password" : "current-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={session?.setupRequired ? 12 : 1}
                  maxLength={72}
                  placeholder={session?.setupRequired ? "Pelo menos 12 caracteres" : "Sua senha"}
                />
              </Field>
              {error && (
                <div className="auth-error" role="alert">
                  {error}
                </div>
              )}
              <Button type="submit" disabled={busy || !session} className="w-full mt-2">
                {busy ? (
                  <Loader2 className="animate-spin" size={17} />
                ) : (
                  <>
                    {session?.setupRequired ? "Criar meu espaço" : "Entrar no meu espaço"}
                    <ArrowRight size={16} />
                  </>
                )}
              </Button>
              {!session && (
                <Button type="button" variant="outline" onClick={() => location.reload()}>
                  Tentar novamente
                </Button>
              )}
            </form>
          )}
          <footer>
            <LockKeyhole size={11} className="inline mr-1" />
            Acesso privado. Seus dados no seu servidor.
          </footer>
        </section>
      </main>
    </div>
  );
}
