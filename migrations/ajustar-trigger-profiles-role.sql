-- Impede criação de administradores via signup público
-- Mantém papel informado, exceto quando for 'admin'

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  role_meta TEXT;
  nome_meta TEXT;
  role_final TEXT;
BEGIN
  role_meta := NEW.raw_user_meta_data->>'role';
  nome_meta := COALESCE(NEW.raw_user_meta_data->>'nome', NEW.email);

  IF role_meta = 'admin' THEN
    role_final := 'aluno';
  ELSE
    role_final := COALESCE(role_meta, 'aluno');
  END IF;

  INSERT INTO public.profiles (id, nome, role)
  VALUES (
    NEW.id,
    nome_meta,
    role_final
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


