import { createClient } from '@supabase/supabase-js';

// Tenta pegar com NEXT_PUBLIC_ ou sem, garantindo que o sinal chegue
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

// Validação técnica de bancada antes de ligar o circuito
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("⚠️ Alerta técnico: Chaves de conexão do Supabase não foram encontradas nas variáveis de ambiente!");
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder'
);
